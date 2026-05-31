const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Create YouTube Video (Admin Only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    let { title, description, video_type, youtube_url, url, live_stream_url, subject } = req.body;

    const finalYoutubeUrl = youtube_url || url;
    const finalVideoType = String(video_type || 'recorded').toLowerCase();

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
      .from('videos')
      .insert([
        {
          id: uuidv4(),
          title,
          description,
          video_type: finalVideoType,
          youtube_url: finalVideoType === 'recorded' ? finalYoutubeUrl : null,
          live_stream_url: finalVideoType === 'live' ? live_stream_url : null,
          subject,
          uploaded_by: req.user.id,
          is_published: true
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Video created successfully', video: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Published Videos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter by subscribed subjects if user is a student
    if (req.user && req.user.role === 'student') {
      const { getSubscribedSubjects } = require('../utils/subscriptionHelper');
      const subscribedSubjects = getSubscribedSubjects(req.user.id, req.headers);
      
      const filtered = (data || []).filter(v => 
        subscribedSubjects.some(s => s.toLowerCase() === v.subject?.toLowerCase())
      );
      return res.json(filtered);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Videos for Admin (including unpublished)
router.get('/admin', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
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

// Get Video by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Security guard for students
    if (req.user && req.user.role === 'student') {
      const { isSubscribedToSubject } = require('../utils/subscriptionHelper');
      const isSubscribed = isSubscribedToSubject(req.user.id, data.subject, req.headers);
      if (!isSubscribed) {
        return res.status(403).json({ error: 'Access denied. You are not subscribed to this subject.' });
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Video (Admin Only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, is_published } = req.body;

    const { data, error } = await supabase
      .from('videos')
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
      return res.status(403).json({ error: 'Unauthorized to update this video' });
    }

    res.json({ message: 'Video updated successfully', video: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Video (Admin Only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', req.params.id)
      .eq('uploaded_by', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
