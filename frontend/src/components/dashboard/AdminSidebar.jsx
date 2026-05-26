import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Shield,
  Bell,
  SunMoon,
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
    navigate('/login');
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
    alert(`Portal settings: ${item.name} panel loaded.`);
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
    { name: 'User Settings', icon: User, key: 'user' },
    { name: 'Theme Settings', icon: SunMoon, key: 'theme' },
    { name: 'Notifications', icon: Bell, key: 'notifications' },
    { name: 'Admin Profile', icon: Shield, key: 'profile' }
  ];

  // Determine active route states
  const isDashboardActive = location.pathname === '/admin/dashboard';
  const isSubjectActive = (subName) => location.pathname === `/admin/subject/${subName.toLowerCase()}`;

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
            className="fixed inset-0 z-40 bg-[#020617]/85 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel Container */}
      <motion.aside
        animate={{ 
          width: isCollapsed ? '90px' : '280px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0b0f19]/95 text-slate-350 border-r border-indigo-950/20 shadow-2xl transition-all duration-300 backdrop-blur-xl
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'items-center' : 'items-stretch'}
          w-[280px] md:block`}
      >
        {/* Top Header Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-indigo-950/20 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 font-sans"
              >
                EduMasterPro
              </motion.span>
            )}
          </div>
          
          {/* Collapse Button for Desktop */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden p-1.5 rounded-lg border border-indigo-950/30 bg-[#0f172a]/80 hover:bg-[#1e293b] hover:text-white transition-all duration-200 md:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Premium Profile Card */}
        <div className={`p-4 border-b border-indigo-950/20 shrink-0 ${isCollapsed ? 'flex justify-center p-2 w-full' : ''}`}>
          <div className={`relative overflow-visible rounded-2xl bg-gradient-to-tr from-[#0f172a] via-[#020617] to-indigo-950/40 border border-indigo-950/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] group ${isCollapsed ? 'p-1.5 w-14 h-14 flex items-center justify-center mx-auto' : 'p-4 w-full'}`}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-gradient-to-bl from-indigo-500/10 to-purple-500/5 opacity-40 pointer-events-none" />
            
            <div className="flex items-center justify-center gap-3 w-full">
              <div className="relative shrink-0 w-11 h-11 rounded-xl bg-slate-900/60 border border-indigo-950/40 flex items-center justify-center overflow-visible shadow-inner group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={adminAvatar} 
                  alt="Admin Silhouette"
                  className="w-8 h-8 object-contain opacity-95"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#020617] bg-indigo-500 shadow-md shadow-indigo-500/40"></span>
              </div>
              
              {!isCollapsed && (
                <div className="overflow-hidden min-w-0 flex-1">
                  <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Admin Portal</span>
                  <h4 className="font-bold text-white truncate text-xs font-sans mt-1.5 group-hover:text-indigo-200 transition-colors duration-200">
                    {user?.full_name || 'Alex Mercer'}
                  </h4>
                  <span className="inline-block text-[9px] font-black bg-gradient-to-r from-indigo-600 to-purple-650 text-white rounded px-1.5 py-0.5 mt-1 tracking-wider uppercase leading-none">
                    Super Admin
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Main Dashboard Link */}
          <div className="space-y-1">
            <button
              onClick={handleDashboardClick}
              className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 relative group
                ${isDashboardActive
                  ? 'text-white bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border-l-4 border-indigo-500 shadow-[0_8px_16px_-2px_rgba(79,70,229,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/30 border-l-4 border-transparent'
                }
                ${isCollapsed ? 'justify-center p-3' : ''}`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isDashboardActive ? 'text-indigo-400' : 'group-hover:scale-115'}`} />
              {!isCollapsed && <span>Dashboard</span>}
              
              {/* Tooltip in collapsed state */}
              {isCollapsed && (
                <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
                  Dashboard
                </span>
              )}
            </button>
          </div>

          {/* Subjects List Links */}
          <div className="space-y-2">
            {!isCollapsed && (
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">
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
                    className={`flex items-center gap-3.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 relative group
                      ${active 
                        ? 'text-white bg-gradient-to-r from-indigo-500/15 to-purple-500/5 border-l-4 border-indigo-500 shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/30 border-l-4 border-transparent'
                      }
                      ${isCollapsed ? 'justify-center p-3' : ''}`}
                  >
                    <div className={`w-6.5 h-6.5 rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center font-black text-[10px] leading-none select-none
                      ${active ? 'bg-indigo-600/30 text-indigo-400' : 'bg-slate-900/50 text-slate-500'}`}>
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
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    )}

                    {/* Tooltip in collapsed state */}
                    {isCollapsed && (
                      <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
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
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-4">
                Portal Management
              </span>
            )}
            <div className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    onClick={() => handleSettingsClick(item)}
                    className={`flex items-center gap-3.5 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 relative group text-slate-400 hover:text-white hover:bg-slate-900/30 border-l-4 border-transparent
                      ${isCollapsed ? 'justify-center p-3' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-350 transition-transform duration-300 group-hover:translate-x-0.5" />
                    {!isCollapsed && <span>{item.name}</span>}

                    {/* Tooltip in collapsed state */}
                    {isCollapsed && (
                      <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold border text-slate-250 bg-slate-900 border-slate-800 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
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
        <div className={`p-4 border-t border-indigo-950/20 shrink-0 ${isCollapsed ? 'flex justify-center p-2.5' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-red-650 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300 relative group
              ${isCollapsed ? 'justify-center p-2.5' : ''}`}
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 font-bold" />
            {!isCollapsed && <span>Sign Out</span>}
            
            {/* Tooltip in collapsed state */}
            {isCollapsed && (
              <span className="absolute left-20 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-200 bg-slate-900 border border-slate-800 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 pointer-events-none transition-all duration-200 z-50 shadow-xl whitespace-nowrap">
                Sign Out
              </span>
            )}
          </button>
        </div>

      </motion.aside>
    </>
  );
};

export default AdminSidebar;
