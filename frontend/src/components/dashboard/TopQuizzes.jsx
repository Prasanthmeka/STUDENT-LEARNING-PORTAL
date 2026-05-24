import React from 'react';
import { Trophy, Calendar, Sparkles, HelpCircle, Edit } from 'lucide-react';

const TopQuizzes = ({ quizzes = [], loading = false }) => {

  const getSubjectColor = (subject) => {
    const colors = {
      'Telugu': 'bg-amber-50 text-amber-600 border-amber-100',
      'Hindi': 'bg-rose-50 text-rose-600 border-rose-100',
      'English': 'bg-blue-50 text-blue-600 border-blue-100',
      'Maths': 'bg-purple-50 text-purple-600 border-purple-100',
      'Physics': 'bg-cyan-50 text-cyan-600 border-cyan-100',
      'Chemistry': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Biology': 'bg-green-50 text-green-600 border-green-100',
      'Social Studies': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
      'Social': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'
    };
    return colors[subject] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return 'bg-yellow-500 text-white shadow-yellow-500/20';
    if (rank === 1) return 'bg-slate-400 text-white shadow-slate-400/20';
    return 'bg-amber-700 text-white shadow-amber-700/20';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-saas h-[380px] skeleton-pulse flex flex-col justify-between" />
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-saas hover:border-slate-300 transition-smooth flex flex-col h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="font-black text-slate-800 text-lg tracking-tight font-sans">Top 3 Quizzes Attempted</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Your highest performing quiz results</p>
        </div>
        <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-500">
          <Trophy className="w-4 h-4" />
        </div>
      </div>

      {/* Body Table Content */}
      <div className="flex-1 flex flex-col justify-center py-2 overflow-hidden">
        {quizzes.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  <th className="py-3 px-2">Rank</th>
                  <th className="py-3 px-4">Quiz Name</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Attempts</th>
                  <th className="py-3 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quizzes.map((quiz, index) => (
                  <tr key={quiz.id} className="hover:bg-slate-50/50 transition-smooth group">
                    {/* Rank Badge */}
                    <td className="py-3 px-2">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black shadow-md ${getRankBadge(index)}`}>
                        {index + 1}
                      </span>
                    </td>
                    
                    {/* Quiz Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-smooth text-sm max-w-[200px] truncate font-sans">
                        {quiz.quizName}
                      </div>
                    </td>

                    {/* Subject Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSubjectColor(quiz.subject)}`}>
                        {quiz.subject}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-sm text-slate-800 font-sans">
                        {quiz.score}%
                      </span>
                    </td>

                    {/* Attempts */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                        {quiz.attempts}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs text-slate-400 font-semibold font-sans">
                        <Calendar className="w-3.5 h-3.5" />
                        {quiz.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3.5 my-auto">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <HelpCircle className="w-8 h-8 stroke-1.5" />
            </div>
            <div>
              <span className="block font-bold text-sm text-slate-700">No Top Quizzes Found</span>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mt-1">
                You have not completed any quizzes yet. Go to the "Tests" section, select a subject, and finish a quiz to list rankings!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopQuizzes;
