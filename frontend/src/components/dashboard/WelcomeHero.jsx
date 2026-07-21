import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Award, Flame, GraduationCap } from 'lucide-react';

const motivationalQuotes = [
  "“The beautiful thing about learning is that no one can take it away from you.” — B.B. King",
  "“Education is the passport to the future, for tomorrow belongs to those who prepare for it today.” — Malcolm X",
  "“An investment in knowledge pays the best interest.” — Benjamin Franklin",
  "“You don't have to be great to start, but you have to start to be great.” — Zig Ziglar",
  "“Success is the sum of small efforts, repeated day in and day out.” — Robert Collier"
];

const WelcomeHero = ({ streak = 0, totalTests = 0, passPercentage = 0 }) => {
  const { user } = useAuth();
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    // Pick a quote based on current date to keep it consistent throughout the day
    const index = new Date().getDate() % motivationalQuotes.length;
    setMotivationalMessage(motivationalQuotes[index]);
  }, []);

  // Display first name or full name
  const studentName = user?.full_name || "Prasanth";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 md:p-8 text-white shadow-premium shadow-indigo-600/25"
    >
      {/* Decorative Vector Shapes in Background */}
      <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none hidden md:block">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
          <circle cx="80" cy="50" r="30" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M40 20 L80 80 M80 20 L40 80" stroke="white" strokeWidth="0.25" />
          <rect x="60" y="30" width="10" height="10" stroke="white" strokeWidth="0.5" transform="rotate(45 65 35)" />
        </svg>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/10 uppercase">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-200" />
          Student Workspace {user?.class ? `• ${user.class}` : ''}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans text-white leading-tight">
          Hello {studentName} 👋 <br />
          <span className="text-indigo-200 font-medium text-2xl md:text-3xl">How can I help you today?</span>
        </h1>

        <p className="text-sm font-medium text-slate-200/90 leading-relaxed font-sans max-w-xl italic">
          {motivationalMessage}
        </p>

        {/* Quick Metrics Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {/* Streak Counter */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/5 shadow-inner">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
            <div>
              <span className="block text-sm font-black tracking-wide leading-none">{streak} Days</span>
              <span className="text-[10px] font-bold text-slate-300/80 tracking-wider uppercase mt-0.5 block">Learning Streak</span>
            </div>
          </div>

          {/* Total Completed */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/5 shadow-inner">
            <Award className="w-5 h-5 text-yellow-300" />
            <div>
              <span className="block text-sm font-black tracking-wide leading-none">{passPercentage}% Avg</span>
              <span className="text-[10px] font-bold text-slate-300/80 tracking-wider uppercase mt-0.5 block">Accuracy Rate</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHero;
