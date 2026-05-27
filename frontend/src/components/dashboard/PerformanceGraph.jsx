import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { TrendingUp, Award } from 'lucide-react';

const PerformanceGraph = ({ data = [], loading = false }) => {

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3.5 rounded-2xl shadow-2xl text-xs font-sans">
          <p className="font-bold text-sm tracking-wide text-indigo-300">{payload[0].payload.month}</p>
          <div className="h-px bg-slate-800 my-2" />
          <p className="font-medium text-slate-300">Quizzes Taken: <span className="font-black text-white">{payload[0].payload.testsTaken}</span></p>
          <p className="font-medium text-slate-300 mt-1">Average Score: <span className="font-black text-emerald-400 text-sm">{payload[0].value}%</span></p>
        </div>
      );
    }
    return null;
  };

  const hasData = data.some(item => item.testsTaken > 0);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-saas h-[440px] skeleton-pulse flex flex-col justify-between" />
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-saas hover:border-slate-300 transition-smooth flex flex-col h-[440px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="font-black text-slate-800 text-lg tracking-tight font-sans">Monthly Test Performance</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Average score and performance growth trends</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl text-xs font-bold">
          <TrendingUp className="w-4 h-4" />
          Growth: Upwards
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 flex items-center justify-center pt-6 overflow-hidden relative">
        {hasData ? (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="95%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                {/* SVG Color Gradients */}
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  name="Average Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3.5 my-auto">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Award className="w-8 h-8 stroke-1.5" />
            </div>
            <div>
              <span className="block font-bold text-sm text-slate-700">No Historical Performance Found</span>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mt-1">
                Once you complete auto-graded tests, your monthly performance, scores, and growth trends will appear here!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceGraph;
