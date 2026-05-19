const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Create YouTube Video (Admin Only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, video_type, youtube_url, live_stream_url, subject } = req.body;

    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          id: uuidv4(),
          title,
          description,
          video_type,
          youtube_url: video_type === 'recorded' ? youtube_url : null,
          live_stream_url: video_type === 'live' ? live_stream_url : null,
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
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
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
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Video not found' });
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
