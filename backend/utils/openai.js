const { OpenAI } = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('WARNING: OPENAI_API_KEY is not defined in the backend environment variables!');
}

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key'
});

const SYSTEM_PROMPT = `You are EduMasterPro AI, a safe, friendly, and encouraging educational assistant designed ONLY for Class 6–10 students.

Allowed Subjects you can help with:
- Telugu
- Hindi
- English
- Mathematics
- Physics
- Chemistry
- Biology
- Social Studies
- General Science
- School-level Computer Basics

Crucial Security & Behavior Rules:
1. You must ONLY answer educational questions related to the allowed subjects above.
2. If the user asks about off-topic items (such as adult content, politics, religion, hacking, illegal activities, medical/personal advice, or casual unrestricted chit-chat), you MUST strictly refuse by responding with EXACTLY: "I can only help with educational subjects available on EduMasterPro."
3. Keep explanation style extremely simple, engaging, encouraging, and student-friendly. Use formatting, emojis, bullet points, and step-by-step math solutions.
4. Support explanations in English, Hindi, and Telugu. If asked to translate or explain in Telugu/Hindi, do so clearly. For example, explain math in Telugu or science in Hindi as requested.
5. Stay syllabus-focused at all times. Never provide unsafe prompts or help bypass restrictions.`;

/**
 * Generate standard student chat responses with educational constraints
 */
