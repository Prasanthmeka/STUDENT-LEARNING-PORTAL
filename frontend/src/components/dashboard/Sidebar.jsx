import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LearnoQubeLogo from '../LearnoQubeLogo';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  Trophy, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Reactive Theme Accent state
  const [themeAccent, setThemeAccent] = React.useState(() => localStorage.getItem('student_theme_accent') || 'indigo');
  React.useEffect(() => {
    const handleThemeChange = () => {
      setThemeAccent(localStorage.getItem('student_theme_accent') || 'indigo');
    };
    window.addEventListener('student-theme-changed', handleThemeChange);
    return () => window.removeEventListener('student-theme-changed', handleThemeChange);
  }, []);

  const getActiveLinkClass = () => {
    switch (themeAccent) {
      case 'purple':
        return 'text-purple-600 bg-purple-50/80 border-l-4 border-purple-500 shadow-[0_4px_12px_rgba(139,92,246,0.08)] font-bold';
      case 'cyan':
        return 'text-cyan-600 bg-cyan-50/80 border-l-4 border-cyan-500 shadow-[0_4px_12px_rgba(6,182,212,0.08)] font-bold';
      case 'emerald':
        return 'text-emerald-600 bg-emerald-50/80 border-l-4 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.08)] font-bold';
      case 'rose':
        return 'text-rose-600 bg-rose-50/80 border-l-4 border-rose-500 shadow-[0_4px_12px_rgba(244,63,94,0.08)] font-bold';
      case 'indigo':
      default:
        return 'text-indigo-650 bg-indigo-50/80 border-l-4 border-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.08)] font-bold';
    }
  };

  const getActiveIconClass = () => {
    switch (themeAccent) {
      case 'purple': return 'text-purple-500';
      case 'cyan': return 'text-cyan-500';
      case 'emerald': return 'text-emerald-500';
      case 'rose': return 'text-rose-500';
      case 'indigo':
      default: return 'text-indigo-500';
    }
  };

  // Silhouette Vector Placeholder Avatar
  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2364748b"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/></svg>`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const loginType = localStorage.getItem('loginType');

  const menuItems = loginType === 'quiz'
    ? [
        { name: 'Quizzes', path: '/student/quizzes', icon: ClipboardList }
      ]
    : [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Courses', path: '/student/videos', icon: BookOpen }, 
        { name: 'Tests', path: '/student/quizzes', icon: ClipboardList }, 
        { name: 'Study Materials', path: '/student/materials', icon: FileText },
        { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
        { name: 'Subscription', path: '/student/subscription', icon: CreditCard },
        { name: 'Settings', path: '/student/settings', icon: Settings },
      ];

  const handleNavigation = (item) => {
    setIsMobileOpen(false);
    if (item.isAnchor) {
      if (location.pathname === '/student/dashboard') {
        const element = document.querySelector(item.path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Navigate to dashboard and append hash
        navigate(`/student/dashboard${item.path}`);
      }
    } else {
      navigate(item.path);
    }
  };

  // Check if link is active
  const isActive = (item) => {
    if (item.isAnchor) {
      return location.pathname === '/student/dashboard' && location.hash === item.path;
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        animate={{ 
          width: isCollapsed ? '80px' : '260px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#F8FAFF] text-[#1E293B] border-r border-[#E5E7EB] shadow-md transition-all duration-300 backdrop-blur-md
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'items-center' : 'items-stretch'}
          w-[260px] md:block`}
      >
        {/* Top Header Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#E5E7EB] shrink-0 w-full relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 shrink-0">
              <LearnoQubeLogo className="w-10 h-10" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 font-sans"
              >
                LearnoQube
              </motion.span>
            )}
          </div>
          
          {/* Collapse Button for Desktop */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden absolute right-[-12px] top-7 z-[60] w-6 h-6 rounded-full border border-[#E5E7EB] bg-white text-[#1E293B] hover:bg-[#F3F4F6] transition-all duration-200 shadow-md md:flex items-center justify-center"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Profile Card with Neutral Silhouette */}
        <div className={`p-4 border-b border-[#E5E7EB] shrink-0 ${isCollapsed ? 'flex justify-center p-2.5 w-full' : ''}`}>
          <div className={`relative overflow-visible rounded-2xl bg-white border border-[#E5E7EB] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(99,102,241,0.06)] group ${isCollapsed ? 'p-1.5 w-12 h-12 flex items-center justify-center mx-auto' : 'p-4 w-full flex items-center gap-3'}`}>
            <div className="relative shrink-0 w-10 h-10 rounded-xl bg-slate-100 border border-[#E5E7EB] flex items-center justify-center overflow-visible shadow-inner">
              <img 
                src={defaultAvatar} 
                alt="Profile Silhouette"
                className="w-7 h-7 object-contain opacity-75"
              />
              {/* Online Status Indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500 shadow-md"></span>
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-800 truncate text-sm tracking-wide font-sans">{user?.full_name || "Prasanth Meka"}</h4>
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Student Status</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-sm font-medium transition-smooth relative group
                  ${active 
                    ? getActiveLinkClass() 
                    : 'text-slate-600 hover:text-[#6366F1] hover:bg-gradient-to-r hover:from-[#EEF2FF] hover:to-[#E0E7FF] border-l-4 border-transparent'
                  }
                  ${isCollapsed ? 'justify-center p-3 border-l-0' : ''}`}
              >
                <IconComponent className={`w-5 h-5 shrink-0 transition-smooth ${active ? getActiveIconClass() : 'group-hover:scale-110'}`} />
                {!isCollapsed && <span>{item.name}</span>}
                
                {/* Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-[#E5E7EB] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-smooth z-50 shadow-xl whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout Section */}
        <div className={`p-4 border-t border-[#E5E7EB] ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-smooth group relative
              ${isCollapsed ? 'justify-center p-3' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-smooth group-hover:translate-x-0.5" />
            {!isCollapsed && <span>Logout</span>}
            
            {/* Tooltip for Collapsed Mode */}
            {isCollapsed && (
              <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-[#E5E7EB] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-smooth z-50 shadow-xl whitespace-nowrap">
                Logout
              </span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
