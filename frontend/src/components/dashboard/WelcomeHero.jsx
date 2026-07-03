import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Award, Flame, Star, BookOpen, GraduationCap } from 'lucide-react';

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

  // Calculate dynamic weekly learning goal (e.g. goal of 5 quizzes per week)
  const weeklyGoal = 5;
  const weeklyProgressPercent = Math.min(Math.round((totalTests / weeklyGoal) * 100), 100);

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

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Side: Dynamic Greetings & Motivational Quote */}
        <div className="md:col-span-7 space-y-4">
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

        {/* Right Side: Weekly learning progress circle and Mascot/Illustration */}
        <div className="md:col-span-5 flex flex-col md:flex-row items-center justify-end gap-6">
          {/* Progress Ring Card */}
          <div className="w-full sm:w-auto bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            {/* SVG Circular Progress Bar */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  className="stroke-white/20" 
                  strokeWidth="6" 
                  fill="transparent" 
                />
                <motion.circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  className="stroke-white" 
                  strokeWidth="6" 
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - weeklyProgressPercent / 100) }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-white">
                {weeklyProgressPercent}%
              </div>
            </div>

            <div>
              <span className="block font-bold text-sm">Weekly Goal Progress</span>
              <p className="text-[11px] font-medium text-slate-200 mt-0.5 leading-relaxed max-w-[150px]">
                You have completed {totalTests} of your {weeklyGoal} target quizzes this week!
              </p>
            </div>
          </div>

          {/* Educational Illustration vector logo */}
          <div className="hidden lg:block shrink-0 animate-float">
            <div className="relative w-24 h-24 flex items-center justify-center rounded-3xl bg-indigo-500/30 border border-white/20 shadow-lg">
              <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              <BookOpen className="w-12 h-12 text-indigo-100" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeHero;
