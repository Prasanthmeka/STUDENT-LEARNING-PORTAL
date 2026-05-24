/**
 * Strict Educational Guardrails and Safety Middleware for EduMasterPro
 */

const ALLOWED_SUBJECTS_KEYWORDS = [
  // Math
  'math', 'maths', 'mathematics', 'solve', 'calculate', 'geometry', 'algebra', 'fraction', 'equation', 'number', 'sum', 'arithmetic', 'theorem',
  // Science
  'science', 'physics', 'chemistry', 'biology', 'photosynthesis', 'cell', 'atom', 'molecule', 'force', 'gravity', 'sound', 'light', 'electricity', 'energy', 'acid', 'base', 'periodic', 'plant', 'animal', 'human',
  // Languages
  'english', 'telugu', 'hindi', 'grammar', 'translate', 'essay', 'poem', 'poetry', 'spelling', 'vocabulary', 'literature',
  // Social
  'social', 'history', 'geography', 'civics', 'democracy', 'earth', 'map', 'constitution', 'government', 'revolution',
  // Computers
  'computer', 'basics', 'programming', 'coding', 'internet', 'software', 'hardware', 'keyboard', 'cpu', 'memory',
  // General Educational Queries
  'explain', 'summarize', 'definition', 'meaning', 'lesson', 'chapter', 'syllabus', 'quiz', 'question', 'doubt', 'study', 'learn', 'education'
];

const BLOCKED_TOPICS_REGEX = [
  // Dangerous/Harmful/Illegal
  /hack/i, /exploit/i, /malware/i, /virus/i, /bypass/i, /jailbreak/i, /illegal/i, /weapons/i, /bomb/i, /violence/i, /suicide/i, /kill/i,
  // Adult/Explicit
  /sex/i, /porn/i, /nudity/i, /adult/i, /erotic/i,
  // Politics
  /election/i, /politician/i, /government debate/i, /political party/i, /propaganda/i,
  // Religious debate
  /religion debate/i, /atheism debate/i, /god fight/i,
  // Finance/Advice
  /stock market/i, /invest/i, /medical advice/i, /doctor/i, /diagnose/i, /crypto/i, /bitcoin/i, /rich/i
];

function validateEducationalContext(req, res, next) {
  const query = req.body.message || req.body.question || req.body.text || '';
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'A valid question is required.' });
  }

  const trimmedQuery = query.trim().toLowerCase();

  // 1. Allow friendly short greetings but restrict prolonged general chatting
  const shortGreetings = ['hi', 'hello', 'hey', 'hyy', 'yo', 'good morning', 'good afternoon', 'good evening'];
  if (shortGreetings.some(greet => trimmedQuery === greet || trimmedQuery === greet + ' 👋' || trimmedQuery === greet + '!')) {
    return next();
  }

  // 2. Content Moderation & Abuse Check
  for (const pattern of BLOCKED_TOPICS_REGEX) {
    if (pattern.test(trimmedQuery)) {
      return res.status(200).json({
        message: 'I can only help with educational subjects available on EduMasterPro.',
        offTopic: true
      });
    }
  }

  // 3. Subject Relevancy Validation
  // If the query contains any of the educational keywords, we allow it.
  const hasEducationalKeyword = ALLOWED_SUBJECTS_KEYWORDS.some(keyword => 
    trimmedQuery.includes(keyword)
  );

  // If it doesn't match any educational pattern, we soft refuse it to satisfy safety requirements
  if (!hasEducationalKeyword && trimmedQuery.split(' ').length > 2) {
    return res.status(200).json({
      message: 'I can only help with educational subjects available on EduMasterPro.',
      offTopic: true
    });
  }

  next();
}

module.exports = validateEducationalContext;
