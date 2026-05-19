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

module.exports = router;