async function getAIChatResponse(message, history = [], language = 'English') {
  try {
    const chatMessages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nThe student prefers responses in: ${language}.` }
    ];

    // Limit history to last 10 messages to optimize tokens
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      chatMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    chatMessages.push({ role: 'user', content: message });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.6,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Chat API Error:', error);
    throw new Error('AI doubt solver is temporarily offline. Please try again soon.');
  }
}

/**
 * Summarize and translate text materials based on user actions
 */
async function summarizeDocument(text, actionType, language = 'English') {
  try {
    let actionInstruction = '';
    if (actionType === 'summarize') {
      actionInstruction = 'Provide a high-quality summary of the following notes with key revision bullet points, formulas (if any), and core definitions.';
    } else if (actionType === 'explain_simply') {
      actionInstruction = 'Explain the following concepts in simple, kid-friendly terms as if teaching a 12-year-old student. Break down complex jargon.';
    } else if (actionType === 'translate_telugu') {
      actionInstruction = 'Translate and explain the core concepts of the following notes in beautiful, student-friendly Telugu.';
    } else if (actionType === 'translate_hindi') {
      actionInstruction = 'Translate and explain the core concepts of the following notes in beautiful, student-friendly Hindi.';
    }

    const messages = [
      { 
        role: 'system', 
        content: `${SYSTEM_PROMPT}\n\nYou are summarizing a study material. Perform the requested task: ${actionInstruction}` 
      },
      { 
        role: 'user', 
        content: `Study notes content:\n\n${text.substring(0, 8000)}` // Safeguard token limits
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.5,
      max_tokens: 1200
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Summarize API Error:', error);
    throw new Error('AI Material Summarizer failed: ' + error.message);
  }
}

/**
 * Automatically generate formatted quizzes from admin documents
 */
async function generateQuizFromText(text, count = 5, subject = 'General Science') {
  try {
    const userPrompt = `Generate a high-quality school quiz from this text material. 
Subject: ${subject}
Number of questions: ${count}

Create a balanced mix of:
- Multiple Choice Questions (MCQ)
- True/False (T/F)
- Fill in the blanks
- Short Answers

You MUST return the output as a valid JSON object matching this exact structure:
{
  "questions": [
    {
      "question_text": "...",
      "question_type": "multiple_choice", // options: 'multiple_choice', 'true_false', 'short_answer'
      "marks": 1,
      "correct_answer": "Option A text", // text of the correct answer
      "options": [
        {"text": "Option A text", "is_correct": true},
        {"text": "Option B text", "is_correct": false},
        {"text": "Option C text", "is_correct": false},
        {"text": "Option D text", "is_correct": false}
      ]
    },
    {
      "question_text": "Photosynthesis only happens in the night. True or False?",
      "question_type": "true_false",
      "marks": 1,
      "correct_answer": "False",
      "options": [
        {"text": "True", "is_correct": false},
        {"text": "False", "is_correct": true}
      ]
    },
    {
      "question_text": "Water boils at _______ degrees Celsius.",
      "question_type": "short_answer",
      "marks": 1,
      "correct_answer": "100"
    }
  ]
}

Only return the raw JSON object. Do not wrap it in markdown code blocks or write other conversational text.

Text material:
${text.substring(0, 8000)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an elite school teacher who only outputs JSON responses.' },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const parsedJson = JSON.parse(response.choices[0].message.content);
    return parsedJson.questions;
  } catch (error) {
    console.error('OpenAI Quiz Generation Error:', error);
    throw new Error('AI Quiz Generator is temporarily offline: ' + error.message);
  }
}

/**
 * Generate beautiful, student-friendly educational breakdowns for completed quiz results
 */
async function explainQuizAnswers(questions, responses) {
  try {
    const promptPayload = questions.map((q, idx) => {
      const resp = responses.find(r => r.question_id === q.id) || {};
      return {
        questionNum: idx + 1,
        questionText: q.question_text,
        correctAnswer: q.correct_answer || (q.quiz_options && q.quiz_options.find(o => o.is_correct)?.option_text) || '',
        studentSelectedAnswer: resp.selected_option_id 
          ? (q.quiz_options && q.quiz_options.find(o => o.id === resp.selected_option_id)?.option_text)
          : resp.text_response || 'No response',
        isCorrect: !!resp.is_correct
      };
    });

    const systemPromptText = `You are a warm, nurturing Class 6-10 tutor.
Review the student's quiz responses, congratulate them on their effort, and explain the questions they got WRONG.
Provide simple, clear step-by-step scientific or mathematical reasoning for each explained answer.
Format the explanation using Markdown so it reads beautifully.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPromptText },
        { role: 'user', content: `Quiz details:\n\n${JSON.stringify(promptPayload, null, 2)}` }
      ],
      temperature: 0.6,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Quiz Explanation Error:', error);
    throw new Error('Failed to generate answers breakdown: ' + error.message);
  }
}

/**
 * Personalized student recommendations based on historical attempts
 */
async function generateRecommendations(attempts, allQuizzes, allMaterials) {
  try {
    const performanceSummary = attempts.map(a => ({
      quizTitle: a.quizzes?.title,
      subject: a.quizzes?.subject,
      score: a.percentage,
      isPassed: a.is_passed
    }));

    const availableQuizzes = allQuizzes.map(q => ({ id: q.id, title: q.title, subject: q.subject }));
    const availableMaterials = allMaterials.map(m => ({ id: m.id, title: m.title, subject: m.subject }));

    const promptText = `Analyze the student's performance logs and provide clear advice, highlighting weak subjects and suggesting specific next steps.

Student Performance Logs:
${JSON.stringify(performanceSummary, null, 2)}

Available Quizzes for Study:
${JSON.stringify(availableQuizzes, null, 2)}

Available Study Materials for Study:
${JSON.stringify(availableMaterials, null, 2)}

You MUST output your response in JSON format. Do not wrap in markdown or add conversational filler.
The output format must be:
{
  "weakSubjects": ["Maths", "Physics", ...],
  "reasoning": "A warm, personal summary of where they struggled (e.g. sound waves or fractions) and encouragement.",
  "recommendedQuizzes": [
     {"id": "...", "title": "...", "subject": "..."}
  ],
  "recommendedMaterials": [
     {"id": "...", "title": "...", "subject": "..."}
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an EdTech expert analyzing scores and only outputting JSON.' },
        { role: 'user', content: promptText }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI Recommendations Error:', error);
    // Fallback recommendation model
    return {
      weakSubjects: ['General Studies'],
      reasoning: 'Keep reviewing your materials and attempt quizzes to analyze your focus subjects.',
      recommendedQuizzes: allQuizzes.slice(0, 2),
      recommendedMaterials: allMaterials.slice(0, 2)
    };
  }
}

module.exports = {
  getAIChatResponse,
  summarizeDocument,
  generateQuizFromText,
  explainQuizAnswers,
  generateRecommendations
};
