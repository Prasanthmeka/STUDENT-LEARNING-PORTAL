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
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = ({ isCollapsed, setIsMobileOpen, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  // Silhouette Vector Placeholder Avatar
  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2364748b"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/></svg>`;

  // State Management
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  // Sync Dark/Light Mode Theme on Mount
  useEffect(() => {
    const cachedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (cachedTheme === 'dark' || (!cachedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Theme Switch Toggle Handler (available for future use in UI)
  // eslint-disable-next-line no-unused-vars
  const handleThemeToggle = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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

  const notifications = [
    { id: 1, text: "Your English quiz has been graded!", type: "success", time: "5m ago" },
    { id: 2, text: "New study materials uploaded in Maths.", type: "info", time: "2h ago" },
    { id: 3, text: "Biology test passing score adjusted to 55%.", type: "warning", time: "1d ago" }
  ];

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
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-[-80px] md:right-0 top-full w-80 max-w-[calc(100vw-32px)] mt-3.5 origin-top-right rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifications</span>
                <button className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold hover:underline">Mark all read</button>
              </div>
              <div className="mt-3 space-y-3.5">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 p-1.5 rounded-xl transition-smooth">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'success' ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4.5 h-4.5 text-indigo-500" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-sans font-medium">{notif.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleThemeToggle();
                  }}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  {/* Premium Switch Toggle */}
                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-350 dark:bg-slate-700'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 transform ${isDarkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </button>
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
