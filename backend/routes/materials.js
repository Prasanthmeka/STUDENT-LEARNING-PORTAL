const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Upload Study Material (Admin Only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    let { title, description, file_name, github_url, file_type, subject } = req.body;

    // Capitalize subject to match DB and UI filters
    if (subject) {
      const subLower = subject.toLowerCase();
      if (subLower === 'telugu') subject = 'Telugu';
      else if (subLower === 'hindi') subject = 'Hindi';
      else if (subLower === 'english') subject = 'English';
      else if (subLower === 'maths') subject = 'Maths';
      else if (subLower === 'physics') subject = 'Physics';
      else if (subLower === 'chemistry') subject = 'Chemistry';
      else if (subLower === 'biology') subject = 'Biology';
      else if (subLower === 'social' || subLower === 'social studies') subject = 'Social';
    }

    const { data, error } = await supabase
      .from('study_materials')
      .insert([
        {
          id: uuidv4(),
          title,
          description,
          file_name,
          github_url,
          file_type,
          subject,
          uploaded_by: req.user.id,
          is_published: true
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Study material created successfully', material: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Published Materials
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter by subscribed subjects if user is a student
    if (req.user && req.user.role === 'student') {
      const { getSubscribedSubjects } = require('../utils/subscriptionHelper');
      const subscribedSubjects = await getSubscribedSubjects(req.user.id, req.headers);
      
      const filtered = (data || []).filter(m => 
        subscribedSubjects.some(s => s.toLowerCase() === m.subject?.toLowerCase())
      );
      return res.json(filtered);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Materials for Admin (including unpublished)
router.get('/admin', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('uploaded_by', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy / Render external material content (restricted to GitHub hosts)
router.get('/render', async (req, res) => {
  try {
    let { url, id, token, subjects } = req.query;

    // Secure checking if id and token are provided (Student Workspace Download Link)
    if (id) {
      if (!token) return res.status(401).json({ error: 'Missing token query param' });

      const jwt = require('jsonwebtoken');
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
      } catch (e) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      const { data: material, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !material) {
        return res.status(404).json({ error: 'Material not found' });
      }

      // If student, check if they are subscribed to this subject
      if (decoded.role === 'student') {
        const { isSubscribedToSubject } = require('../utils/subscriptionHelper');
        const headersFallback = { 'x-subscribed-subjects': subjects };
        const isSubscribed = await isSubscribedToSubject(decoded.id, material.subject, headersFallback);
        if (!isSubscribed) {
          return res.status(403).json({ error: 'Access denied. You are not subscribed to this subject.' });
        }
      }

      url = material.github_url;
    }

    if (!url) return res.status(400).json({ error: 'Missing url or id query param' });

    const allowedHosts = ['github.com', 'raw.githubusercontent.com', 'gist.githubusercontent.com', 'githubusercontent.com'];
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid url' });
    }

    if (!allowedHosts.some(h => parsed.hostname.includes(h))) {
      return res.status(400).json({ error: 'Unsupported host' });
    }

    // Convert normal GitHub blob URLs to raw.githubusercontent.com
    let urlToFetch = url;
    if (parsed.hostname.includes('github.com')) {
      const parts = parsed.pathname.split('/');
      const blobIndex = parts.indexOf('blob');
      if (blobIndex !== -1) {
        const user = parts[1];
        const repo = parts[2];
        const branch = parts[4];
        const filePath = parts.slice(5).join('/');
        urlToFetch = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
      }
    }

    // Use global fetch (Node 18+).
    // Support HEAD requests from the frontend probe: return headers only.
    if (req.method === 'HEAD') {
      const headResp = await fetch(urlToFetch, { method: 'HEAD' });
      if (!headResp.ok) {
        return res.status(headResp.status).end();
      }
      const headContentType = headResp.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('content-type', headContentType);
      return res.status(200).end();
    }

    const resp = await fetch(urlToFetch);
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return res.status(resp.status).send(text || 'Failed to fetch resource');
    }

    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.setHeader('content-type', contentType);
    // Allow PDFs to render inline in iframes by suggesting inline disposition
    if (contentType.includes('pdf')) {
      res.setHeader('content-disposition', `inline; filename="${encodeURIComponent(parsed.pathname.split('/').pop() || 'file.pdf')}"`);
    } else {
      // For other types, default to attachment so browsers download
      res.setHeader('content-disposition', `attachment; filename="${encodeURIComponent(parsed.pathname.split('/').pop() || 'file')}"`);
    }
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Material by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Security guard for students
    if (req.user && req.user.role === 'student') {
      const { isSubscribedToSubject } = require('../utils/subscriptionHelper');
      const isSubscribed = await isSubscribedToSubject(req.user.id, data.subject, req.headers);
      if (!isSubscribed) {
        return res.status(403).json({ error: 'Access denied. You are not subscribed to this subject.' });
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Material (Admin Only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, is_published } = req.body;

    const { data, error } = await supabase
      .from('study_materials')
      .update({
        title,
        description,
        is_published,
        updated_at: new Date()
      })
      .eq('id', req.params.id)
      .eq('uploaded_by', req.user.id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(403).json({ error: 'Unauthorized to update this material' });
    }

    res.json({ message: 'Material updated successfully', material: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Material (Admin Only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', req.params.id)
      .eq('uploaded_by', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy / Render external material content (restricted to GitHub hosts)
router.get('/render', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url query param' });

    const allowedHosts = ['github.com', 'raw.githubusercontent.com', 'gist.githubusercontent.com', 'githubusercontent.com'];
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid url' });
    }

    if (!allowedHosts.some(h => parsed.hostname.includes(h))) {
      return res.status(400).json({ error: 'Unsupported host' });
    }

    // Convert normal GitHub blob URLs to raw.githubusercontent.com
    let urlToFetch = url;
    if (parsed.hostname.includes('github.com')) {
      const parts = parsed.pathname.split('/');
      const blobIndex = parts.indexOf('blob');
      if (blobIndex !== -1) {
        const user = parts[1];
        const repo = parts[2];
        const branch = parts[4];
        const filePath = parts.slice(5).join('/');
        urlToFetch = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
      }
    }

    // Use global fetch (Node 18+). Read as ArrayBuffer and stream to client.
    const resp = await fetch(urlToFetch);
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return res.status(resp.status).send(text || 'Failed to fetch resource');
    }

    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.setHeader('content-type', contentType);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
