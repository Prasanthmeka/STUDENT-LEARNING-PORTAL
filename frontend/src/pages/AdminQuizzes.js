import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminQuizzes.css';

const AdminQuizzes = () => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'
  const [uploadMode, setUploadMode] = useState('document'); // 'document' or 'manual'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [useAI, setUseAI] = useState(false);

  // Quiz management state
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('');

  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    passing_score: 50,
    time_limit_minutes: 30,
    subject: '',
    question_numbers: ''
  });

  const navigate = useNavigate();

  // Load quizzes when manage tab is active
  useEffect(() => {
    if (activeTab === 'manage') {
      loadAllQuizzes();
    }
  }, [activeTab]);

  const loadAllQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const response = await fetch('http://localhost:5000/api/quizzes/admin/all-quizzes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load quizzes');
      }

      const data = await response.json();
      setQuizzes(data || []);
    } catch (error) {
      setMessage('Error loading quizzes: ' + error.message);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const loadAllStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/all-students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load students');
      }

      const data = await response.json();
      setAllStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    setDeletingQuizId(quizId);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      setMessage('Quiz deleted successfully');
      loadAllQuizzes(); // Refresh list
    } catch (error) {
      setMessage('Error deleting quiz: ' + error.message);
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handleEnableForStudents = async (quizId) => {
    if (selectedStudents.length === 0) {
      setMessage('Please select at least one student');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/enable-for-students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_ids: selectedStudents
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enable quiz for students');
      }

      setMessage('Quiz enabled for selected students successfully');
      setSelectedStudents([]);
      setShowStudentSelector(false);
      loadAllQuizzes(); // Refresh list
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublishQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to unpublish this quiz?')) {
      return;
    }

    setDeletingQuizId(quizId);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/unpublish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish quiz');
      }

      setMessage('Quiz unpublished successfully');
      loadAllQuizzes(); // Refresh list
    } catch (error) {
      setMessage('Error unpublishing quiz: ' + error.message);
    } finally {
      setDeletingQuizId(null);
    }
  };

  const handlePublishQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to publish this quiz?')) {
      return;
    }

    setDeletingQuizId(quizId);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to publish quiz');
      }

      setMessage('Quiz published successfully');
      loadAllQuizzes(); // Refresh list
    } catch (error) {
      setMessage('Error publishing quiz: ' + error.message);
    } finally {
      setDeletingQuizId(null);
    }
  };


  const handleEnableForAllStudents = async (quizId) => {
    if (!window.confirm('Are you sure you want to enable this quiz for all students?')) {
      return;
    }

    setDeletingQuizId(quizId);
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/enable-for-all-students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to enable quiz for all students');
      }

      const data = await response.json();
      setMessage(data.message || 'Quiz enabled for all students successfully');
      loadAllQuizzes(); // Refresh list
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setDeletingQuizId(null);
    }
  };

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
      formData.append('use_ai', useAI);
      formData.append('subject', quizInfo.subject);

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
      setTimeout(() => {
        setShowConfirmation(false);
        setFile(null);
        setExtractedQuestions([]);
        setQuizInfo({
          title: '',
          description: '',
          passing_score: 50,
          time_limit_minutes: 30,
          subject: '',
          question_numbers: ''
        });
      }, 2000);
    } catch (error) {
      setMessage('Failed to create quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = subjectFilter
    ? quizzes.filter(quiz => quiz.subject === subjectFilter)
    : quizzes;

  return (
    <div className="admin-quizzes">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Back</button>
        <h1>Quiz Management</h1>
        <p>Create quizzes and manage student access</p>
      </header>

      <div className="container">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            📝 Create Quiz
          </button>
          <button
            className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            ⚙️ Manage Quizzes
          </button>
        </div>

        {activeTab === 'create' ? (
          // CREATE QUIZ TAB
          <>
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
                      <label>{useAI ? 'Number of Questions to Generate *' : 'Extract Specific Questions (Optional)'}</label>
                      <input
                        type="text"
                        name="question_numbers"
                        value={quizInfo.question_numbers}
                        onChange={handleQuizInfoChange}
                        disabled={loading}
                        placeholder={useAI ? 'e.g., 5 or 10 (defaults to 5)' : 'e.g., 1,3,5 or 1-5'}
                      />
                      <small>
                        {useAI 
                          ? 'Specify the total number of quiz questions you want the AI tutor to generate.'
                          : 'Enter question numbers separated by commas or ranges. Leave empty to extract all.'
                        }
                      </small>
                    </div>

                    <div className="form-group" style={{ background: 'rgba(147, 51, 234, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(147, 51, 234, 0.2)', margin: '20px 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: '700', color: '#d8b4fe' }}>
                        <input
                          type="checkbox"
                          checked={useAI}
                          onChange={(e) => setUseAI(e.target.checked)}
                          disabled={loading}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        ⚡ Generate Quiz questions with AI (Powered by OpenAI)
                      </label>
                      <p style={{ fontSize: '12px', color: '#a0aec0', margin: '8px 0 0 26px', lineHeight: '1.4' }}>
                        AI will analyze the uploaded document and generate high-quality MCQs, True/False, and Fill-in-the-blanks questions automatically.
                      </p>
                    </div>

                    {message && (
                      <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                      </div>
                    )}

                    <div className="form-buttons">
                      <button type="submit" disabled={loading || !file} className="btn-submit">
                        {loading ? 'Processing...' : (useAI ? '⚡ Generate AI Quiz' : 'Extract Questions from Document')}
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
          </>
        ) : (
          // MANAGE QUIZZES TAB
          <div className="quiz-management">
            <h2>All Quizzes</h2>
            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="filter-section">
              <label htmlFor="subject-filter">Filter by Subject:</label>
              <select
                id="subject-filter"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="filter-select"
                style={{ width: '280px', maxWidth: '100%', boxSizing: 'border-box' }}
              >
                <option value="">All Subjects</option>
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

            {loadingQuizzes ? (
              <p>Loading quizzes...</p>
            ) : quizzes.length === 0 ? (
              <p className="no-data">No quizzes found. Create one in the Create Quiz tab.</p>
            ) : filteredQuizzes.length === 0 ? (
              <p className="no-data">No quizzes found for the selected subject.</p>
            ) : (
              <div className="quizzes-list">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="quiz-card">
                    <div className="quiz-card-header">
                      <h3>{quiz.title}</h3>
                      <span className={`status-badge ${quiz.is_published ? 'published' : 'draft'}`}>
                        {quiz.is_published ? '✓ Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="quiz-card-content">
                      <p><strong>Subject:</strong> {quiz.subject || 'N/A'}</p>
                      <p><strong>Questions:</strong> {quiz.total_questions || 0}</p>
                      <p><strong>Passing Score:</strong> {quiz.passing_score}%</p>
                      <p><strong>Time Limit:</strong> {quiz.time_limit_minutes} minutes</p>
                      {quiz.description && (
                        <p><strong>Description:</strong> {quiz.description}</p>
                      )}
                    </div>
                    <div className="quiz-card-actions">
                      <button
                        className="btn-enable"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setSelectedStudents([]);
                          setShowStudentSelector(true);
                          if (allStudents.length === 0) {
                            loadAllStudents();
                          }
                        }}
                        disabled={loading}
                      >
                        👥 Enable for Students
                      </button>
                      <button
                        className="btn-enable-all"
                        onClick={() => handleEnableForAllStudents(quiz.id)}
                        disabled={deletingQuizId === quiz.id || loading}
                      >
                        {deletingQuizId === quiz.id ? '⏳...' : '👨‍👩‍👧‍👦 Enable All'}
                      </button>
                      {quiz.is_published ? (
                        <button
                          className="btn-unpublish"
                          onClick={() => handleUnpublishQuiz(quiz.id)}
                          disabled={deletingQuizId === quiz.id || loading}
                        >
                          {deletingQuizId === quiz.id ? '⏳...' : '📴 Unpublish'}
                        </button>
                      ) : (
                        <button
                          className="btn-publish"
                          onClick={() => handlePublishQuiz(quiz.id)}
                          disabled={deletingQuizId === quiz.id || loading}
                        >
                          {deletingQuizId === quiz.id ? '⏳...' : '🚀 Publish'}
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={deletingQuizId === quiz.id}
                      >
                        {deletingQuizId === quiz.id ? '⏳...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Student Selector Modal */}
            {showStudentSelector && selectedQuiz && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Enable "{selectedQuiz.title}" for Students</h3>
                  <p>Select students who should have access to this quiz:</p>

                  <div className="student-list">
                    {loadingStudents ? (
                      <p>Loading students...</p>
                    ) : allStudents.length === 0 ? (
                      <p>No students found</p>
                    ) : (
                      allStudents.map((student) => (
                        <label key={student.id} className="student-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }
                            }}
                          />
                          <span>{student.full_name} ({student.email})</span>
                        </label>
                      ))
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      className="btn-submit"
                      onClick={() => handleEnableForStudents(selectedQuiz.id)}
                      disabled={loading || selectedStudents.length === 0}
                    >
                      {loading ? 'Enabling...' : 'Enable for Selected Students'}
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setShowStudentSelector(false);
                        setSelectedQuiz(null);
                        setSelectedStudents([]);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuizzes;
