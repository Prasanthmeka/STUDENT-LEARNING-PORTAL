import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  BookOpen, 
  X, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Subscription = () => {
  const navigate = useNavigate();

  // Subscription states
  const [currentPlan, setCurrentPlan] = useState(() => localStorage.getItem('activePlan') || 'Free Trial');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Strict 8 subjects list
  const subjectsList = ['Telugu', 'Hindi', 'English', 'Social', 'Physics', 'Chemistry', 'Maths', 'Biology'];

  const subjectIcons = {
    'Telugu': '📙',
    'Hindi': '📔',
    'English': '📕',
    'Social': '🌍',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'Maths': '📐',
    'Biology': '🌿'
  };

  const handleUpgradeClick = (planName) => {
    setSelectedPlanName(planName);
    setSelectedSubjects([]);
    setShowSubjectModal(true);
  };

  const toggleSubject = (sub) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(item => item !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleConfirmPurchase = () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject to proceed.');
      return;
    }
    setShowSubjectModal(false);
    setShowSuccessModal(true);

    // Save active plan to localStorage
    localStorage.setItem('activePlan', selectedPlanName);
    localStorage.setItem('subscribedSubjects', JSON.stringify(selectedSubjects));
    setCurrentPlan(selectedPlanName);
  };

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + (selectedPlanName === 'Yearly Premium' ? 12 : 1));

  return (
    <StudentLayout>
      {/* Page Header */}
      <PageHeader 
        title="Subscription Plans"
        subtitle="Manage your learning subscription, unlock comprehensive curriculum notebooks, and gain full mock exams coverage."
        parentLabel="Dashboard"
        parentPath="/student/dashboard"
      />

      <div className="space-y-8">
        {/* Active plan banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Plan Info</span>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight font-sans">
              Current Plan: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{currentPlan}</span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold max-w-xl leading-normal">
              {currentPlan !== 'Free Trial' 
                ? `Full access activated. Your subscription is valid until ${expiryDate.toLocaleDateString()} for the selected subjects.` 
                : "You are currently on the Free Trial. Upgrade to premium plan to unlock unlimited exams, text summary tools, and subject guidelines."
              }
            </p>
          </div>
          
          <div className="px-5 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 text-center shrink-0">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Expiry Date</span>
            <span className="block text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {currentPlan !== 'Free Trial' ? expiryDate.toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid (Dasher style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* MONTHLY PLAN CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-saas hover:shadow-xl transition-smooth p-6 md:p-8 flex flex-col justify-between h-[500px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
            
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Basic Monthly</span>
                <h4 className="font-black text-slate-850 dark:text-slate-100 text-2xl tracking-tight leading-none font-sans">
                  Monthly Membership
                </h4>
                <div className="pt-4 flex items-baseline">
                  <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">&#8377;299</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">/ month</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 dark:bg-slate-800" />

              {/* Features list */}
              <ul className="space-y-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-normal font-sans">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  Complete access to mock quizzes
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  Standard study resources & notebooks
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  Accuracy performance tracking stats
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgradeClick('Monthly Premium')}
              className={`w-full py-4 rounded-2xl font-bold text-xs tracking-wide transition-smooth ${
                currentPlan === 'Monthly Premium'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white'
              }`}
            >
              {currentPlan === 'Monthly Premium' ? 'Current Active Membership' : 'Upgrade Monthly Plan'}
            </button>
          </div>

          {/* YEARLY PLAN CARD (Best Value Gradient Glow) */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl border border-slate-800 shadow-premium p-6 md:p-8 flex flex-col justify-between h-[500px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-bl from-indigo-500/20 to-purple-500/10 opacity-60 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-500" />
            
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-1.5 z-10 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Recommended Plan</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-500 text-slate-900 py-0.5 px-2 rounded-md shadow-sm">Save 30%</span>
                </div>
                <h4 className="font-black text-white text-2xl tracking-tight leading-none font-sans">
                  Yearly Membership
                </h4>
                <div className="pt-4 flex items-baseline">
                  <span className="text-4xl font-black text-yellow-400 tracking-tight leading-none">&#8377;2499</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">/ year</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-800" />

              {/* Features list */}
              <ul className="space-y-3.5 text-xs font-semibold text-slate-300 leading-normal font-sans">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 text-slate-900 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 font-bold" /></div>
                  Unrestricted access to all courses
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 text-slate-900 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 font-bold" /></div>
                  Premium reference guides & materials
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 text-slate-900 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 font-bold" /></div>
                  Unlimited exam quizzes attempts
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 text-slate-900 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 font-bold" /></div>
                  Advanced performance analytics metrics
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 text-slate-900 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 font-bold" /></div>
                  Priority 24/7 student support lines
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgradeClick('Yearly Premium')}
              className={`w-full py-4 rounded-2xl font-bold text-xs tracking-wide transition-smooth ${
                currentPlan === 'Yearly Premium'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-md shadow-yellow-500/10'
              }`}
            >
              {currentPlan === 'Yearly Premium' ? 'Current Active Membership' : 'Upgrade Yearly Plan'}
            </button>
          </div>

        </div>
      </div>

      {/* ----------------------------------------------------
      // MODAL COMPONENT: DYNAMIC MULTI-SELECT SUBJECTS
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 md:p-8 flex flex-col relative overflow-hidden max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight font-sans">Customize Subject Curriculum</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Choose active subjects for: {selectedPlanName}</p>
                </div>
                <button 
                  onClick={() => setShowSubjectModal(false)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of Multi-Select Cards */}
              <div className="flex-1 overflow-y-auto py-6 pr-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {subjectsList.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => toggleSubject(sub)}
                      className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 transition-smooth ${
                        isSelected 
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-3xl select-none">{subjectIcons[sub]}</span>
                      <span className="text-xs font-black tracking-wide font-sans">{sub === 'Social' ? 'Social Studies' : sub}</span>
                      
                      {/* Check dot selector */}
                      <span className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] font-black ${
                        isSelected 
                          ? 'bg-indigo-500 border-indigo-400 text-white' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                      }`}>
                        {isSelected && '✓'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-slate-400 leading-normal text-center sm:text-left">
                  Selected: <strong className="text-slate-700 dark:text-slate-300 font-black">{selectedSubjects.length} of 8 subjects</strong>
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowSubjectModal(false)}
                    className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 font-bold text-xs transition-smooth hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-600/10 transition-smooth"
                  >
                    Confirm & Complete Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------------------------------------------
      // MODAL COMPONENT: SIMULATED PAYMENT SUCCESS POPUP
      // ---------------------------------------------------- */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 text-center space-y-5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 animate-pulse" />
              
              {/* Checkmark icon */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-8 h-8 stroke-[1.5]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-black text-slate-850 dark:text-slate-100 text-lg tracking-tight font-sans">Payment Completed!</h3>
                <p className="text-xs text-slate-400 font-semibold leading-normal">
                  Your premium subscription upgrade was successfully processed. Welcome to the EduMasterPro premium workspace!
                </p>
              </div>

              {/* Selected subjects list print */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-wide space-y-2.5 max-h-32 overflow-y-auto">
                <span className="block border-b border-slate-150 dark:border-slate-800 pb-1.5 text-center">Subscribed Subjects:</span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {selectedSubjects.map(sub => (
                    <span key={sub} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                      {sub === 'Social' ? 'Social Studies' : sub}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/student/dashboard');
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-smooth"
              >
                Go to Student Workspace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
};

export default Subscription;
