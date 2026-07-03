import React, { createContext, useState, useEffect } from 'react';
import { authAPI, subscriptionAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize user on mount
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);

      if (response.data && response.data.loginType) {
        localStorage.setItem('loginType', response.data.loginType);
      }

      // Load active subscriptions securely for student
      if (response.data && response.data.role === 'student') {
        try {
          const subResp = await subscriptionAPI.getMySubscription();
          if (subResp.data) {
            localStorage.setItem('subscribedSubjects', JSON.stringify(subResp.data.subscribed_subjects || []));
            localStorage.setItem('activePlan', subResp.data.active_plan || 'Free Trial');
          } else {
            localStorage.setItem('subscribedSubjects', JSON.stringify([]));
            localStorage.setItem('activePlan', 'Free Trial');
          }
        } catch (subErr) {
          console.log('No active subscription found on backend, using Free Trial.');
          localStorage.setItem('subscribedSubjects', JSON.stringify([]));
          localStorage.setItem('activePlan', 'Free Trial');
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('subscribedSubjects');
      localStorage.removeItem('activePlan');
      localStorage.removeItem('loginType');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      if (response.data.user && response.data.user.loginType) {
        localStorage.setItem('loginType', response.data.user.loginType);
      }
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('subscribedSubjects');
    localStorage.removeItem('activePlan');
    localStorage.removeItem('loginType');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
