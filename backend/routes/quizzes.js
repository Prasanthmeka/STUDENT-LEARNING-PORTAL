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
    const { title, description, total_questions, passing_score, time_limit_minutes, subject, questions } = req.body;

    const quizId = uuidv4();

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        {
          id: quizId,
          title,
          description,
          created_by: req.user.id,
          total_questions,
          passing_score,
          time_limit_minutes,
          subject,
          is_published: false
        }
      ])
      .select();

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    // Insert questions if provided
    if (questions && questions.length > 0) {
      const questionsData = questions.map((q, idx) => ({
        id: uuidv4(),
        quiz_id: quizId,
        question_text: q.question_text,
        question_type: q.question_type || 'multiple_choice',
        marks: q.marks || 1,
        correct_answer: q.correct_answer,
        order_number: idx + 1
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsData);

      if (questionsError) {
        return res.status(400).json({ error: questionsError.message });
      }

      // Insert options for multiple choice questions
      let optionsData = [];
      questions.forEach((q, qIdx) => {
        if (q.question_type === 'multiple_choice' && q.options) {
          q.options.forEach((opt, oIdx) => {
            optionsData.push({
              id: uuidv4(),
              question_id: questionsData[qIdx].id,
              option_text: opt.text,
              is_correct: opt.is_correct || false,
              order_number: oIdx + 1
            });
          });
        }
      });

      if (optionsData.length > 0) {
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsData);

        if (optionsError) {
          return res.status(400).json({ error: optionsError.message });
        }
      }
    }

    res.status(201).json({ message: 'Quiz created successfully', quiz: quizData[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Published Quizzes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Quiz Details with Questions
router.get('/:id', async (req, res) => {
  try {
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (quizError) {
      return res.status(404).json({ error: 'Quiz not found' });
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
    const { answers } = req.body; // answers: [{question_id, option_id_or_text}, ...]
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

    // Get all questions with correct answers
    const { data: questionsData } = await supabase
      .from('quiz_questions')
      .select('*, quiz_options(*)')
      .eq('quiz_id', quizId);

    let totalMarks = 0;
    let marksObtained = 0;
    const responses = [];

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
    const isPassed = percentage >= quizData.passing_score;

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

    res.json({
      message: 'Quiz submitted successfully',
      attempt: updatedAttempt[0],
      result: {
        totalMarks,
        marksObtained,
        percentage: percentage.toFixed(2),
        isPassed
      },
      responses // Include responses so frontend can show detailed results
    });
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
        .select('*')
        .eq('quiz_attempt_id', latestAttempt.id);

      const result = {
        totalMarks: latestAttempt.total_marks,
        marksObtained: latestAttempt.marks_obtained,
        percentage: latestAttempt.percentage,
        isPassed: latestAttempt.is_passed
      };

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
      
      // Parse questions from text
      let questions = parseQuestionsFromText(text);

      // Filter by question_numbers if provided
      if (req.body.question_numbers) {
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

    res.status(201).json({ 
      message: 'Quiz created successfully from document', 
      quiz: quizData[0],
      questions_count: questions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
