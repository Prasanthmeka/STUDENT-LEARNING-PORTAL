const express = require('express');
const supabase = require('../utils/supabase');

const router = express.Router();

// Get Leaderboard
router.get('/', async (req, res) => {
  try {
    // Query to get student rankings based on quiz performance
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('student_id, users(full_name, email), total_marks, marks_obtained, percentage')
      .eq('status', 'graded')
      .order('marks_obtained', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Aggregate results by student
    const leaderboard = {};
    data.forEach(attempt => {
      const studentId = attempt.student_id;
      if (!leaderboard[studentId]) {
        leaderboard[studentId] = {
          student_id: studentId,
          full_name: attempt.users?.full_name,
          email: attempt.users?.email,
          totalMarks: 0,
          totalQuestionsMarks: 0,
          quizzesCompleted: 0,
          averagePercentage: 0
        };
      }
      leaderboard[studentId].totalMarks += attempt.marks_obtained || 0;
      leaderboard[studentId].totalQuestionsMarks += attempt.total_marks || 0;
      leaderboard[studentId].quizzesCompleted += 1;
    });

    // Calculate average percentage and rank
    const leaderboardArray = Object.values(leaderboard)
      .map(std => ({
        ...std,
        averagePercentage: std.totalQuestionsMarks > 0 
          ? ((std.totalMarks / std.totalQuestionsMarks) * 100).toFixed(2)
          : 0
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .map((std, idx) => ({
        ...std,
        rank: idx + 1
      }));

    res.json(leaderboardArray);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student's Rank
router.get('/student/:studentId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('student_id, users(full_name, email), total_marks, marks_obtained, percentage')
      .eq('student_id', req.params.studentId)
      .eq('status', 'graded');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    let totalMarks = 0;
    let totalQuestionsMarks = 0;
    let quizzesCompleted = 0;

    data.forEach(attempt => {
      totalMarks += attempt.marks_obtained || 0;
      totalQuestionsMarks += attempt.total_marks || 0;
      quizzesCompleted += 1;
    });

    const averagePercentage = totalQuestionsMarks > 0
      ? ((totalMarks / totalQuestionsMarks) * 100).toFixed(2)
      : 0;

    res.json({
      student_id: req.params.studentId,
      full_name: data[0]?.users?.full_name || 'Unknown',
      email: data[0]?.users?.email || 'Unknown',
      totalMarks,
      quizzesCompleted,
      averagePercentage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
