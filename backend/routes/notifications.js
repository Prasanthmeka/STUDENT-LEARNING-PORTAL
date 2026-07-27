const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
// Get all notifications for the authenticated student
router.get('/', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching notifications from Supabase:', error.message);
      // Fallback to empty array if the notifications table does not exist yet (prevents API crash)
      return res.json([]);
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/mark-all-read
// Mark all notifications as read for the authenticated student
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('student_id', studentId)
      .eq('is_read', false)
      .select();

    if (error) {
      console.warn('Error marking all notifications read in Supabase:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'All notifications marked as read', updatedCount: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read
// Mark a specific notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const notificationId = req.params.id;
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('student_id', studentId)
      .select();

    if (error) {
      console.warn('Error marking notification read in Supabase:', error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Notification not found or access denied' });
    }

    res.json({ message: 'Notification marked as read', notification: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
