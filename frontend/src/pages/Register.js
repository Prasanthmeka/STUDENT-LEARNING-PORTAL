import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import '../styles/LandingPage.css';
import LearnoQubeLogo from '../components/LearnoQubeLogo';
import CustomSelect from '../components/dashboard/CustomSelect';

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
  const { register } = useAuth();
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
      const response = await register(userData);
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.error || 'Registration failed');
    } finally {
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
        </div>
      </div>
    </div>
  );
};

export default Register;
