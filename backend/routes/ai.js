const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const supabase = require('../utils/supabase');
const { authenticateToken } = require('../middleware/auth');
const validateEducationalContext = require('../middleware/aiGuardrails');
const { extractTextFromDocument } = require('../utils/documentParser');
const {
  getAIChatResponse,
  summarizeDocument,
  generateQuizFromText,
  explainQuizAnswers,
  generateRecommendations
} = require('../utils/openai');

const router = express.Router();

// Rate limiting to secure API usage and optimize tokens
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // Limit each IP to 60 requests per window
  message: { error: 'Too many requests to the AI Assistant. Please take a deep breath and try again later!' }
});

router.use(aiLimiter);

/**
 * Helper to download raw file from GitHub or external URL to a temporary local file
 */
async function downloadMaterialText(url, fileName) {
  const tempDir = path.join(__dirname, '../temp_ai');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFilePath = path.join(tempDir, `${uuidv4()}_${fileName}`);
  
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(tempFilePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(tempFilePath));
    writer.on('error', reject);
  });
}

/**
 * Endpoint: Chat doubt solver
 * POST /api/ai/chat
 */
router.post('/chat', authenticateToken, validateEducationalContext, async (req, res) => {
  try {
    const { message, history, language } = req.body;
    const responseText = await getAIChatResponse(message, history || [], language || 'English');
    res.json({ message: responseText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Summarize, Simplify, or Translate Note files
 * POST /api/ai/summarize
 */
router.post('/summarize', authenticateToken, async (req, res) => {
  try {
    const { materialId, text, actionType, language } = req.body;
    let textToProcess = text || '';

    // If a material ID is provided, download and extract text on the backend
    if (materialId) {
      const { data: material, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', materialId)
        .single();

      if (error || !material) {
        return res.status(404).json({ error: 'Study material not found' });
      }

      let tempPath = null;
      try {
        tempPath = await downloadMaterialText(material.github_url, material.file_name);
        
        let mimeType = 'text/plain';
        if (material.file_type === 'pdf') mimeType = 'application/pdf';
        else if (material.file_type === 'doc') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        textToProcess = await extractTextFromDocument(tempPath, mimeType);
      } catch (err) {
        console.error('Failed to parse notes file:', err);
        return res.status(400).json({ error: 'Failed to extract text from notes: ' + err.message });
      } finally {
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }

    if (!textToProcess || textToProcess.trim() === '') {
      return res.status(400).json({ error: 'No text or notes available to analyze.' });
    }

    const resultText = await summarizeDocument(textToProcess, actionType || 'summarize', language || 'English');
    res.json({ result: resultText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Generate Quiz questions from material notes
 * POST /api/ai/generate-quiz
 */
router.post('/generate-quiz', authenticateToken, async (req, res) => {
  try {
    const { materialId, text, count, subject } = req.body;
    let textToProcess = text || '';

    if (materialId) {
      const { data: material, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', materialId)
        .single();

      if (error || !material) {
        return res.status(404).json({ error: 'Notes document not found' });
      }

      let tempPath = null;
      try {
        tempPath = await downloadMaterialText(material.github_url, material.file_name);
        
        let mimeType = 'text/plain';
        if (material.file_type === 'pdf') mimeType = 'application/pdf';
        else if (material.file_type === 'doc') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        textToProcess = await extractTextFromDocument(tempPath, mimeType);
      } catch (err) {
        return res.status(400).json({ error: 'Failed to extract text: ' + err.message });
      } finally {
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }

    if (!textToProcess || textToProcess.trim() === '') {
      return res.status(400).json({ error: 'No content available to generate quiz questions.' });
    }

    const quizQuestions = await generateQuizFromText(textToProcess, count || 5, subject || 'General Science');
    res.json({ questions: quizQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Explain wrong answers in completed quiz
 * POST /api/ai/explain-answer
 */
router.post('/explain-answer', authenticateToken, async (req, res) => {
  try {
    const { attemptId } = req.body;

    if (!attemptId) {
      return res.status(400).json({ error: 'Attempt ID is required' });
    }

    // Fetch quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Fetch questions + choices
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*, quiz_options(*)')
      .eq('quiz_id', attempt.quiz_id);

    // Fetch student responses
    const { data: responses, error: responsesError } = await supabase
      .from('student_responses')
      .select('*')
      .eq('quiz_attempt_id', attemptId);

    if (questionsError || responsesError) {
      return res.status(400).json({ error: 'Failed to retrieve quiz details for explanation.' });
    }

    const explanation = await explainQuizAnswers(questions, responses);
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: Suggest personalized weakness recommendations and study paths
 * POST /api/ai/recommendations
 */
router.post('/recommendations', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all student attempts joined with quiz details
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes:quiz_id (title, subject)
      `)
      .eq('student_id', studentId)
      .eq('status', 'graded');

    if (attemptsError) {
      return res.status(400).json({ error: 'Failed to fetch student quiz attempts.' });
    }

    // Fetch all active published quizzes
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('id, title, subject')
      .eq('is_published', true);

    // Fetch all active published study materials
    const { data: materials } = await supabase
      .from('study_materials')
      .select('id, title, subject')
      .eq('is_published', true);

    const recommendation = await generateRecommendations(
      attempts || [],
      quizzes || [],
      materials || []
    );

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
