const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get Student Analytics for Dashboard
router.get('/student-dashboard', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Fetch all graded attempts for this student
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes:quiz_id (
          id,
          title,
          subject,
          total_questions
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'graded')
      .order('submitted_at', { ascending: false });

    if (attemptsError) {
      return res.status(400).json({ error: attemptsError.message });
    }

    // 2. Compute analytics numbers
    const totalTests = attempts.length;
    const passAttempts = attempts.filter(a => a.is_passed);
    const failAttempts = attempts.filter(a => !a.is_passed);

    const testsPassed = passAttempts.length;
    const failedTests = failAttempts.length;

    const passPercentage = totalTests > 0 ? ((testsPassed / totalTests) * 100).toFixed(1) : 0;
    const failPercentage = totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(1) : 0;

    // 3. Subject-wise analytics (all 8 standard subjects)
    const subjectsList = ['Telugu', 'Hindi', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Social'];
    
    // Map 'Social' to 'Social Studies' for frontend aesthetics if needed, but we keep DB value
    const subjectStats = {};
    subjectsList.forEach(sub => {
      subjectStats[sub] = {
        subject: sub,
        attempted: 0,
        passed: 0,
        averagePercentage: 0,
        totalPercentageSum: 0
      };
    });

    attempts.forEach(attempt => {
      const subject = attempt.quizzes?.subject;
      if (subject && subjectStats[subject]) {
        subjectStats[subject].attempted += 1;
        if (attempt.is_passed) {
          subjectStats[subject].passed += 1;
        }
        subjectStats[subject].totalPercentageSum += parseFloat(attempt.percentage || 0);
      }
    });

    const subjectAnalytics = Object.values(subjectStats).map(stat => ({
      subject: stat.subject === 'Social' ? 'Social Studies' : stat.subject,
      attempted: stat.attempted,
      passed: stat.passed,
      percentage: stat.attempted > 0 ? parseFloat((stat.totalPercentageSum / stat.attempted).toFixed(1)) : 0
    }));

    // 4. Monthly Performance Graph (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = {};
    
    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyStats[key] = {
        name: months[d.getMonth()],
        testsTaken: 0,
        totalScore: 0,
        averageScore: 0
      };
    }

    attempts.forEach(attempt => {
      if (attempt.submitted_at) {
        const date = new Date(attempt.submitted_at);
        const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyStats[key]) {
          monthlyStats[key].testsTaken += 1;
          monthlyStats[key].totalScore += parseFloat(attempt.percentage || 0);
        }
      }
    });

    const monthlyPerformance = Object.keys(monthlyStats).map(key => {
      const stat = monthlyStats[key];
      return {
        month: stat.name,
        testsTaken: stat.testsTaken,
        averageScore: stat.testsTaken > 0 ? parseFloat((stat.totalScore / stat.testsTaken).toFixed(1)) : 0
      };
    });

    // 5. Top 3 Quizzes Attempted
    // Sort attempts by percentage desc
    const sortedAttempts = [...attempts].sort((a, b) => parseFloat(b.percentage || 0) - parseFloat(a.percentage || 0));
    
    // Distinct by quiz_id to get top 3 unique quizzes
    const uniqueTopQuizzes = [];
    const seenQuizzes = new Set();
    
    for (const attempt of sortedAttempts) {
      if (attempt.quizzes && !seenQuizzes.has(attempt.quiz_id)) {
        seenQuizzes.add(attempt.quiz_id);
        
        // Count total attempts by student for this quiz
        const quizAttempts = attempts.filter(a => a.quiz_id === attempt.quiz_id).length;
        
        uniqueTopQuizzes.push({
          id: attempt.id,
          quizName: attempt.quizzes.title,
          subject: attempt.quizzes.subject === 'Social' ? 'Social Studies' : attempt.quizzes.subject,
          score: attempt.percentage ? parseFloat(attempt.percentage).toFixed(1) : 0,
          attempts: quizAttempts,
          date: attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : 'N/A'
        });
        
        if (uniqueTopQuizzes.length === 3) break;
      }
    }

    // 6. Calculate Streak
    let streak = 0;
    if (attempts.length > 0) {
      const datesAttempted = attempts
        .map(a => a.submitted_at ? new Date(a.submitted_at).toDateString() : null)
        .filter(Boolean);
        
      const uniqueDates = [...new Set(datesAttempted)].map(d => new Date(d));
      uniqueDates.sort((a, b) => b - a); // Sort descending (today first)

      const oneDayMs = 24 * 60 * 60 * 1000;
      let checkDate = new Date();
      checkDate.setHours(0,0,0,0);
      
      // If no quiz taken today, check yesterday
      let dateIdx = 0;
      let latestQuizDate = uniqueDates[0];
      if (latestQuizDate) {
        latestQuizDate.setHours(0,0,0,0);
        const diffDays = Math.round(Math.abs((checkDate - latestQuizDate) / oneDayMs));
        
        if (diffDays <= 1) { // Taken today or yesterday
          streak = 1;
          checkDate = latestQuizDate;
          dateIdx = 1;
          
          while (dateIdx < uniqueDates.length) {
            const prevDate = uniqueDates[dateIdx];
            prevDate.setHours(0,0,0,0);
            const diff = Math.round(Math.abs((checkDate - prevDate) / oneDayMs));
            
            if (diff === 1) {
              streak += 1;
              checkDate = prevDate;
              dateIdx += 1;
            } else if (diff === 0) {
              dateIdx += 1; // Same day, skip
            } else {
              break; // Gap found
            }
          }
        }
      }
    }

    res.json({
      summary: {
        totalTests,
        testsPassed,
        failedTests,
        passPercentage,
        failPercentage,
        streak
      },
      subjectAnalytics,
      monthlyPerformance,
      topQuizzes: uniqueTopQuizzes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
