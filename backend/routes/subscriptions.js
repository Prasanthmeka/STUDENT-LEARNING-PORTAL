const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Create Subscription (Student)
router.post('/', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const { subscription_type = 'free' } = req.body;

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          id: uuidv4(),
          student_id: req.user.id,
          subscription_type,
          is_active: true,
          start_date: new Date()
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Subscription created successfully', subscription: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student's Subscription
router.get('/my-subscription', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('student_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upgrade Subscription
router.put('/:subscriptionId', authenticateToken, async (req, res) => {
  try {
    const { subscription_type } = req.body;

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        subscription_type,
        updated_at: new Date()
      })
      .eq('id', req.params.subscriptionId)
      .eq('student_id', req.user.id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ message: 'Subscription upgraded successfully', subscription: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
