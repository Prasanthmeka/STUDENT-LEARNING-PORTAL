import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import GoBackButton from '../components/layout/GoBackButton';
import { 
  User, 
  Palette, 
  Bell, 
  CreditCard, 
  Check, 
  Lock, 
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Settings States
  const [activeTab, setActiveTab] = useState('account');
  const [toast, setToast] = useState(null);

  // Profile forms
  const [fullName, setFullName] = useState(user?.full_name || 'Prasanth Meka');
  const [email, setEmail] = useState(user?.email || 'prasanthmeka2003@gmail.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Styling / Layout states
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('student_theme_accent') || 'indigo');

  // Notification States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [leaderboardUpdates, setLeaderboardUpdates] = useState(false);

  // Subscription Details cache load
  const [subscribedSubjects] = useState(() => {
    try {
      const subs = localStorage.getItem('subscribedSubjects');
      return subs ? JSON.parse(subs) : [];
    } catch {
      return [];
    }
  });
  const [activePlan] = useState(() => localStorage.getItem('activePlan') || 'Free Trial');

  const getThemeBtnColor = () => {
    switch (accentColor) {
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'cyan': return 'bg-cyan-500 hover:bg-cyan-600 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const getActiveTabClass = (tab) => {
    if (activeTab !== tab) {
      return 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40';
    }
    switch (accentColor) {
      case 'purple': return 'bg-purple-50/20 dark:bg-purple-950/40 border-purple-500 dark:border-purple-400 text-purple-650 dark:text-purple-400';
      case 'cyan': return 'bg-cyan-50/20 dark:bg-cyan-950/40 border-cyan-500 dark:border-cyan-400 text-cyan-650 dark:text-cyan-400';
      case 'emerald': return 'bg-emerald-50/20 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-400 text-emerald-650 dark:text-emerald-400';
      case 'rose': return 'bg-rose-50/20 dark:bg-rose-950/40 border-rose-500 dark:border-rose-400 text-rose-650 dark:text-rose-400';
      case 'indigo':
      default: return 'bg-indigo-50/20 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 text-indigo-650 dark:text-indigo-400';
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    showToast('Profile credentials updated successfully!');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert('Please fill out all fields.');
      return;
    }
    showToast('Password credentials changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
  };

  const handlePreferenceSave = () => {
    localStorage.setItem('student_theme_accent', accentColor);
    window.dispatchEvent(new Event('student-theme-changed'));
    showToast('Theme accent preferences applied globally!');
  };

  const handleNotificationsSave = () => {
    showToast('Notification schedules updated!');
  };

  const handleAccessibilitySave = () => {
    showToast('Accessibility layouts customized!');
  };

  const accents = [
    { name: 'indigo', color: 'bg-indigo-600 border-indigo-400' },
    { name: 'purple', color: 'bg-purple-600 border-purple-400' },
    { name: 'cyan', color: 'bg-cyan-500 border-cyan-400' },
    { name: 'emerald', color: 'bg-emerald-600 border-emerald-400' },
    { name: 'rose', color: 'bg-rose-500 border-rose-400' }
  ];

  return (
    <StudentLayout>
      <GoBackButton />
      
      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 px-5 py-4 rounded-2xl shadow-2xl transition-smooth">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-black tracking-wide">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader 
        title="Account Preferences"
        subtitle="Manage student details, dark/light theme accents, email schedules, accessibility, and security credentials."
        parentLabel="Dashboard"
        parentPath="/student/dashboard"
      />

      {/* Split tab settings screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Category Navigator (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas overflow-hidden p-3.5 space-y-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-smooth border-l-4 ${
              getActiveTabClass('account')
            }`}
          >
            <User className="w-4.5 h-4.5" />
            Profile & Security
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-smooth border-l-4 ${
              getActiveTabClass('theme')
            }`}
          >
            <Palette className="w-4.5 h-4.5" />
            Theme & Styling
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-smooth border-l-4 ${
              getActiveTabClass('notifications')
            }`}
          >
            <Bell className="w-4.5 h-4.5" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-3.5 w-full py-3.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-smooth border-l-4 ${
              getActiveTabClass('subscription')
            }`}
          >
            <CreditCard className="w-4.5 h-4.5" />
            Subscription Details
          </button>
        </div>

        {/* Right Side: Tab Contents (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-650" />
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: PROFILE & SECURITY */}
            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight font-sans">Profile & Security</h3>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Manage your student credentials and preferences</p>
                </div>


                {/* Name / Email form */}
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-smooth"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-smooth"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Class / Grade</label>
                      <input 
                        type="text" 
                        value={user?.class || 'N/A'}
                        disabled
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-bold focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className={`py-2.5 px-6 rounded-xl font-bold text-xs tracking-wide transition-smooth shadow-md ${getThemeBtnColor()}`}
                  >
                    Save Personal Details
                  </button>
                </form>

                {/* Change Password form */}
                <form onSubmit={handlePasswordSave} className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-sm font-sans flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      Modify Password
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">We recommend using a robust combination of numbers and signs</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-smooth font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-smooth font-sans"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 text-white font-bold text-xs tracking-wide transition-smooth"
                  >
                    Change Account Password
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 2: THEME & STYLING */}
            {activeTab === 'theme' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-base tracking-tight font-sans">Theme & Accent Styling</h3>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Customize your student dashboard skin parameters</p>
                </div>

                {/* Accent Color picker */}
                <div className="space-y-3 pb-4">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Workspace Accent Color</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-semibold">Select your primary highlighting color theme for buttons and cards.</p>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    {accents.map((acc) => (
                      <button
                        key={acc.name}
                        onClick={() => setAccentColor(acc.name)}
                        className={`w-9 h-9 rounded-2xl border-4 ${acc.color} flex items-center justify-center text-white shadow-md relative transition-smooth shrink-0 hover:scale-105 ${
                          accentColor === acc.name ? 'border-indigo-600 dark:border-indigo-400 scale-105' : 'border-transparent'
                        }`}
                      >
                        {accentColor === acc.name && <Check className="w-4 h-4 text-white font-black" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handlePreferenceSave}
                  className={`py-2.5 px-6 rounded-xl font-bold text-xs tracking-wide transition-smooth shadow-md shadow-indigo-650/10 ${getThemeBtnColor()}`}
                >
                  Apply System Styles
                </button>
              </motion.div>
            )}

            {/* TAB 3: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-base tracking-tight font-sans">Notification Settings</h3>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Control email delivery frequencies and exam alert popups</p>
                </div>

                {/* Email notifications Switch */}
                <div className="flex items-center justify-between py-4 border-y border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Email Grade Bulletins</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-semibold">Receive direct email reports once your quiz has been graded by the system.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailAlerts}
                      onChange={() => setEmailAlerts(!emailAlerts)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-655"></div>
                  </label>
                </div>

                {/* Quiz reminders Switch */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">New mock test announcements</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-semibold">Popup browser alert notification cards when teachers upload new quizzes.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={quizReminders}
                      onChange={() => setQuizReminders(!quizReminders)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-655"></div>
                  </label>
                </div>

                {/* Leaderboard updates Switch */}
                <div className="flex items-center justify-between py-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5 max-w-sm">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Rank movement updates</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-semibold">Notify weekly if you climb or drop on your peer leaderboard rank.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={leaderboardUpdates}
                      onChange={() => setLeaderboardUpdates(!leaderboardUpdates)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-655"></div>
                  </label>
                </div>

                <button 
                  onClick={handleNotificationsSave}
                  className={`py-2.5 px-6 rounded-xl font-bold text-xs tracking-wide transition-smooth shadow-md ${getThemeBtnColor()}`}
                >
                  Save Notification Toggles
                </button>
              </motion.div>
            )}

            {/* TAB 4: SUBSCRIPTION DETAILS */}
            {activeTab === 'subscription' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-base tracking-tight font-sans">Subscription Details</h3>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">View your current active learning plans and subject access</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Plan</span>
                      <span className="block text-lg font-black text-slate-800 dark:text-white mt-1">
                        {activePlan}
                      </span>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
                      {activePlan !== 'Free Trial' ? 'Premium' : 'Trial'}
                    </span>
                  </div>

                  <div className="h-px bg-slate-200/60 dark:bg-slate-800" />

                  <div className="space-y-4">
                    <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Subject Subscriptions</span>
                    
                    {subscribedSubjects.length > 0 ? (
                      <div className="space-y-3">
                        {subscribedSubjects.map(sub => (
                          <div key={sub} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800 shadow-sm">
                            <span className="text-xl shrink-0">
                              {sub === 'Telugu' ? '📙' : sub === 'Hindi' ? '📔' : sub === 'English' ? '📕' : sub === 'Social' ? '🌍' : sub === 'Physics' ? '⚛️' : sub === 'Chemistry' ? '🧪' : sub === 'Maths' ? '📐' : '🌿'}
                            </span>
                            <div>
                              <span className="block text-xs font-black text-slate-800 dark:text-white font-sans">
                                {sub === 'Social' ? 'Social Studies' : sub}
                              </span>
                              <span className="block text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mt-0.5">
                                ✓ You have taken {sub === 'Social' ? 'Social Studies' : sub} subscription
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800 rounded-3xl space-y-2">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">You do not have any active subject subscriptions.</p>
                        <button 
                          onClick={() => navigate('/student/subscription')}
                          className="text-xs font-black text-indigo-500 hover:text-indigo-650 transition-smooth"
                        >
                          Explore Premium Subscription Plans &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Settings;
