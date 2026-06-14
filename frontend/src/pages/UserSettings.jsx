import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { settingsAPI } from '../services/api';
import { 
  Palette, 
  Bell, 
  CheckCircle, 
  Save, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserSettings = () => {
  const navigate = useNavigate();

  // Settings States
  const [themeAccent, setThemeAccent] = useState(() => localStorage.getItem('admin_theme_accent') || 'purple');
  const [notifRegistrations, setNotifRegistrations] = useState(true);
  const [notifSubmissions, setNotifSubmissions] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifUploads, setNotifUploads] = useState(true);

  // Status States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch settings from backend on load
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await settingsAPI.getSettings();
        if (response.data) {
          setThemeAccent(response.data.theme_accent || 'purple');
          setNotifRegistrations(
            response.data.notif_registrations !== undefined 
              ? response.data.notif_registrations 
              : true
          );
          setNotifSubmissions(
            response.data.notif_submissions !== undefined 
              ? response.data.notif_submissions 
              : true
          );
          setNotifAlerts(
            response.data.notif_alerts !== undefined 
              ? response.data.notif_alerts 
              : true
          );
          setNotifUploads(
            response.data.notif_uploads !== undefined 
              ? response.data.notif_uploads 
              : true
          );
          localStorage.setItem('admin_theme_accent', response.data.theme_accent || 'purple');
          window.dispatchEvent(new Event('admin-theme-changed'));
        }
      } catch (err) {
        console.error('Failed to load settings from API:', err);
        setErrorMessage('Failed to connect to the backend settings server. Pre-loading default configurations.');
        setThemeAccent(localStorage.getItem('admin_theme_accent') || 'purple');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const triggerToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const response = await settingsAPI.updateSettings({
        theme_accent: themeAccent,
        notif_registrations: notifRegistrations,
        notif_submissions: notifSubmissions,
        notif_alerts: notifAlerts,
        notif_uploads: notifUploads
      });
      
      // Update local storage and dispatch global react event
      localStorage.setItem('admin_theme_accent', themeAccent);
      window.dispatchEvent(new Event('admin-theme-changed'));

      if (response.data) {
        triggerToast('Admin configurations saved successfully!');
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      // Fallback update local storage so preview works anyway
      localStorage.setItem('admin_theme_accent', themeAccent);
      window.dispatchEvent(new Event('admin-theme-changed'));
      triggerToast('Preferences applied locally!');
    } finally {
      setSaving(false);
    }
  };

  const themeOptions = [
    { name: 'purple', label: 'Purple Theme', color: 'bg-purple-600 border-purple-400' },
    { name: 'pink', label: 'Pink Theme', color: 'bg-pink-500 border-pink-400' },
    { name: 'green', label: 'Green Theme', color: 'bg-emerald-600 border-emerald-400' },
    { name: 'orange', label: 'Orange Theme', color: 'bg-orange-500 border-orange-400' }
  ];

  return (
    <AdminLayout
      selectedSubject={null}
      searchQuery=""
      setSearchQuery={() => {}}
    >
      <div className="flex flex-col gap-6 pb-12 font-sans relative">
        
        {/* Toast popup */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/80 backdrop-blur-md border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300"
            >
              <CheckCircle className="w-5 h-5 shrink-0 animate-bounce" />
              <span className="text-xs font-black tracking-wide">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Back & Header Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-indigo-650 dark:hover:text-indigo-400 font-bold text-xs transition-colors duration-150 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Welcome Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-indigo-500 text-white py-0.5 px-2 rounded-md shadow-sm tracking-wider">
              Management Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-855 dark:text-white leading-none mt-1">
            System Preferences
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage admin global dashboard theme accents, and trigger system-wide email notifications parameters.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-saas">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Main Settings Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-indigo-950/20 shadow-saas overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-650" />
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Settings...</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              
              {/* Category 1: Theme Selection */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-6 border-b border-slate-100 dark:border-indigo-950/20">
                <div className="md:col-span-4 space-y-1">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm font-sans flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400 shrink-0" />
                    Theme Accent Selection
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-normal">
                    Select a visual accent color skin for buttons, active elements, and highlights globally.
                  </p>
                </div>
                
                <div className="md:col-span-8 space-y-2">
                  <div className="flex gap-4 pt-2">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setThemeAccent(opt.name)}
                        className={`w-10 h-10 rounded-2xl border-4 ${opt.color} flex items-center justify-center text-white shadow-md relative transition-all duration-200 hover:scale-105 ${
                          themeAccent === opt.name ? 'border-slate-800 dark:border-slate-200 scale-105 shadow-lg' : 'border-transparent'
                        }`}
                        title={opt.label}
                      >
                        {themeAccent === opt.name && <CheckCircle className="w-5 h-5 text-white font-black" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category 2: Email Notifications */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-4 space-y-1">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm font-sans flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-400 shrink-0" />
                    Email Notification Toggles
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-normal">
                    Choose which system-wide operations trigger automatic email updates to portals and subscribers.
                  </p>
                </div>
                
                <div className="md:col-span-8 space-y-5 pt-1">
                  {/* Toggle 1: registrations */}
                  <div className="flex items-center justify-between max-w-sm py-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Student registrations alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={notifRegistrations}
                        onChange={() => setNotifRegistrations(!notifRegistrations)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Toggle 2: submissions */}
                  <div className="flex items-center justify-between max-w-sm py-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quiz submissions bulletins</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={notifSubmissions}
                        onChange={() => setNotifSubmissions(!notifSubmissions)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Toggle 3: alerts */}
                  <div className="flex items-center justify-between max-w-sm py-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Subscription status alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={notifAlerts}
                        onChange={() => setNotifAlerts(!notifAlerts)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Toggle 4: uploads */}
                  <div className="flex items-center justify-between max-w-sm py-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload system notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={notifUploads}
                        onChange={() => setNotifUploads(!notifUploads)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Button Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-indigo-950/20 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-indigo-600/20 transition-all duration-150 shrink-0"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </AdminLayout>
  );
};

export default UserSettings;
