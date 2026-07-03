import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import '../styles/LandingPage.css';
import LearnoQubeLogo from '../components/LearnoQubeLogo';
import CustomSelect from '../components/dashboard/CustomSelect';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    class: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.class) {
      setError('Please select a class');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await authAPI.register(userData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
      </div>
      <div className="auth-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-card">
          <div className="flex items-center justify-center gap-2 mb-6 select-none">
            <LearnoQubeLogo className="w-9 h-9 shrink-0" />
            <span className="font-bold text-3xl tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">LearnoQube</span>
          </div>
          {success ? (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-saas animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white" style={{ marginTop: '16px' }}>Registration Successful!</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                Your student profile has been created successfully.<br />
                Redirecting you to the login portal...
              </p>
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mt-6"></div>
            </div>
          ) : (
            <>
              <h3>Register</h3>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Class</label>
              <CustomSelect
                value={formData.class}
                onChange={(val) => setFormData({ ...formData, class: val })}
                options={[
                  { value: '', label: 'Select Class' },
                  { value: 'Class 6', label: 'Class 6' },
                  { value: 'Class 7', label: 'Class 7' },
                  { value: 'Class 8', label: 'Class 8' },
                  { value: 'Class 9', label: 'Class 9' },
                  { value: 'Class 10', label: 'Class 10' }
                ]}
                className="!py-2.5 !px-4 text-xs font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-205 dark:border-slate-850"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p>Already have an account? <a href="/login">Login</a></p>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
