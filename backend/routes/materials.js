const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Upload Study Material (Admin Only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, file_name, github_url, file_type, subject } = req.body;

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
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
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
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Material not found' });
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
