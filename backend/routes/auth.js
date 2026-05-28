const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const role = 'student'; // Force role to student for public registration

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          full_name,
          role
        }
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: data[0].id, email: data[0].email, role: data[0].role },
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
        const { v4: uuidv4 } = require('uuid');
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
    const { email, password } = req.body;

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

    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: { id: data.id, email: data.email, full_name: data.full_name, role: data.role },
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

    res.json(data);
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
      .select('id, full_name, email, role')
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
