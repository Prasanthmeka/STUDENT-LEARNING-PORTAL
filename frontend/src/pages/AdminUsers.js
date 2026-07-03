import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsersList(response.data);
    } catch (error) {
      setMessage('Failed to load users: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await authAPI.updateUserRole(id, newRole);
      setUsersList(usersList.map(u => u.id === id ? { ...u, role: newRole } : u));
      setMessage(`User role updated to ${newRole} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update user role: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="admin-users">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">← Back</button>
        <h1>Manage Users</h1>
        <p>View and modify user roles</p>
      </header>

      <div className="container">
        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="users-list-container">
          <h2>Registered Users ({usersList.length})</h2>
          
          {loading && usersList.length === 0 ? (
            <p style={{ color: '#e0e0e0' }}>Loading users...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id}>
                      <td>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span style={{ fontWeight: '600', color: u.class ? '#e2e8f0' : '#94a3b8' }}>
                          {u.class || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-student'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.id !== user?.id && ( // Prevent admin from changing their own role
                          u.role === 'student' ? (
                            <button 
                              className="btn-make-admin"
                              onClick={() => handleUpdateRole(u.id, 'admin')}
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button 
                              className="btn-revoke-admin"
                              onClick={() => handleUpdateRole(u.id, 'student')}
                            >
                              Revoke Admin
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
