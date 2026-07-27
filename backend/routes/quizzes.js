const express = require('express');
const supabase = require('../utils/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { extractTextFromDocument, parseQuestionsFromText } = require('../utils/documentParser');

const router = express.Router();

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, TXT, DOCX'));
    }
  }
});

// Create Quiz (Admin Only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    let {
      title,
      description,
      total_questions,
      passing_score,
      passing_marks,
      time_limit_minutes,
      duration,
      subject,
      questions
    } = req.body;

    const quizId = uuidv4();

    // Map passing marks/score
    const finalPassingScore = passing_score !== undefined ? passing_score : (passing_marks !== undefined ? passing_marks : 50);

    // Map time limit / duration
    let finalTimeLimit = time_limit_minutes;
    if (finalTimeLimit === undefined && duration !== undefined) {
      const parsedDuration = parseInt(String(duration).replace(/[^0-9]/g, ''), 10);
      finalTimeLimit = isNaN(parsedDuration) ? 30 : parsedDuration;
    }
    if (finalTimeLimit === undefined) {
      finalTimeLimit = 30;
    }

    // Capitalize subject to match DB and UI filters
    if (subject) {
      const subLower = subject.toLowerCase();
      if (subLower === 'telugu') subject = 'Telugu';
      else if (subLower === 'hindi') subject = 'Hindi';
      else if (subLower === 'english') subject = 'English';
      else if (subLower === 'maths') subject = 'Maths';
      else if (subLower === 'physics') subject = 'Physics';
      else if (subLower === 'chemistry') subject = 'Chemistry';
      else if (subLower === 'biology') subject = 'Biology';
      else if (subLower === 'social' || subLower === 'social studies') subject = 'Social';
    }

    const finalTotalQuestions = total_questions !== undefined ? total_questions : (questions ? questions.length : 0);

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          id: quizId,
          title,
          description: description || '',
          created_by: req.user.id,
          total_questions: finalTotalQuestions,
          passing_score: finalPassingScore,
          time_limit_minutes: finalTimeLimit,
          subject,
          class: req.body.class,
          is_published: true, // Manual quizzes are published immediately
          is_competitive: req.body.is_competitive || false
        }
      ])
      .select();

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    // Insert questions if provided
    if (questions && questions.length > 0) {
      const questionsData = [];
      const optionsData = [];

      questions.forEach((q, idx) => {
        const questionId = uuidv4();

        const questionText = q.question_text || q.questionText || '';
        const questionType = q.question_type || q.questionType || 'multiple_choice';
        const marks = q.marks !== undefined ? q.marks : 1;
        const correctAnswer = q.correct_answer || q.correctAnswer || 'A';

        questionsData.push({
          id: questionId,
          quiz_id: quizId,
          question_text: questionText,
          question_type: questionType,
          marks: marks,
          correct_answer: correctAnswer,
          order_number: idx + 1
        });

        // Map options for MCQ
        if (questionType === 'multiple_choice') {
          let opts = [];
          if (q.options) {
            opts = q.options.map(opt => ({
              text: opt.text || opt.option_text || '',
              is_correct: opt.is_correct || false
            }));
          } else {
            // Check for flat properties from frontend (optionA, optionB, etc.)
            const correctLetters = String(correctAnswer).split(',').map(s => s.trim().toUpperCase());
            if (q.optionA !== undefined) opts.push({ text: q.optionA, is_correct: correctLetters.includes('A') });
            if (q.optionB !== undefined) opts.push({ text: q.optionB, is_correct: correctLetters.includes('B') });
            if (q.optionC !== undefined) opts.push({ text: q.optionC, is_correct: correctLetters.includes('C') });
            if (q.optionD !== undefined) opts.push({ text: q.optionD, is_correct: correctLetters.includes('D') });
          }

          opts.forEach((opt, oIdx) => {
            optionsData.push({
              id: uuidv4(),
              question_id: questionId,
              option_text: opt.text,
              is_correct: opt.is_correct,
              order_number: oIdx + 1
            });
          });
        }
      });

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsData);

      if (questionsError) {
        return res.status(400).json({ error: questionsError.message });
      }

      if (optionsData.length > 0) {
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsData);

        if (optionsError) {
          return res.status(400).json({ error: optionsError.message });
        }
      }
    }

    // Automatically enable the quiz for all existing students in the same class
    try {
      let studentQuery = supabase
        .from('users')
        .select('id')
        .eq('role', 'student');

      if (req.body.class) {
        studentQuery = studentQuery.eq('class', req.body.class);
      }

      const { data: studentsData } = await studentQuery;

      if (studentsData && studentsData.length > 0) {
        const permissionsData = studentsData.map(student => ({
          id: uuidv4(),
          quiz_id: quizId,
          student_id: student.id,
          granted_at: new Date()
        }));

        const { error: permError } = await supabase
          .from('quiz_permissions')
          .insert(permissionsData);

        if (permError) {
          console.error('Error automatically enabling quiz for students:', permError);
        }
      }
    } catch (permErr) {
      console.error('Error in automatic quiz enablement:', permErr);
    }

    // Trigger notification asynchronously for subscribed students
    const { createUploadNotification } = require('../utils/notificationHelper');
    createUploadNotification({
      subject,
      title,
      resourceType: 'quiz',
      resourceId: quizId
    }).catch(err => console.error('Error dispatching quiz upload notification:', err));

    res.status(201).json({ message: 'Quiz created successfully', quiz: quizData[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Published Quizzes
router.get('/', async (req, res) => {
  try {
    // Check if user is authenticated (has token)
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    let userRole = null;
    let studentClass = null;
    let loginType = 'courses';

    // If authenticated, decode token to get user info
    if (token) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.id;
        userRole = decoded.role;
        studentClass = decoded.class;
        loginType = decoded.loginType || 'courses';
      } catch (e) {
        // Invalid token, continue as anonymous
      }
    }

    // If admin, return all published quizzes
    if (userRole === 'admin') {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    }

    // If authenticated student, return only quizzes they have permission for
    if (userId && userRole === 'student') {
      const { data: permittedQuizzes, error } = await supabase
        .from('quiz_permissions')
        .select('quiz_id, quizzes(*)')
        .eq('student_id', userId)
        .order('granted_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Fetch all attempts for this student to attach attempt status
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, status, is_passed, percentage, id')
        .eq('student_id', userId);

      // Create a map of quiz_id -> latest attempt
      const attemptsMap = {};
      if (attempts) {
        attempts.forEach(att => {
          attemptsMap[att.quiz_id] = att;
        });
      }

      // Extract subscribed subjects list securely from local JSON
      const { getSubscribedSubjects } = require('../utils/subscriptionHelper');
      const subscribedSubjects = await getSubscribedSubjects(userId, req.headers);

      // Extract quiz data from permissions and attach attempt info, filtered by subject subscription list and class
      const quizzes = (permittedQuizzes || [])
        .map(p => p.quizzes)
        .filter(q => {
          if (q && q.is_published) {
            // Filter by class
            if (studentClass && q.class && q.class !== studentClass) {
              return false;
            }

            // Filter by competitive type based on loginType
            if (loginType === 'quiz') {
              if (!q.is_competitive) return false;
              // Bypass subscription check for quiz portal mode
              return true;
            } else {
              // courses portal
              if (q.is_competitive) return false;
            }

            return subscribedSubjects.some(s => {
              const sNorm = s.toLowerCase();
              const qNorm = q.subject?.toLowerCase() || '';
              return sNorm === qNorm || 
                ((sNorm === 'social' || sNorm === 'social studies') && (qNorm === 'social' || qNorm === 'social studies'));
            });
          }
          return false;
        })
        .map(q => {
          const attempt = attemptsMap[q.id] || null;
          return {
            ...q,
            attempt: attempt ? {
              id: attempt.id,
              status: attempt.status,
              is_passed: attempt.is_passed,
              percentage: attempt.percentage
            } : null
          };
        });

      return res.json(quizzes);
    }

    // Unauthenticated or unknown role - return all competitive quizzes
    const { data: competitiveQuizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('is_published', true)
      .eq('is_competitive', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(competitiveQuizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Quiz Details with Questions
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Security guard for students
    if (req.user && req.user.role === 'student') {
      if (req.user.loginType === 'quiz') {
        if (!quizData.is_competitive) {
          return res.status(403).json({ error: 'Access denied. This quiz is only available through the courses portal.' });
        }
      } else {
        if (quizData.is_competitive) {
          return res.status(403).json({ error: 'Access denied. This quiz is only available through the quiz portal.' });
        }
        const { isSubscribedToSubject } = require('../utils/subscriptionHelper');
        const isSubscribed = await isSubscribedToSubject(req.user.id, quizData.subject, req.headers);
        if (!isSubscribed) {
          return res.status(403).json({ error: 'Access denied. You are not subscribed to this subject.' });
        }
      }
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*, quiz_options(*)')
      .eq('quiz_id', req.params.id)
      .order('order_number');

    if (questionsError) {
      return res.status(400).json({ error: questionsError.message });
    }

    res.json({ ...quizData, questions: questionsData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Quiz Answers
router.post('/:id/submit', authenticateToken, authorizeRole(['student']), async (req, res) => {
  try {
    const { answers, startedAt } = req.body; // answers: [{question_id, option_id_or_text}, ...]
    const quizId = req.params.id;

    // Create quiz attempt
    const attemptId = uuidv4();
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          id: attemptId,
          student_id: req.user.id,
          quiz_id: quizId,
          status: 'submitted',
          started_at: startedAt ? new Date(startedAt) : new Date(),
          submitted_at: new Date()
        }
      ])
      .select();

    if (attemptError) {
      return res.status(400).json({ error: attemptError.message });
    }

    // Get quiz details
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (!quizData) {
      return res.status(400).json({ error: 'Quiz not found' });
    }

    // Get all questions with correct answers
    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*, quiz_options(*)')
      .eq('quiz_id', quizId);

    if (!questionsData || questionsData.length === 0) {
      return res.status(400).json({ error: 'No questions found for this quiz' });
    }

    let totalMarks = 0;
    let marksObtained = 0;
    const responses = [];

    console.log('📝 GRADING:', {
      answersCount: answers?.length,
      questionsCount: questionsData?.length,
      answerSample: answers?.[0]
    });

    // Grade each answer
    for (const answer of answers) {
      const question = questionsData.find(q => q.id === answer.question_id);
      if (!question) continue;

      totalMarks += question.marks || 1;
      let isCorrect = false;
      let marksForThisQuestion = 0;

      let finalSelectedOptionId = null;
      let finalgetTextResponse = answer.text_response || null;

      if (question.question_type === 'multiple_choice') {
        const correctOptions = question.quiz_options.filter(o => o.is_correct).map(o => o.id);

        if (correctOptions.length > 1) {
          // Multiple select mode
          const selectedOptionIds = Array.isArray(answer.option_id) ? answer.option_id : [answer.option_id].filter(Boolean);

          if (selectedOptionIds.length === correctOptions.length && selectedOptionIds.every(id => correctOptions.includes(id))) {
            isCorrect = true;
          }
          // Store array as JSON string in text_response to bypass UUID schema restriction on selected_option_id
          finalgetTextResponse = JSON.stringify(selectedOptionIds);
        } else {
          // Single select mode
          const selectedOption = question.quiz_options.find(o => o.id === answer.option_id);
          isCorrect = Boolean(selectedOption && selectedOption.is_correct);
          finalSelectedOptionId = answer.option_id || null;
        }
      } else if (question.question_type === 'true_false' || question.question_type === 'short_answer') {
        isCorrect = Boolean(answer.text_response && question.correct_answer && answer.text_response.toLowerCase() === question.correct_answer.toLowerCase());
      }

      if (isCorrect) {
        marksForThisQuestion = question.marks || 1;
        marksObtained += marksForThisQuestion;
      }

      responses.push({
        id: uuidv4(),
        quiz_attempt_id: attemptId,
        question_id: answer.question_id,
        selected_option_id: finalSelectedOptionId || null,
        text_response: finalgetTextResponse || null,
        is_correct: Boolean(isCorrect),
        marks_obtained: marksForThisQuestion || 0
      });
    }

    // Insert responses
    const { error: responsesError } = await supabase
      .from('student_responses')
      .insert(responses);

    if (responsesError) {
      return res.status(400).json({ error: responsesError.message });
    }

    // Calculate percentage
    const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;
    const isPassed = percentage >= (quizData.passing_score || 50);

    // Calculate time taken
    let timeTaken = 0;
    if (attemptData && attemptData[0] && attemptData[0].started_at && attemptData[0].submitted_at) {
      const startTime = new Date(attemptData[0].started_at);
      const endTime = new Date(attemptData[0].submitted_at);
      timeTaken = Math.round((endTime - startTime) / 1000); // in seconds
    }

    console.log('📊 QUIZ GRADING:', {
      quizId,
      totalMarks,
      marksObtained,
      percentage: percentage.toFixed(2),
      isPassed,
      passingScore: quizData.passing_score,
      attemptId,
      timeTaken
    });

    // Update quiz attempt with results
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        total_marks: totalMarks,
        marks_obtained: marksObtained,
        percentage: percentage,
        is_passed: isPassed,
        status: 'graded'
      })
      .eq('id', attemptId)
      .select();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Fetch inserted responses with related data for frontend display
    const { data: insertedResponses } = await supabase
      .from('student_responses')
      .select('*, quiz_questions(*), quiz_options(*)')
      .eq('quiz_attempt_id', attemptId);

    const resultPayload = {
      message: 'Quiz submitted successfully',
      attempt: updatedAttempt[0],
      result: {
        totalMarks,
        marksObtained,
        percentage: percentage.toFixed(2),
        isPassed,
        timeTaken: timeTaken // seconds
      },
      responses: insertedResponses
    };

    console.log('📤 SENDING RESPONSE:', {
      result: resultPayload.result,
      attemptKeys: Object.keys(resultPayload.attempt || {}),
      responsesCount: insertedResponses?.length || 0
    });

    res.json(resultPayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student's Quiz Attempt
router.get('/:id/attempt/:attemptId', authenticateToken, async (req, res) => {
  try {
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', req.params.attemptId)
      .eq('student_id', req.user.id)
      .single();

    if (attemptError) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const { data: responses, error: responsesError } = await supabase
      .from('student_responses')
      .select('*')
      .eq('quiz_attempt_id', req.params.attemptId);

    if (responsesError) {
      return res.status(400).json({ error: responsesError.message });
    }

    res.json({
      attempt: attemptData,
      responses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all attempts for a student on a specific quiz
router.get('/:id/my-attempts', authenticateToken, authorizeRole(['student', 'admin']), async (req, res) => {
  try {
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', req.params.id)
      .eq('student_id', req.user.id)
      .order('submitted_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    if (attempts && attempts.length > 0) {
      // Fetch responses for the latest attempt to populate results screen
      const latestAttempt = attempts[0];
      const { data: responses } = await supabase
        .from('student_responses')
        .select('*, quiz_questions(*), quiz_options(*)')
        .eq('quiz_attempt_id', latestAttempt.id);

      const result = {
        totalMarks: latestAttempt.total_marks,
        marksObtained: latestAttempt.marks_obtained,
        percentage: latestAttempt.percentage,
        isPassed: latestAttempt.is_passed,
        timeTaken: latestAttempt.started_at && latestAttempt.submitted_at
          ? Math.round((new Date(latestAttempt.submitted_at) - new Date(latestAttempt.started_at)) / 1000)
          : 0
      };

      console.log('📥 FETCHING MY-ATTEMPTS:', {
        attemptId: latestAttempt.id,
        dbPercentage: latestAttempt.percentage,
        dbTotalMarks: latestAttempt.total_marks,
        dbMarksObtained: latestAttempt.marks_obtained,
        timeTaken: result.timeTaken,
        result
      });

      res.json([{ attempt: latestAttempt, result, responses }]);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all attempts for a specific quiz
router.get('/:id/all-attempts', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // Get attempts with student info
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        users:student_id (full_name, email)
      `)
      .eq('quiz_id', req.params.id)
      .order('submitted_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    // Fetch all responses for these attempts to show exactly what they answered
    const attemptIds = attempts.map(a => a.id);
    let allResponses = [];

    if (attemptIds.length > 0) {
      const { data: responses, error: respError } = await supabase
        .from('student_responses')
        .select(`
          *,
          quiz_questions(question_text, correct_answer),
          quiz_options(option_text, is_correct)
        `)
        .in('quiz_attempt_id', attemptIds);

      if (!respError && responses) {
        allResponses = responses;
      }
    }

    res.json({ attempts, responses: allResponses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete an attempt to give access to write again
router.delete('/attempt/:attemptId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // First delete responses
    await supabase.from('student_responses').delete().eq('quiz_attempt_id', req.params.attemptId);
    // Then delete attempt
    const { error } = await supabase.from('quiz_attempts').delete().eq('id', req.params.attemptId);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Attempt deleted successfully, student can retake.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Extract Questions from Document
router.post('/extract-questions', authenticateToken, authorizeRole(['admin']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save file temporarily
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, '../temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, req.file.originalname);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    try {
      // Extract text from document
      const text = await extractTextFromDocument(tempFilePath, req.file.mimetype);

      // Parse questions from text (with AI generation fallback if requested)
      let questions = [];
      if (req.body.use_ai === 'true' || req.body.use_ai === true) {
        const { generateQuizFromText } = require('../utils/openai');
        const subject = req.body.subject || 'General Science';
        const count = parseInt(req.body.question_numbers) || 5;
        questions = await generateQuizFromText(text, count, subject);
      } else {
        questions = parseQuestionsFromText(text);
      }

      // Filter by question_numbers if provided (skip in AI mode)
      if (req.body.question_numbers && !(req.body.use_ai === 'true' || req.body.use_ai === true)) {
        const numbersStr = req.body.question_numbers;
        const requestedNumbers = new Set();
        const parts = numbersStr.split(',');

        parts.forEach(part => {
          part = part.trim();
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let i = start; i <= end; i++) {
                requestedNumbers.add(i);
              }
            }
          } else {
            const num = parseInt(part, 10);
            if (!isNaN(num)) {
              requestedNumbers.add(num);
            }
          }
        });

        if (requestedNumbers.size > 0) {
          questions = questions.filter((_, idx) => requestedNumbers.has(idx + 1));
        }
      }

      // Cleanup temp file
      fs.unlinkSync(tempFilePath);

      if (questions.length === 0) {
        return res.status(400).json({
          error: 'No questions found. Please ensure questions are in numbered format (1., 2., etc.) with options (A), B), etc.)'
        });
      }

      res.json({
        success: true,
        questions_count: questions.length,
        questions,
        message: `Found ${questions.length} questions. Review and confirm before creating quiz.`
      });
    } catch (parseError) {
      // Cleanup on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw parseError;
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract questions: ' + err.message });
  }
});

// Create Quiz from Extracted Questions
router.post('/from-document', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, description, passing_score, time_limit_minutes, subject, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    const quizId = uuidv4();

    // Create quiz
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          id: quizId,
          title,
          description,
          created_by: req.user.id,
          total_questions: questions.length,
          passing_score: passing_score || 50,
          time_limit_minutes: time_limit_minutes || 30,
          subject,
          class: req.body.class || req.body.quizClass,
          is_published: true
        }
      ])
      .select();

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    // Insert questions and options
    let questionsData = [];
    let optionsData = [];

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const questionId = uuidv4();

      questionsData.push({
        id: questionId,
        quiz_id: quizId,
        question_text: q.question_text,
        question_type: q.question_type || 'multiple_choice',
        marks: q.marks || 1,
        correct_answer: q.correct_answer,
        order_number: idx + 1
      });

      // Add options if multiple choice
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, oIdx) => {
          optionsData.push({
            id: uuidv4(),
            question_id: questionId,
            option_text: opt.text,
            is_correct: opt.is_correct || false,
            order_number: oIdx + 1
          });
        });
      }
    }

    // Insert all questions
    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questionsData);

    if (questionsError) {
      return res.status(400).json({ error: questionsError.message });
    }

    // Insert all options
    if (optionsData.length > 0) {
      const { error: optionsError } = await supabase
        .from('quiz_options')
        .insert(optionsData);

      if (optionsError) {
        return res.status(400).json({ error: optionsError.message });
      }
    }

    // Automatically enable the quiz for all existing students
    try {
      const { data: studentsData } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'student');

      if (studentsData && studentsData.length > 0) {
        const permissionsData = studentsData.map(student => ({
          id: uuidv4(),
          quiz_id: quizId,
          student_id: student.id,
          granted_at: new Date()
        }));

        const { error: permError } = await supabase
          .from('quiz_permissions')
          .insert(permissionsData);

        if (permError) {
          console.error('Error automatically enabling quiz for students:', permError);
        }
      }
    } catch (permErr) {
      console.error('Error in automatic quiz enablement:', permErr);
    }

    res.status(201).json({
      message: 'Quiz created successfully from document',
      quiz: quizData[0],
      questions_count: questions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all quizzes created by this admin (published and unpublished)
router.get('/admin/all-quizzes', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('created_by', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete a quiz
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const quizId = req.params.id;

    // Verify quiz exists and belongs to this admin or is created by admin
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, created_by, title')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Verify admin is the creator of the quiz
    if (quizData.created_by !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this quiz' });
    }

    // To prevent PostgreSQL foreign key constraint errors, we manually delete all related records in order:
    
    // 1. Fetch all quiz attempts
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('quiz_id', quizId);
    
    const attemptIds = attempts?.map(a => a.id) || [];

    // 2. Fetch all quiz questions
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id')
      .eq('quiz_id', quizId);
    
    const questionIds = questions?.map(q => q.id) || [];

    // 3. Delete student responses linked to attempts or questions
    if (attemptIds.length > 0) {
      await supabase
        .from('student_responses')
        .delete()
        .in('quiz_attempt_id', attemptIds);
    }
    
    if (questionIds.length > 0) {
      await supabase
        .from('student_responses')
        .delete()
        .in('question_id', questionIds);
    }

    // 4. Delete quiz attempts
    await supabase
      .from('quiz_attempts')
      .delete()
      .eq('quiz_id', quizId);

    // 5. Delete quiz permissions
    await supabase
      .from('quiz_permissions')
      .delete()
      .eq('quiz_id', quizId);

    // 6. Delete quiz options
    if (questionIds.length > 0) {
      await supabase
        .from('quiz_options')
        .delete()
        .in('question_id', questionIds);
    }

    // 7. Delete quiz questions
    await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId);

    // 8. Finally delete the quiz itself
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.json({ message: `Quiz "${quizData.title}" and all related student records have been deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get students with access to a quiz
router.get('/:id/permissions', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const quizId = req.params.id;

    // Get quiz details
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get students with permission to this quiz
    const { data: permissions, error: permError } = await supabase
      .from('quiz_permissions')
      .select(`
        id,
        student_id,
        users:student_id (full_name, email),
        granted_at
      `)
      .eq('quiz_id', quizId)
      .order('granted_at', { ascending: false });

    if (permError) {
      return res.status(400).json({ error: permError.message });
    }

    res.json({
      quiz: quizData,
      students: permissions || [],
      total_students: permissions ? permissions.length : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Enable quiz for specific students
router.post('/:id/enable-for-students', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const quizId = req.params.id;
    const { student_ids } = req.body; // Array of student IDs

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: 'student_ids array is required' });
    }

    // Verify quiz exists
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Verify all students exist
    const { data: studentsData, error: studentsError } = await supabase
      .from('users')
      .select('id')
      .in('id', student_ids)
      .eq('role', 'student');

    if (studentsError || !studentsData || studentsData.length !== student_ids.length) {
      return res.status(400).json({ error: 'One or more students not found' });
    }

    // Insert permissions (ignore duplicates if they already exist)
    // Insert one by one and skip duplicates
    let successCount = 0;
    let skippedCount = 0;

    for (const studentId of student_ids) {
      const permissionId = uuidv4();
      const { error } = await supabase
        .from('quiz_permissions')
        .insert([{
          id: permissionId,
          quiz_id: quizId,
          student_id: studentId,
          granted_at: new Date()
        }]);

      if (error) {
        // Check if it's a unique constraint error (already exists)
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
          skippedCount++;
        } else {
          // Log other errors but continue
          console.error(`Error adding permission for student ${studentId}:`, error);
        }
      } else {
        successCount++;
      }
    }

    const skippedMessage = skippedCount > 0 ? ` (${skippedCount} already had access)` : '';
    res.json({
      message: `Quiz enabled for ${successCount} students${skippedMessage}`,
      quiz: quizData.title,
      students_enabled: successCount,
      skipped: skippedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Remove quiz access from a student
router.delete('/:id/permissions/:studentId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id: quizId, studentId } = req.params;

    const { error } = await supabase
      .from('quiz_permissions')
      .delete()
      .eq('quiz_id', quizId)
      .eq('student_id', studentId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Student access to quiz has been removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Unpublish a quiz
router.put('/:id/unpublish', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const quizId = req.params.id;

    // Verify quiz exists
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, is_published')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!quizData.is_published) {
      return res.status(400).json({ error: 'Quiz is already unpublished' });
    }

    // Update quiz to unpublished
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ is_published: false, updated_at: new Date() })
      .eq('id', quizId);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: `Quiz "${quizData.title}" has been unpublished successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Publish a quiz
router.put('/:id/publish', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const quizId = req.params.id;

    // Verify quiz exists
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, is_published')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (quizData.is_published) {
      return res.status(400).json({ error: 'Quiz is already published' });
    }

    // Update quiz to published
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ is_published: true, updated_at: new Date() })
      .eq('id', quizId);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Automatically enable the quiz for all existing students in the same class upon publication
    try {
      const { data: quizDetails } = await supabase
        .from('quizzes')
        .select('class')
        .eq('id', quizId)
        .single();

      let studentQuery = supabase
        .from('users')
        .select('id')
        .eq('role', 'student');

      if (quizDetails && quizDetails.class) {
        studentQuery = studentQuery.eq('class', quizDetails.class);
      }

      const { data: studentsData } = await studentQuery;

      if (studentsData && studentsData.length > 0) {
        const permissionsData = studentsData.map(student => ({
          id: uuidv4(),
          quiz_id: quizId,
          student_id: student.id,
          granted_at: new Date()
        }));

        // Insert individually to gracefully skip any pre-existing permissions
        for (const perm of permissionsData) {
          await supabase
            .from('quiz_permissions')
            .insert([perm])
            .select()
            .maybeSingle();
        }
      }
    } catch (permErr) {
      console.error('Error automatically enabling quiz on publish:', permErr);
    }

    res.json({ message: `Quiz "${quizData.title}" has been published successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Admin: Enable quiz for all students
router.post('/:id/enable-for-all-students', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const quizId = req.params.id;

    // Verify quiz exists
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('id, title, class')
      .eq('id', quizId)
      .single();

    if (quizError || !quizData) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get all students matching the quiz class
    let studentQuery = supabase
      .from('users')
      .select('id')
      .eq('role', 'student');

    if (quizData && quizData.class) {
      studentQuery = studentQuery.eq('class', quizData.class);
    }

    const { data: studentsData, error: studentsError } = await studentQuery;

    if (studentsError) {
      return res.status(400).json({ error: studentsError.message });
    }

    if (!studentsData || studentsData.length === 0) {
      return res.json({
        message: 'No students found to enable quiz for',
        quiz: quizData.title,
        students_enabled: 0
      });
    }

    // Insert permissions for all students (skip duplicates)
    let successCount = 0;
    let skippedCount = 0;

    for (const student of studentsData) {
      const permissionId = uuidv4();
      const { error } = await supabase
        .from('quiz_permissions')
        .insert([{
          id: permissionId,
          quiz_id: quizId,
          student_id: student.id,
          granted_at: new Date()
        }]);

      if (error) {
        // Check if it's a unique constraint error (already exists)
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
          skippedCount++;
        } else {
          console.error(`Error adding permission for student ${student.id}:`, error);
        }
      } else {
        successCount++;
      }
    }

    const skippedMessage = skippedCount > 0 ? ` (${skippedCount} already had access)` : '';
    res.json({
      message: `Quiz enabled for all ${successCount} students${skippedMessage}`,
      quiz: quizData.title,
      students_enabled: successCount,
      skipped: skippedCount,
      total_students: studentsData.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
