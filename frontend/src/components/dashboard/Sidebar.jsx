import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  BarChart3, 
  Trophy, 
  FileText, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Silhouette Vector Placeholder Avatar
  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2364748b"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/></svg>`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/student/videos', icon: BookOpen }, 
    { name: 'Tests', path: '/student/quizzes', icon: ClipboardList }, 
    { name: 'Analytics', path: '#analytics-section', icon: BarChart3, isAnchor: true },
    { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { name: 'Study Materials', path: '/student/materials', icon: FileText },
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col glass-panel-dark text-slate-300 shadow-2xl transition-smooth
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'items-center' : 'items-stretch'}
          w-[260px] md:block`}
      >
        {/* Top Header Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 font-sans"
              >
                EduMasterPro
              </motion.span>
            )}
          </div>
          
          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden p-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white transition-smooth md:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Profile Card with Neutral Silhouette */}
        <div className={`p-6 border-b border-slate-800 flex items-center gap-4 overflow-hidden ${isCollapsed ? 'justify-center p-4' : ''}`}>
          <div className="relative shrink-0 w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
            <img 
              src={defaultAvatar} 
              alt="Profile Silhouette"
              className="w-8 h-8 object-contain opacity-75"
            />
            {/* Online Status Indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 bg-emerald-500 shadow-md shadow-emerald-500/40"></span>
          </div>
          
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <h4 className="font-semibold text-white truncate text-sm tracking-wide font-sans">{user?.full_name || "Prasanth Meka"}</h4>
              <p className="text-xs text-slate-500 font-medium tracking-wider uppercase mt-0.5">Student Status</p>
            </motion.div>
          )}
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
                    ? 'text-white bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border-l-4 border-indigo-500 shadow-sidebar-active' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border-l-4 border-transparent'
                  }
                  ${isCollapsed ? 'justify-center p-3' : ''}`}
              >
                <IconComponent className={`w-5 h-5 shrink-0 transition-smooth ${active ? 'text-indigo-400' : 'group-hover:scale-110'}`} />
                {!isCollapsed && <span>{item.name}</span>}
                
                {/* Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-smooth z-50 shadow-xl whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout Section */}
        <div className={`p-4 border-t border-slate-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-smooth group relative
              ${isCollapsed ? 'justify-center p-3' : ''}`}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-smooth group-hover:translate-x-0.5" />
            {!isCollapsed && <span>Logout</span>}
            
            {/* Tooltip for Collapsed Mode */}
            {isCollapsed && (
              <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-200 bg-slate-900 border border-slate-800 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-smooth z-50 shadow-xl whitespace-nowrap">
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
