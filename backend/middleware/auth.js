const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Enforce concurrent login check for students
    if (user && user.role === 'student') {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('current_session_id')
          .eq('id', user.id)
          .single();

        if (error || !data || data.current_session_id !== user.current_session_id) {
          return res.status(401).json({ error: 'Session invalidated. Logged in from another device.' });
        }
      } catch (dbErr) {
        console.error('Session verification error:', dbErr);
        return res.status(500).json({ error: 'Internal server error during session verification' });
      }
    }

    req.user = user;
    next();
  });
};

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
