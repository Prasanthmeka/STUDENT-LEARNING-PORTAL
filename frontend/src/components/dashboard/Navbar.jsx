import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { notificationAPI } from '../../services/api';

const Navbar = ({ isCollapsed, setIsMobileOpen, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Silhouette Vector Placeholder Avatar
  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2364748b"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/></svg>`;

  // State Management
  const [time, setTime] = useState(new Date());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Refs for closing dropdowns when clicking outside
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!user || user.role !== 'student') return;
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch on load & periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch immediately when opened
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Format Date and Time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    
    if (diffMs < 0) return 'Just now';
    
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 flex items-center justify-between h-20 px-6 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-300">
      {/* Search Bar & Mobile Toggle */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>


      </div>

      {/* Dynamic Date-Time, Theme & Action Items */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Live Clock Display (Dasher aesthetic) */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-wide tabular-nums font-sans">
            {formatTime(time)}
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            {formatDate(time)}
          </span>
        </div>

        {/* Notifications Center */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-smooth"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => !n.is_read) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-[-80px] md:right-0 top-full w-80 max-w-[calc(100vw-32px)] mt-3.5 origin-top-right rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifications</span>
                {notifications.some(n => !n.is_read) && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                      className={`flex gap-3 p-2 rounded-xl transition-smooth cursor-pointer ${
                        notif.is_read 
                          ? 'hover:bg-slate-50 dark:hover:bg-slate-850/50 opacity-70' 
                          : 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 border-l-2 border-indigo-500 pl-1.5'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'success' ? (
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4.5 h-4.5 text-indigo-500" />
                        )}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className={`text-xs leading-normal font-sans ${notif.is_read ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-800 dark:text-slate-200 font-semibold'}`}>
                          {notif.text}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 self-center shrink-0"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* Student Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-850 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              <img 
                src={defaultAvatar} 
                alt="Profile Silhouette"
                className="w-7 h-7 object-contain opacity-75"
              />
            </div>
            <div className="hidden text-left md:block">
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-wide font-sans truncate max-w-[120px]">
                {user?.full_name?.split(' ')[0] || "Prasanth"}
              </span>
              <span className="block text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                {user?.role || "Student"}
              </span>
            </div>
          </button>

          {/* Profile Action Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 w-56 mt-3.5 origin-top-right rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5 font-sans">{user?.email || "prasanthmeka2003@gmail.com"}</p>
              </div>

              <div className="p-1.5 space-y-0.5">
                {localStorage.getItem('loginType') !== 'quiz' && (
                  <>
                    <a 
                      href="/student/settings" 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/student/settings');
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-855 transition-smooth"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </a>
                    <a 
                      href="#settings-section" 
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/student/settings');
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-smooth"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </a>
                  </>
                )}

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm font-medium rounded-xl text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-smooth"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
