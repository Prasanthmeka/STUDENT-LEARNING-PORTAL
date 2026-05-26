import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/auth/profile'),
  getUsers: () => API.get('/auth/users'),
  updateUserRole: (id, role) => API.put(`/auth/users/${id}/role`, { role })
};

// Video APIs
export const videoAPI = {
  createVideo: (videoData) => API.post('/videos', videoData),
  getVideos: () => API.get('/videos'),
  getVideo: (id) => API.get(`/videos/${id}`),
  updateVideo: (id, data) => API.put(`/videos/${id}`, data),
  deleteVideo: (id) => API.delete(`/videos/${id}`)
};

// Material APIs
export const materialAPI = {
  createMaterial: (materialData) => API.post('/materials', materialData),
  getMaterials: () => API.get('/materials'),
  getMaterial: (id) => API.get(`/materials/${id}`),
  updateMaterial: (id, data) => API.put(`/materials/${id}`, data),
  deleteMaterial: (id) => API.delete(`/materials/${id}`)
};

// Quiz APIs
export const quizAPI = {
  createQuiz: (quizData) => API.post('/quizzes', quizData),
  getQuizzes: () => API.get('/quizzes'),
  getQuiz: (id) => API.get(`/quizzes/${id}`),
  submitQuiz: (id, answers, startedAt) => API.post(`/quizzes/${id}/submit`, { answers, startedAt }),
  getAttempt: (quizId, attemptId) => API.get(`/quizzes/${quizId}/attempt/${attemptId}`),
  getMyAttempts: (quizId) => API.get(`/quizzes/${quizId}/my-attempts`),
  getAllAttempts: (quizId) => API.get(`/quizzes/${quizId}/all-attempts`),
  deleteAttempt: (attemptId) => API.delete(`/quizzes/attempt/${attemptId}`)
};

// Leaderboard APIs
export const leaderboardAPI = {
  getLeaderboard: () => API.get('/leaderboard'),
  getStudentRank: (studentId) => API.get(`/leaderboard/student/${studentId}`)
};

// Subscription APIs
export const subscriptionAPI = {
  createSubscription: (data) => API.post('/subscriptions', data),
  getMySubscription: () => API.get('/subscriptions/my-subscription'),
  upgradeSubscription: (subscriptionId, data) => API.put(`/subscriptions/${subscriptionId}`, data)
};

// Course APIs
export const courseAPI = {
  getCourses: () => API.get('/courses')
};

// Analytics APIs
export const analyticsAPI = {
  getStudentDashboard: () => API.get('/analytics/student-dashboard'),
  getAdminDashboard: () => API.get('/analytics/admin-dashboard')
};

// AI Assistant APIs
export const aiAPI = {
  chat: (message, history, language) => API.post('/ai/chat', { message, history, language }),
  summarize: (materialId, text, actionType, language) => API.post('/ai/summarize', { materialId, text, actionType, language }),
  generateQuiz: (materialId, text, count, subject) => API.post('/ai/generate-quiz', { materialId, text, count, subject }),
  explainAnswer: (attemptId) => API.post('/ai/explain-answer', { attemptId }),
  getRecommendations: () => API.post('/ai/recommendations')
};

export default API;
