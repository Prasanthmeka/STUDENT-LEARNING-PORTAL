import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminQuizzes.css';

const AdminQuizzes = () => {
  const [uploadMode, setUploadMode] = useState('document'); // 'document' or 'manual'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    passing_score: 50,
    time_limit_minutes: 30,
    subject: '',
    question_numbers: ''
  });
  
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleQuizInfoChange = (e) => {
    const { name, value } = e.target;
    setQuizInfo({
      ...quizInfo,
      [name]: name === 'passing_score' || name === 'time_limit_minutes' ? parseInt(value) : value
    });
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!file) {
      setMessage('Please select a file');
      setLoading(false);
      return;
    }

    if (!quizInfo.title) {
      setMessage('Please enter a quiz title');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (quizInfo.question_numbers) {
        formData.append('question_numbers', quizInfo.question_numbers);
      }

      // Call backend to extract questions
      const response = await fetch('http://localhost:5000/api/quizzes/extract-questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract questions');
      }

      setExtractedQuestions(data.questions);
      setShowConfirmation(true);
      setMessage('');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (idx, field, value) => {
    const updated = [...extractedQuestions];
    updated[idx][field] = value;
    setExtractedQuestions(updated);
  };

  const handleEditOption = (qIdx, oIdx, field, value) => {
    const updated = [...extractedQuestions];
    updated[qIdx].options[oIdx][field] = field === 'is_correct' ? value : value;
    setExtractedQuestions(updated);
  };

  const handleCreateQuizFromDocument = async () => {
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        title: quizInfo.title,
        description: quizInfo.description,
        passing_score: quizInfo.passing_score,
        time_limit_minutes: quizInfo.time_limit_minutes,
        subject: quizInfo.subject,
        questions: extractedQuestions
      };

      await fetch('http://localhost:5000/api/quizzes/from-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setMessage('Quiz created successfully!');
      setTimeout(() => navigate('/admin/dashboard'), 2000);
    } catch (error) {
      setMessage('Failed to create quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-quizzes">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Back</button>
        <h1>Create Quiz</h1>
        <p>Upload a document or add questions manually</p>
      </header>

      <div className="container">
        {!showConfirmation ? (
          <div className="quiz-form">
            <div className="mode-selector">
              <button
                className={`mode-btn ${uploadMode === 'document' ? 'active' : ''}`}
                onClick={() => setUploadMode('document')}
                disabled={loading}
              >
                📄 Upload Document
              </button>
              <button
                className={`mode-btn ${uploadMode === 'manual' ? 'active' : ''}`}
                onClick={() => setUploadMode('manual')}
                disabled={loading}
              >
                ✏️ Manual Entry
              </button>
            </div>

            {uploadMode === 'document' ? (
              // Document Upload Mode
              <form onSubmit={handleUploadDocument} className="form-section">
                <h2>Upload Document to Extract Questions</h2>

                <div className="form-group">
                  <label>Quiz Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={quizInfo.title}
                    onChange={handleQuizInfoChange}
                    required
                    disabled={loading}
                    placeholder="e.g., Chapter 5 Assessment"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={quizInfo.description}
                    onChange={handleQuizInfoChange}
                    disabled={loading}
                    placeholder="Quiz instructions"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Passing Score (%) *</label>
                    <input
                      type="number"
                      name="passing_score"
                      value={quizInfo.passing_score}
                      onChange={handleQuizInfoChange}
                      min="0"
                      max="100"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Time Limit (minutes)</label>
                    <input
                      type="number"
                      name="time_limit_minutes"
                      value={quizInfo.time_limit_minutes}
                      onChange={handleQuizInfoChange}
                      min="1"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    name="subject"
                    value={quizInfo.subject}
                    onChange={handleQuizInfoChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Subject</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Maths">Maths</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Social">Social Studies</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Upload Document (PDF, TXT, or DOCX) *</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.txt,.docx"
                      disabled={loading}
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="file-label">
                      {file ? file.name : 'Choose file or drag and drop'}
                    </label>
                  </div>
                  <small>
                    Format: Numbered questions (1. Question?, 2. Question?, etc.) with options (A) Option, B) Option, etc.)
                  </small>
                </div>

                <div className="form-group">
                  <label>Extract Specific Questions (Optional)</label>
                  <input
                    type="text"
                    name="question_numbers"
                    value={quizInfo.question_numbers}
                    onChange={handleQuizInfoChange}
                    disabled={loading}
                    placeholder="e.g., 1,3,5 or 1-5"
                  />
                  <small>
                    Enter question numbers separated by commas or ranges. Leave empty to extract all.
                  </small>
                </div>

                {message && (
                  <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                  </div>
                )}

                <div className="form-buttons">
                  <button type="submit" disabled={loading || !file} className="btn-submit">
                    {loading ? 'Processing...' : 'Extract Questions from Document'}
                  </button>
                </div>
              </form>
            ) : (
              // Manual Entry Mode
              <div className="form-section">
                <p style={{ textAlign: 'center', color: '#666' }}>
                  Manual entry mode coming soon. Please use document upload for now.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Confirmation View
          <div className="confirmation-view">
            <h2>Review Extracted Questions</h2>
            <p style={{ color: '#e0e0e0', marginBottom: '20px' }}>
              {extractedQuestions.length} questions found. Review and edit if needed before creating quiz.
            </p>

            <div className="quiz-summary">
              <div className="summary-item">
                <strong>Title:</strong> {quizInfo.title}
              </div>
              <div className="summary-item">
                <strong>Questions:</strong> {extractedQuestions.length}
              </div>
              <div className="summary-item">
                <strong>Passing Score:</strong> {quizInfo.passing_score}%
              </div>
            </div>

            {extractedQuestions.map((question, qIdx) => (
              <div key={qIdx} className="question-block">
                <div className="question-header">
                  <h3>Question {qIdx + 1}</h3>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>Question Text</label>
                    <input
                      type="text"
                      value={question.question_text}
                      onChange={(e) => handleEditQuestion(qIdx, 'question_text', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Marks</label>
                    <input
                      type="number"
                      min="1"
                      value={question.marks || 1}
                      onChange={(e) => handleEditQuestion(qIdx, 'marks', parseInt(e.target.value) || 1)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {question.options && question.options.length > 0 && (
                  <div className="options-section">
                    <label>Options</label>
                    {question.options.map((option, oIdx) => (
                      <div key={oIdx} className="option-row">
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleEditOption(qIdx, oIdx, 'text', e.target.value)}
                          disabled={loading}
                        />
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={option.is_correct}
                            onChange={(e) => handleEditOption(qIdx, oIdx, 'is_correct', e.target.checked)}
                            disabled={loading}
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="form-buttons">
              <button
                onClick={handleCreateQuizFromDocument}
                disabled={loading}
                className="btn-submit"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setExtractedQuestions([]);
                  setFile(null);
                }}
                disabled={loading}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuizzes;
