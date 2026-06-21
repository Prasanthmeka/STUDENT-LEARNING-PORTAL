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

// Admin: Update student details and subscription
router.put('/:id/subscription', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const studentId = req.params.id;
    const { name, email, plan, status, subjects = [] } = req.body;

    // 1. Update user details
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: name,
        email: email,
        updated_at: new Date()
      })
      .eq('id', studentId);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // 2. Manage Subscription
    const subscription_type = plan === 'Premium Plan' ? 'premium' : 'free';
    const plan_name = plan === 'Premium Plan' ? 'Monthly Premium' : 'Free Trial';
    
    // Calculate dates
    const start = new Date();
    const end = new Date(start);
    if (plan === 'Premium Plan') {
      end.setMonth(start.getMonth() + 1); // Default to monthly if admin edits
    } else {
      end.setDate(start.getDate() + 14); // 14 days for Free Trial
    }
    
    // If status is expired, make the end_date yesterday so it is expired
    if (status === 'Expired') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      end.setTime(yesterday.getTime());
    }

    // Check if there is an existing subscription
    const { data: existing, error: existError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('student_id', studentId)
      .limit(1);

    if (existError) {
      return res.status(400).json({ error: existError.message });
    }

    let subscriptionResult;
    if (existing && existing.length > 0) {
      // Update existing subscription
      const { data: updateData, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          subscription_type,
          end_date: status === 'Expired' ? end : (subscription_type === 'premium' ? end : null),
          is_active: status === 'Active' || status === 'Free Trial',
          plan_name,
          subscribed_subjects: subjects
        })
        .eq('id', existing[0].id)
        .select();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }
      subscriptionResult = updateData?.[0];
    } else {
      // Create new subscription
      const { data: insertData, error: insertError } = await supabase
        .from('subscriptions')
        .insert([
          {
            student_id: studentId,
            subscription_type,
            is_active: status === 'Active' || status === 'Free Trial',
            start_date: start,
            end_date: status === 'Expired' ? end : (subscription_type === 'premium' ? end : null),
            plan_name,
            subscribed_subjects: subjects
          }
        ])
        .select();

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }
      subscriptionResult = insertData?.[0];
    }

    res.json({
      message: 'Student subscription updated successfully',
      student: {
        id: studentId,
        name,
        email,
        plan,
        status,
        subjects,
        expiryDate: end.toLocaleDateString()
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
