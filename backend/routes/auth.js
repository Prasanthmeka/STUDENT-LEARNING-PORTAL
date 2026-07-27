const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../utils/supabase');
const { sendWelcomeEmail } = require('../utils/email');
const { createRegistrationNotification } = require('../utils/notificationHelper');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, class: userClass } = req.body;
    const role = 'student'; // Force role to student for public registration

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const sessionId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          full_name,
          role,
          class: userClass,
          current_session_id: sessionId
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: data[0].id, email: data[0].email, role: data[0].role, class: data[0].class, current_session_id: sessionId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Automatically grant permissions to all existing published quizzes for the newly registered student
    try {
      const { data: publishedQuizzes } = await supabase
        .from('quizzes')
        .select('id')
        .eq('is_published', true);

      if (publishedQuizzes && publishedQuizzes.length > 0) {
        const permissionsData = publishedQuizzes.map(quiz => ({
          id: uuidv4(),
          quiz_id: quiz.id,
          student_id: data[0].id,
          granted_at: new Date()
        }));

        const { error: permError } = await supabase
          .from('quiz_permissions')
          .insert(permissionsData);

        if (permError) {
          console.error('Error automatically enabling quizzes for new student:', permError);
        }
      }
    } catch (permErr) {
      console.error('Error in automatic quiz permission assignment during registration:', permErr);
    }

    // Asynchronously dispatch the student welcome confirmation email
    try {
      sendWelcomeEmail(data[0].email, data[0].full_name)
        .catch(err => console.error('Asynchronous welcome email dispatch failed:', err));
    } catch (emailErr) {
      console.error('Error in triggering welcome email:', emailErr);
    }

    // Asynchronously trigger registration notification for admin users
    try {
      createRegistrationNotification({ fullName: data[0].full_name, email: data[0].email })
        .catch(err => console.error('Asynchronous admin registration notification failed:', err));
    } catch (notifErr) {
      console.error('Error in triggering registration notification:', notifErr);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: data[0],
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password, loginType = 'courses' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, data.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionId = uuidv4();
    
    // Update current_session_id in database to invalidate other devices
    const { error: updateError } = await supabase
      .from('users')
      .update({ current_session_id: sessionId })
      .eq('id', data.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update session' });
    }

    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role, class: data.class, loginType, current_session_id: sessionId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: { id: data.id, email: data.email, full_name: data.full_name, role: data.role, loginType },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Enforce concurrent login check for students
    if (data.role === 'student' && data.current_session_id !== decoded.current_session_id) {
      return res.status(401).json({ error: 'Session invalidated. Logged in from another device.' });
    }

    res.json({
      ...data,
      loginType: decoded.loginType || 'courses'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, class')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, full_name, email, role');

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
