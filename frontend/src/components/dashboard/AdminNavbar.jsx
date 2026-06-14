import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  Menu,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

const AdminNavbar = ({ setIsMobileOpen, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Silhouette Vector Placeholder for Admin
  const adminAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a5b4fc"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/></svg>`;

  // State Management
  const [time, setTime] = useState(new Date());
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

  // Click outside and escape key down to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
    { id: 1, text: "New Premium subscription activated by Prasanth Meka!", type: "subscription", time: "3m ago" },
    { id: 2, text: "Overall quiz pass rate has increased to 78.4% this week.", type: "analytics", time: "45m ago" },
    { id: 3, text: "Server resources status: Healthy (CPU load 14%).", type: "system", time: "3h ago" }
  ];

  // Reactive Theme Accent state
  const [themeAccent, setThemeAccent] = useState(() => localStorage.getItem('admin_theme_accent') || 'purple');
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeAccent(localStorage.getItem('admin_theme_accent') || 'purple');
    };
    window.addEventListener('admin-theme-changed', handleThemeChange);
    return () => window.removeEventListener('admin-theme-changed', handleThemeChange);
  }, []);

  const getAccentColors = () => {
    switch (themeAccent) {
      case 'pink':
        return {
          text: 'text-pink-600',
          hoverText: 'hover:text-pink-700',
          bg: 'bg-pink-500',
          hoverBg: 'hover:bg-pink-50',
          iconColor: 'text-pink-500',
          pillBg: 'bg-pink-100 text-pink-700'
        };
      case 'green':
        return {
          text: 'text-emerald-600',
          hoverText: 'hover:text-emerald-700',
          bg: 'bg-emerald-600',
          hoverBg: 'hover:bg-emerald-50',
          iconColor: 'text-emerald-500',
          pillBg: 'bg-emerald-100 text-emerald-700'
        };
      case 'orange':
        return {
          text: 'text-orange-655',
          hoverText: 'hover:text-orange-700',
          bg: 'bg-orange-500',
          hoverBg: 'hover:bg-orange-50',
          iconColor: 'text-orange-500',
          pillBg: 'bg-orange-100 text-orange-700'
        };
      case 'purple':
      default:
        return {
          text: 'text-[#6366F1]',
          hoverText: 'hover:text-indigo-700',
          bg: 'bg-[#6366F1]',
          hoverBg: 'hover:bg-indigo-50/50',
          iconColor: 'text-[#6366F1]',
          pillBg: 'bg-indigo-100 text-indigo-700'
        };
    }
  };

  const navColors = getAccentColors();

  return (
    <header className="sticky top-0 z-[1000] shrink-0 flex flex-wrap items-center justify-between min-h-[80px] h-auto py-4 pl-6 md:pl-8 pr-6 md:pr-12 bg-white/70 dark:bg-slate-955/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-900 shadow-sm transition-all duration-300 gap-4 overflow-visible">
      
      {/* Search Input Container & Mobile Menu */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Drawer Open Button */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-slate-650 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Filter Table Search */}
        <div className="relative hidden max-w-xs md:block">
          <Search className="absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students, emails..." 
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 placeholder-slate-455 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Action Items, Live Clock, Notifications & Dropdowns */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Live Running System Clock */}
        <div className="hidden lg:flex flex-col items-end shrink-0">
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-wide tabular-nums font-sans">
            {formatTime(time)}
          </span>
          <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            {formatDate(time)}
          </span>
        </div>


        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-550 ring-2 ring-white dark:ring-slate-955"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-[-80px] md:right-0 top-full w-80 max-w-[calc(100vw-32px)] mt-3.5 origin-top-right rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-955 p-4 shadow-2xl ring-1 ring-black/5 z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
                  <span className="font-bold text-slate-850 dark:text-slate-100 text-xs tracking-wide">System Notifications</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${navColors.pillBg}`}>3 New</span>
                </div>
                
                <div className="mt-3 space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-2 rounded-xl transition-all duration-150">
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'subscription' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : notif.type === 'analytics' ? (
                          <Activity className={`w-4 h-4 ${navColors.iconColor}`} />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold font-sans">{notif.text}</p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider line */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-900"></div>

        {/* Admin profile drop-down */}
        <div className="relative overflow-visible" ref={profileRef}>
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group hover:border-indigo-400 transition-colors duration-200">
              <img 
                src={adminAvatar} 
                alt="Admin Profile"
                className="w-7 h-7 object-contain opacity-90 transition-transform duration-200 hover:scale-105"
              />
            </div>
            <div className="hidden text-left md:block">
              <span className="block text-xs font-black text-slate-805 dark:text-slate-100 tracking-wide font-sans max-w-[120px] truncate leading-none">
                {user?.full_name?.split(' ')[0] || "Admin"}
              </span>
              <span className={`block text-[9px] font-extrabold uppercase tracking-widest mt-1 ${navColors.text}`}>
                SUPER ADMIN
              </span>
            </div>
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="absolute right-0 top-full mt-2 w-auto min-w-[220px] rounded-[16px] border border-[#E5E7EB] bg-white text-[#1E293B] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-[9999] overflow-visible"
              >
                <div className="pb-3 border-b border-[#E5E7EB] mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50/50 border border-[#E5E7EB] flex items-center justify-center overflow-hidden shrink-0">
                      <img src={adminAvatar} alt="Admin" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-[#1E293B] truncate leading-none">{user?.full_name || "Prasanth Meka"}</p>
                      <p className={`text-[9px] font-black uppercase tracking-wider mt-1.5 ${navColors.text}`}>Super Admin</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* 1. Account Settings */}
                  <button 
                    onClick={() => { setShowProfileDropdown(false); navigate('/admin/settings'); }}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl text-[#1E293B] hover:bg-[#F3F4F6] transition-all duration-200"
                  >
                    <Settings className="w-4 h-4 text-purple-500 shrink-0" />
                    <span>Account Settings</span>
                  </button>

                  {/* 2. Logout */}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50/50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default AdminNavbar;
