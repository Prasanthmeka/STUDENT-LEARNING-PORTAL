const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Admin: Get all students
router.get('/all-students', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all users (for admin analytics)
router.get('/all-users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete student/user
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1. Delete student attempts (quiz_attempts)
    const { error: attemptsError } = await supabase
      .from('quiz_attempts')
      .delete()
      .eq('student_id', studentId);

    if (attemptsError) {
      console.warn('Failed to delete student quiz attempts:', attemptsError.message);
    }

    // 2. Delete student quiz permissions
    const { error: permError } = await supabase
      .from('quiz_permissions')
      .delete()
      .eq('student_id', studentId);

    if (permError) {
      console.warn('Failed to delete student quiz permissions:', permError.message);
    }

    // 3. Delete student subscriptions from Supabase
    const { error: subsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('student_id', studentId);

    if (subsError) {
      console.warn('Failed to delete student subscriptions:', subsError.message);
    }

    // 4. Finally delete the user/student
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', studentId);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    res.json({ message: 'Student and all related records deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
