import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Trophy, 
  AlertTriangle,
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const AnalyticsCards = ({ totalTests = 0, testsPassed = 0, failedTests = 0, loading = false }) => {
  
  // Calculations
  const successRate = totalTests > 0 ? ((testsPassed / totalTests) * 100).toFixed(1) : 0;
  const failureRate = totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(1) : 0;

  const cardData = [
    {
      id: 'tests-taken',
      title: 'Total Tests Taken',
      value: `${totalTests} Tests`,
      subtitle: 'Across all 8 subjects',
      trend: '+8% this month',
      trendUp: true,
      color: 'from-blue-500/10 to-indigo-500/5',
      textColor: 'text-blue-600',
      iconColor: 'bg-blue-500 text-white',
      shadowColor: 'shadow-blue-500/10',
      icon: ClipboardList
    },
    {
      id: 'tests-passed',
      title: 'Tests Passed',
      value: `${testsPassed} Passed`,
      subtitle: `${successRate}% Success Rate`,
      trend: 'Top 15% student',
      trendUp: true,
      color: 'from-emerald-500/10 to-teal-500/5',
      textColor: 'text-emerald-600',
      iconColor: 'bg-emerald-500 text-white',
      shadowColor: 'shadow-emerald-500/10',
      icon: Trophy
    },
    {
      id: 'tests-failed',
      title: 'Failed Tests',
      value: `${failedTests} Failed`,
      subtitle: `${failureRate}% Failure Rate`,
      trend: '-4% vs last week',
      trendUp: false,
      color: 'from-amber-500/10 to-rose-500/5',
      textColor: 'text-rose-600',
      iconColor: 'bg-rose-500 text-white',
      shadowColor: 'shadow-rose-500/10',
      icon: AlertTriangle
    }
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-saas h-36 skeleton-pulse flex flex-col justify-between" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {cardData.map((card) => {
        const IconComponent = card.icon;

        return (
          <motion.div
            key={card.id}
            variants={itemVariants}
            whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)' }}
            className={`relative overflow-hidden rounded-3xl bg-white p-6 border border-slate-200/80 shadow-saas hover:border-slate-300 transition-smooth flex items-center justify-between`}
          >
            {/* Soft background shape */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-gradient-to-bl ${card.color} opacity-40 pointer-events-none`} />

            {/* Content info */}
            <div className="space-y-3 z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-sans">
                {card.title}
              </span>
              
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none font-sans">
                  {card.value}
                </h3>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">
                  {card.subtitle}
                </span>
              </div>

              {/* Dynamic Trend Indicator */}
              <div className="flex items-center gap-1.5 pt-1">
                {card.trendUp ? (
                  <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {card.trend}
                  </div>
                ) : (
                  <div className="flex items-center text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {card.trend}
                  </div>
                )}
              </div>
            </div>

            {/* Circular Icon with shadows (Dasher aesthetic) */}
            <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl ${card.iconColor} ${card.shadowColor} shadow-lg shrink-0 z-10`}>
              <IconComponent className="w-6 h-6 text-white" />
              <ArrowUpRight className="absolute top-1 right-1 w-3.5 h-3.5 text-white/50 opacity-0 hover:opacity-100 transition-smooth cursor-pointer" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AnalyticsCards;
