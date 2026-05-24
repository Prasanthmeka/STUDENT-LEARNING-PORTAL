const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const materialRoutes = require('./routes/materials');
const quizRoutes = require('./routes/quizzes');
const leaderboardRoutes = require('./routes/leaderboard');
const subscriptionRoutes = require('./routes/subscriptions');
<<<<<<< HEAD
const userRoutes = require('./routes/users');
=======
const aiRoutes = require('./routes/ai');
>>>>>>> 830c7593b0919f44950dd2fc18521fff541a2fdb

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
<<<<<<< HEAD
app.use('/api/users', userRoutes);
=======
app.use('/api/ai', aiRoutes);
>>>>>>> 830c7593b0919f44950dd2fc18521fff541a2fdb

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
