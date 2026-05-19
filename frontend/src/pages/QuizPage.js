import React, { useState, useEffect } from 'react';
import { quizAPI } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/QuizPage.css';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [responses, setResponses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  const fetchQuiz = async () => {
    try {
      // Check if student already attempted
      try {
        const attemptResponse = await quizAPI.getMyAttempts(id);
        if (attemptResponse.data && attemptResponse.data.length > 0) {
          const attempt = attemptResponse.data[0];
          setResult(attempt.result);
          setResponses(attempt.responses);
          
          const response = await quizAPI.getQuiz(id);
          setQuiz(response.data);
          
          setSubmitted(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error checking previous attempts:', err);
      }

      const response = await quizAPI.getQuiz(id);
      setQuiz(response.data);
      if (response.data.time_limit_minutes) {
        setTimeLeft(response.data.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmitQuiz = async () => {
    try {
      const answersArray = quiz.questions.map((q) => {
        const studentAnswer = answers[q.id];
        return {
          question_id: q.id,
          // If it's an array (multiple select), we will send it as an array
          option_id: q.question_type === 'multiple_choice' ? studentAnswer : null,
          text_response: q.question_type !== 'multiple_choice' ? studentAnswer : null
        };
      });

      const response = await quizAPI.submitQuiz(id, answersArray);
      setResult(response.data.result);
      setResponses(response.data.responses || []);
      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit quiz');
      console.error(error);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;

  if (!quiz) return <div className="error">Quiz not found</div>;

  if (submitted && result) {
    return (
      <div className="quiz-results">
        <header className="result-header">
          <button onClick={() => navigate('/student/quizzes')} className="btn-back">← Back</button>
          <h1>Quiz Complete!</h1>
          <p>{quiz.title}</p>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', display: 'inline-block', marginTop: '10px' }}>
            🔒 You have already completed this quiz. Retakes are not allowed.
          </div>
        </header>

        <div className="result-summary">
          <div className="result-card">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-value">{Number(result.percentage).toFixed(1)}%</span>
              </div>
              <div className="score-details">
                <p><strong>Marks:</strong> {result.marksObtained} / {result.totalMarks}</p>
                <p className={`status ${result.isPassed ? 'passed' : 'failed'}`}>
                  {result.isPassed ? '✓ PASSED' : '✗ FAILED'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="detailed-results">
          <h2>Review Your Answers</h2>
          
          {quiz.questions.map((question, qIdx) => {
            const response = responses.find(r => r.question_id === question.id);
            const isCorrect = response?.is_correct;
            
            return (
              <div key={question.id} className={`result-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-question-header">
                  <h3>Question {qIdx + 1} {isCorrect ? '✓' : '✗'}</h3>
                  <span className="marks-badge">
                    {response?.marks_obtained || 0} / {question.marks || 1} marks
                  </span>
                </div>

                <p className="question-text">{question.question_text}</p>

                {question.question_type === 'multiple_choice' ? (
                  <div className="result-options">
                    {question.quiz_options && question.quiz_options.map((option) => {
                      // Check if it's a multiple select by seeing if the response stored an array of IDs in text_response
                      let studentSelectedThis = false;
                      if (response?.selected_option_id === option.id) {
                        studentSelectedThis = true;
                      } else if (response?.text_response && response.text_response.startsWith('[')) {
                        try {
                          const parsed = JSON.parse(response.text_response);
                          if (Array.isArray(parsed) && parsed.includes(option.id)) {
                            studentSelectedThis = true;
                          }
                        } catch(e) {}
                      }

                      const isCorrectAnswer = option.is_correct;
                      
                      return (
                        <div
                          key={option.id}
                          className={`result-option ${
                            isCorrectAnswer ? 'correct-answer' : ''
                          } ${studentSelectedThis && isCorrect ? 'student-correct' : ''} ${
                            studentSelectedThis && !isCorrect ? 'student-wrong' : ''
                          }`}
                        >
                          <span className="option-label">{String.fromCharCode(65 + (question.quiz_options.indexOf(option)))}</span>
                          <span className="option-text">{option.option_text}</span>
                          
                          {isCorrectAnswer && (
                            <span className="correct-label">✓ Correct Answer</span>
                          )}
                          {studentSelectedThis && !isCorrect && (
                            <span className="wrong-label">✗ Your Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-answer-review">
                    <p><strong>Your Answer:</strong> {response?.text_response || 'No answer'}</p>
                    <p><strong>Correct Answer:</strong> {question.correct_answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="result-actions">
          <button onClick={() => navigate('/student/quizzes')} className="btn-back">
            Back to Quizzes
          </button>
          <button onClick={() => navigate('/student/leaderboard')} className="btn-leaderboard">
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return <div className="error">No questions in this quiz</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button onClick={() => navigate('/student/quizzes')} className="btn-back">← Back</button>
        <h1>{quiz.title}</h1>
        <div className="quiz-info">
          <span>Question {currentQuestionIdx + 1} of {quiz.questions.length}</span>
          {timeLeft !== null && (
            <span className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
              Time: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-section">
        <h3>{currentQuestion.question_text}</h3>

        {currentQuestion.question_type === 'multiple_choice' ? (
          <div className="options">
            {(() => {
              const multipleCorrect = currentQuestion.quiz_options && currentQuestion.quiz_options.filter(o => o.is_correct).length > 1;
              return currentQuestion.quiz_options && currentQuestion.quiz_options.map((option, oIdx) => (
                <label key={option.id} className="option">
                  <input
                    type={multipleCorrect ? "checkbox" : "radio"}
                    name={`answer-${currentQuestion.id}`}
                    value={option.id}
                    checked={
                      multipleCorrect 
                        ? (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option.id))
                        : answers[currentQuestion.id] === option.id
                    }
                    onChange={(e) => {
                      if (multipleCorrect) {
                        const currentAnswers = Array.isArray(answers[currentQuestion.id]) ? [...answers[currentQuestion.id]] : [];
                        if (e.target.checked) {
                          currentAnswers.push(option.id);
                        } else {
                          const idx = currentAnswers.indexOf(option.id);
                          if (idx > -1) currentAnswers.splice(idx, 1);
                        }
                        handleAnswerChange(currentQuestion.id, currentAnswers);
                      } else {
                        handleAnswerChange(currentQuestion.id, option.id);
                      }
                    }}
                  />
                  <span className="option-letter">{String.fromCharCode(65 + oIdx)}</span>
                  <span>{option.option_text}</span>
                </label>
              ));
            })()}
          </div>
        ) : (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Enter your answer"
            className="text-answer"
          />
        )}
      </div>

      <div className="nav-buttons">
        <button
          onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
          disabled={currentQuestionIdx === 0}
          className="btn-nav"
        >
          ← Previous
        </button>
        
        <div className="question-counter">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIdx(idx)}
              className={`question-dot ${idx === currentQuestionIdx ? 'active' : ''} ${
                answers[quiz.questions[idx].id] ? 'answered' : ''
              }`}
              title={`Question ${idx + 1}`}
            />
          ))}
        </div>

        {currentQuestionIdx === quiz.questions.length - 1 ? (
          <button onClick={handleSubmitQuiz} className="btn-submit-quiz">
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
            className="btn-nav"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
