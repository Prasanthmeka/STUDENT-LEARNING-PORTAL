import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';
import StudentLayout from '../layouts/StudentLayout';
import PageHeader from '../components/layout/PageHeader';
import GoBackButton from '../components/layout/GoBackButton';
import { 
  Trophy, 
  HelpCircle, 
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Silhouette Vector Placeholder Avatar
  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2364748b"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4h16s-1.9-4-8-4z"/></svg>`;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <StudentLayout>
      <GoBackButton />

      {/* Page Header */}
      <PageHeader 
        title="Leaderboard & Rankings"
        subtitle="Track average accuracy scores, compare mock assessment results with peers, and view achievement levels."
        parentLabel="Dashboard"
        parentPath="/student/dashboard"
      />

      {loading ? (
        <div className="h-[400px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-saas skeleton-pulse" />
      ) : leaderboard.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-saas max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <HelpCircle className="w-8 h-8 stroke-1.5" />
          </div>
          <h4 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight">No Rankings Yet</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Take a quiz from the "Tests" tab to submit your score and rank on the leaderboards!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top 3 Podium Section (Dasher styled) */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
              
              {/* 2ND PLACE PODIUM */}
              {topThree[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas hover:border-slate-300 dark:hover:border-slate-700 text-center flex flex-col items-center justify-between h-[280px] relative order-2 md:order-1"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-350" />
                  
                  {/* Avatar wrapper */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner ring-4 ring-slate-250 dark:ring-slate-800">
                      <img 
                        src={defaultAvatar} 
                        alt={topThree[1].full_name} 
                        className="w-10 h-10 object-contain opacity-75"
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-2 flex items-center justify-center w-6 h-6 rounded-lg bg-slate-300 text-white font-bold text-xs shadow">
                      2
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-sm font-sans line-clamp-1 mt-3">
                      {topThree[1].full_name}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block truncate max-w-[150px]">{topThree[1].email}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                      {Number(topThree[1].averagePercentage).toFixed(1)}%
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 mt-2">
                    {topThree[1].quizzesCompleted} tests taken
                  </div>
                </motion.div>
              )}

              {/* 1ST PLACE PODIUM */}
              {topThree[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl text-center flex flex-col items-center justify-between h-[320px] relative order-1 md:order-2"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
                  
                  {/* Avatar wrapper */}
                  <div className="relative">
                    <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner ring-4 ring-yellow-400/50 shadow-lg shadow-yellow-500/10">
                      <img 
                        src={defaultAvatar} 
                        alt={topThree[0].full_name} 
                        className="w-12 h-12 object-contain opacity-75"
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-2 flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-500 text-slate-900 font-black text-xs shadow-md">
                      1
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-base font-sans line-clamp-1 mt-3">
                      {topThree[0].full_name}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 block truncate max-w-[180px]">{topThree[0].email}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-3xl font-black text-yellow-400 tracking-tighter leading-none">
                      {Number(topThree[0].averagePercentage).toFixed(1)}%
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
                  </div>

                  <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest px-3.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-2">
                    {topThree[0].quizzesCompleted} tests taken
                  </div>
                </motion.div>
              )}

              {/* 3RD PLACE PODIUM */}
              {topThree[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas hover:border-slate-300 dark:hover:border-slate-700 text-center flex flex-col items-center justify-between h-[260px] relative order-3"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700" />
                  
                  {/* Avatar wrapper */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner ring-4 ring-amber-600/35 shadow-md">
                      <img 
                        src={defaultAvatar} 
                        alt={topThree[2].full_name} 
                        className="w-8 h-8 object-contain opacity-75"
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-2 flex items-center justify-center w-5 h-5 rounded-lg bg-amber-700 text-white font-bold text-[10px] shadow">
                      3
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-xs font-sans line-clamp-1 mt-3">
                      {topThree[2].full_name}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block truncate max-w-[130px]">{topThree[2].email}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                      {Number(topThree[2].averagePercentage).toFixed(1)}%
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 mt-2">
                    {topThree[2].quizzesCompleted} tests taken
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Ranking Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-saas overflow-hidden">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight font-sans">Peer Rankings</h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">Aggregate performance rankings of classmates</p>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-500 dark:text-indigo-400">
                <Trophy className="w-4 h-4" />
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-4">Student Profile</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4 text-center">Completed Tests</th>
                    <th className="py-3.5 px-4 text-center">Total Score</th>
                    <th className="py-3.5 px-4">Accuracy Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {leaderboard.map((student, idx) => (
                    <tr key={student.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-smooth group">
                      
                      {/* Rank badge */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black shadow-inner ${
                          idx === 0 
                            ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-250 dark:border-yellow-900' 
                            : idx === 1 
                              ? 'bg-slate-300/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-850' 
                              : idx === 2 
                                ? 'bg-amber-700/10 text-amber-700 border border-amber-200 dark:border-amber-900' 
                                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-850'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>

                      {/* Profile Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner ring-2 ring-indigo-500/10 dark:ring-slate-800">
                            <img 
                              src={defaultAvatar} 
                              alt={student.full_name} 
                              className="w-6 h-6 object-contain opacity-75"
                            />
                          </div>
                          <div className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-smooth font-sans">
                            {student.full_name}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[180px] block">
                          {student.email}
                        </span>
                      </td>

                      {/* Tests Taken */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-[11px] font-black">
                          {student.quizzesCompleted} tests
                        </span>
                      </td>

                      {/* Total Score */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-extrabold text-slate-700 dark:text-slate-350 text-xs">
                          {student.totalMarks} marks
                        </span>
                      </td>

                      {/* Accuracy progress bar */}
                      <td className="py-3 px-4 min-w-[150px]">
                        <div className="flex items-center gap-3">
                          {/* Progress Line */}
                          <div className="flex-grow h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden hidden sm:block">
                            <div className="h-full bg-indigo-500" style={{ width: `${student.averagePercentage}%` }} />
                          </div>
                          <span className="font-extrabold text-xs text-slate-800 dark:text-white shrink-0 font-sans">
                            {Number(student.averagePercentage).toFixed(1)}%
                          </span>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default Leaderboard;
