import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LearnoQubeLogo from '../LearnoQubeLogo';
import { 
  LayoutDashboard, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Languages,
  BookOpen,
  Compass,
  Atom,
  FlaskConical,
  Dna,
  Binary
} from 'lucide-react';

const AdminSidebar = ({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Silhouette Vector Placeholder for Admin
  const adminAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a5b4fc"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/><circle cx="18" cy="6" r="1.5" fill="%236366f1"/></svg>`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardClick = () => {
    setIsMobileOpen(false);
    navigate('/admin/dashboard');
  };

  const handleSubjectClick = (subjectName) => {
    setIsMobileOpen(false);
    navigate(`/admin/subject/${subjectName.toLowerCase()}`);
  };

  const handleSettingsClick = (item) => {
    setIsMobileOpen(false);
    if (item.key === 'user') {
      navigate('/admin/settings');
    } else {
      alert(`Portal settings: ${item.name} panel loaded.`);
    }
  };

  // 8 Strict Subjects mapped to beautiful matching icons and gradients
  const subjects = [
    { name: 'TELUGU', icon: Languages, letter: 'తె', color: 'from-orange-500 to-amber-500' },
    { name: 'HINDI', icon: Languages, letter: 'हि', color: 'from-yellow-500 to-amber-500' },
    { name: 'ENGLISH', icon: BookOpen, color: 'from-indigo-500 to-blue-500' },
    { name: 'SOCIAL', icon: Compass, color: 'from-teal-500 to-emerald-500' },
    { name: 'PHYSICS', icon: Atom, color: 'from-purple-500 to-indigo-500' },
    { name: 'CHEMISTRY', icon: FlaskConical, color: 'from-pink-500 to-rose-500' },
    { name: 'BIOLOGY', icon: Dna, color: 'from-emerald-500 to-cyan-500' },
    { name: 'MATHS', icon: Binary, color: 'from-blue-500 to-cyan-500' },
  ];

  // Settings Links (Logout removed to be sticky bottom)
  const settingsItems = [
    { name: 'User Settings', icon: User, key: 'user' }
  ];

  // Determine active route states
  const isDashboardActive = location.pathname === '/admin/dashboard';
  const isSubjectActive = (subName) => location.pathname === `/admin/subject/${subName.toLowerCase()}`;
  const isSettingsActive = (key) => key === 'user' && location.pathname === '/admin/settings';

  // Reactive Theme Accent state
  const [themeAccent, setThemeAccent] = React.useState(() => localStorage.getItem('admin_theme_accent') || 'purple');
  React.useEffect(() => {
    const handleThemeChange = () => {
      setThemeAccent(localStorage.getItem('admin_theme_accent') || 'purple');
    };
    window.addEventListener('admin-theme-changed', handleThemeChange);
    return () => window.removeEventListener('admin-theme-changed', handleThemeChange);
  }, []);

  const getThemeColors = () => {
    switch (themeAccent) {
      case 'pink':
        return {
          activeText: 'text-pink-600',
          activeBg: 'bg-gradient-to-r from-pink-50 to-pink-100/50 border-pink-500 shadow-[0_4px_12px_rgba(236,72,153,0.08)]',
          hoverBg: 'hover:bg-gradient-to-r hover:from-[#EEF2FF] hover:to-[#E0E7FF] hover:text-pink-600',
          pin: 'bg-pink-500',
          logoGlow: 'from-pink-500 to-rose-500',
          badgeText: 'bg-pink-100 text-pink-700 border border-pink-200'
        };
      case 'green':
        return {
          activeText: 'text-emerald-600',
          activeBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.08)]',
          hoverBg: 'hover:bg-gradient-to-r hover:from-[#EEF2FF] hover:to-[#E0E7FF] hover:text-emerald-600',
          pin: 'bg-emerald-500',
          logoGlow: 'from-emerald-500 to-green-500',
          badgeText: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        };
      case 'orange':
        return {
          activeText: 'text-orange-655',
          activeBg: 'bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-500 shadow-[0_4px_12px_rgba(249,115,22,0.08)]',
          hoverBg: 'hover:bg-gradient-to-r hover:from-[#EEF2FF] hover:to-[#E0E7FF] hover:text-orange-655',
          pin: 'bg-orange-500',
          logoGlow: 'from-orange-500 to-amber-500',
          badgeText: 'bg-orange-100 text-orange-700 border border-orange-200'
        };
      case 'purple':
      default:
        return {
          activeText: 'text-[#6366F1]',
          activeBg: 'bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF] border-[#6366F1] shadow-[0_4px_12px_rgba(99,102,241,0.08)]',
          hoverBg: 'hover:bg-gradient-to-r hover:from-[#EEF2FF] hover:to-[#E0E7FF] hover:text-[#6366F1]',
          pin: 'bg-[#6366F1]',
          logoGlow: 'from-indigo-500 to-purple-500',
          badgeText: 'bg-indigo-100 text-indigo-700 border border-indigo-200'
        };
    }
  };

  const themeColors = getThemeColors();

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
            className="fixed inset-0 z-40 bg-[#020617]/40 md:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel Container */}
      <motion.aside
        animate={{ 
          width: isCollapsed ? '80px' : '280px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#F8FAFF] text-[#1E293B] border-r border-[#E5E7EB] shadow-md transition-all duration-300 backdrop-blur-md
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'items-center' : 'items-stretch'}
          w-[280px] md:block`}
      >
        {/* Top Header Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#E5E7EB] shrink-0 w-full relative">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'mx-auto justify-center' : ''}`}>
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
          
          {/* Collapse Button for Desktop - absolutely positioned on right border */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden absolute right-[-12px] top-7 z-[60] w-6 h-6 rounded-full border border-[#E5E7EB] bg-white text-[#1E293B] hover:bg-[#F3F4F6] transition-all duration-200 shadow-md md:flex items-center justify-center"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Premium Profile Card */}
        <div className={`p-4 border-b border-[#E5E7EB] shrink-0 ${isCollapsed ? 'flex justify-center p-2.5 w-full' : ''}`}>
          <div className={`relative overflow-visible rounded-2xl bg-white border border-[#E5E7EB] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(99,102,241,0.06)] group ${isCollapsed ? 'p-1.5 w-12 h-12 flex items-center justify-center mx-auto' : 'p-4 w-full'}`}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-gradient-to-bl from-indigo-500/5 to-purple-500/5 opacity-40 pointer-events-none" />
            
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="relative shrink-0 w-10 h-10 rounded-xl bg-indigo-50/50 border border-[#E5E7EB] flex items-center justify-center overflow-visible shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={adminAvatar} 
                  alt="Admin Silhouette"
                  className="w-7 h-7 object-contain opacity-95"
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${themeColors.pin} shadow-md`}></span>
              </div>
              
              {!isCollapsed && (
                <div className="overflow-hidden min-w-0 flex-1">
                  <span className={`block text-[9px] font-black uppercase tracking-widest leading-none ${themeColors.activeText}`}>Admin Portal</span>
                  <h4 className="font-bold text-[#1E293B] truncate text-xs font-sans mt-1.5 group-hover:text-indigo-650 transition-colors duration-200">
                    {user?.full_name || 'Alex Mercer'}
                  </h4>
                  <span className={`inline-block text-[8px] font-black rounded px-1.5 py-0.5 mt-1 tracking-wider uppercase leading-none ${themeColors.badgeText}`}>
                    Super Admin
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-6 w-full sidebar-scroll-container">
          
          {/* Main Dashboard Link */}
          <div className="space-y-1">
            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 relative group border-l-4
                ${isDashboardActive
                  ? `${themeColors.activeText} ${themeColors.activeBg}` 
                  : 'text-[#64748B] hover:text-[#1E293B] border-transparent ' + themeColors.hoverBg
                }
                ${isCollapsed ? 'justify-center p-3 border-l-0' : ''}`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isDashboardActive ? themeColors.activeText : 'group-hover:scale-110'}`} />
              {!isCollapsed && <span>Dashboard</span>}
              
              {/* Tooltip in collapsed state */}
              {isCollapsed && (
                <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-[#E5E7EB] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
                  Dashboard
                </span>
              )}
            </button>
          </div>

          {/* Subjects List Links */}
          <div className="space-y-2">
            {!isCollapsed && (
              <span className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest pl-4">
                Subjects List
              </span>
            )}
            <div className="space-y-1">
              {subjects.map((sub) => {
                const Icon = sub.icon;
                const active = isSubjectActive(sub.name);

                return (
                  <button
                    key={sub.name}
                    onClick={() => handleSubjectClick(sub.name)}
                    className={`flex items-center gap-3.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 relative group border-l-4
                      ${active 
                        ? `${themeColors.activeText} ${themeColors.activeBg}` 
                        : 'text-[#64748B] hover:text-[#1E293B] border-transparent ' + themeColors.hoverBg
                      }
                      ${isCollapsed ? 'justify-center p-3 border-l-0' : ''}`}
                  >
                    <div className={`w-6.5 h-6.5 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center font-black text-[10px] leading-none select-none
                      ${active ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                      {sub.letter ? (
                        <span className="font-sans leading-none tracking-normal mt-0.5">{sub.letter}</span>
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="tracking-wide">{sub.name}</span>
                    )}
                    
                    {/* Active Indicator Pin */}
                    {!isCollapsed && active && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full ${themeColors.pin} animate-pulse`}></span>
                    )}

                    {/* Tooltip in collapsed state */}
                    {isCollapsed && (
                      <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-[#E5E7EB] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
                        {sub.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Section Links */}
          <div className="space-y-2">
            {!isCollapsed && (
              <span className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest pl-4">
                Portal Management
              </span>
            )}
            <div className="space-y-1">
              {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const active = isSettingsActive(item.key);

                return (
                  <button
                    key={item.key}
                    onClick={() => handleSettingsClick(item)}
                    className={`flex items-center gap-3.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 relative group border-l-4
                      ${active 
                        ? `${themeColors.activeText} ${themeColors.activeBg}` 
                        : 'text-[#64748B] hover:text-[#1E293B] border-transparent ' + themeColors.hoverBg
                      }
                      ${isCollapsed ? 'justify-center p-3 border-l-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 ${active ? themeColors.activeText : 'text-[#64748B] group-hover:text-[#1E293B]'}`} />
                    {!isCollapsed && <span>{item.name}</span>}

                    {/* Tooltip in collapsed state */}
                    {isCollapsed && (
                      <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold border text-slate-700 bg-white border-[#E5E7EB] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: RED GRADIENT STICKY LOGOUT BUTTON */}
        <div className={`p-4 border-t border-[#E5E7EB] shrink-0 w-full ${isCollapsed ? 'flex justify-center p-2.5' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-500 via-red-550 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-md hover:shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition-all duration-300 relative group
              ${isCollapsed ? 'justify-center p-2.5' : ''}`}
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 font-bold" />
            {!isCollapsed && <span>Logout</span>}
            
            {/* Tooltip in collapsed state */}
            {isCollapsed && (
              <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-500 bg-white border border-[#E5E7EB] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
                Logout
              </span>
            )}
          </button>
        </div>

        <style>{`
          .sidebar-scroll-container::-webkit-scrollbar {
            width: 5px;
          }
          .sidebar-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll-container::-webkit-scrollbar-thumb {
            background: rgba(99, 102, 241, 0.35);
            border-radius: 9999px;
          }
          .sidebar-scroll-container::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.6);
          }
        `}</style>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
