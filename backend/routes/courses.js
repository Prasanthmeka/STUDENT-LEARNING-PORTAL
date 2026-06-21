const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get Dynamic Student Courses & Progress
router.get('/', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Fetch count of resources by subject from Supabase
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('subject, id')
      .eq('is_published', true);

    const { data: materials, error: materialsError } = await supabase
      .from('study_materials')
      .select('subject, id')
      .eq('is_published', true);

    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('subject, id')
      .eq('is_published', true);

    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('quiz_id, quizzes(subject)')
      .eq('student_id', studentId)
      .eq('status', 'graded');

    if (videosError || materialsError || quizzesError || attemptsError) {
      return res.status(400).json({ 
        error: 'Failed to aggregate course resources from database.' 
      });
    }

    // 2. Map of subject-to-resource-counts
    const subjectMap = {
      'Telugu': { title: 'Telugu Language & Classic Prose', instructor: 'Dr. Ramana Rao', lessons: 10, completed: 2, icon: '📙' },
      'Hindi': { title: 'Advanced Conversational Hindi', instructor: 'Mrs. Sunita Sharma', lessons: 12, completed: 3, icon: '📔' },
      'English': { title: 'Analytical Reading & Creative Writing', instructor: 'Prof. Alice Johnson', lessons: 15, completed: 4, icon: '📕' },
      'Maths': { title: 'Calculus & Algebra Foundations', instructor: 'Dr. S. Ramanujan', lessons: 20, completed: 5, icon: '📐' },
      'Physics': { title: 'Classical Mechanics & Astrophysics', instructor: 'Prof. Albert Einstein', lessons: 18, completed: 3, icon: '⚛️' },
      'Chemistry': { title: 'Molecular Structures & Chemical Equations', instructor: 'Dr. Marie Curie', lessons: 16, completed: 2, icon: '🧪' },
      'Biology': { title: 'Genetics, Physiology & Ecology', instructor: 'Dr. Charles Darwin', lessons: 14, completed: 3, icon: '🌿' },
      'Social': { title: 'World Geography & Cultural History', instructor: 'Prof. Herodotus', lessons: 10, completed: 4, icon: '🌍' }
    };

    // Calculate actual resources from Database
    Object.keys(subjectMap).forEach(sub => {
      // Total lessons is count of videos + materials + quizzes in this subject
      const subVideos = videos.filter(v => v.subject === sub).length;
      const subMaterials = materials.filter(m => m.subject === sub).length;
      const subQuizzes = quizzes.filter(q => q.subject === sub).length;
      
      const totalLessons = subVideos + subMaterials + subQuizzes;
      if (totalLessons > 0) {
        subjectMap[sub].lessons = totalLessons;
      }

      // Completed is count of quiz attempts completed in this subject
      const completedQuizzes = attempts.filter(att => att.quizzes && att.quizzes.subject === sub).length;
      
      // Let's also count unique videos watched or just scale it
      subjectMap[sub].completed = Math.min(completedQuizzes, subjectMap[sub].lessons);
    });

    // Extract subscribed subjects list securely from local JSON
    const { getSubscribedSubjects } = require('../utils/subscriptionHelper');
    const subscribedSubjects = await getSubscribedSubjects(studentId, req.headers);

    const coursesArray = Object.keys(subjectMap)
      .filter(sub => subscribedSubjects.some(s => {
        const sNorm = s.toLowerCase();
        const subNorm = sub.toLowerCase();
        return sNorm === subNorm || 
          ((sNorm === 'social' || sNorm === 'social studies') && (subNorm === 'social' || subNorm === 'social studies'));
      }))
      .map(sub => {
        const course = subjectMap[sub];
        const percentage = course.lessons > 0 ? Math.round((course.completed / course.lessons) * 100) : 0;
        
        return {
          id: sub.toLowerCase(),
          title: course.title,
          subject: sub === 'Social' ? 'Social Studies' : sub,
          instructor: course.instructor,
          lessonsCompleted: course.completed,
          totalLessons: course.lessons,
          progress: percentage,
          icon: course.icon,
          thumbnail: `/assets/courses/${sub.toLowerCase()}.jpg` // Illustrative path
        };
      });

    res.json(coursesArray);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
