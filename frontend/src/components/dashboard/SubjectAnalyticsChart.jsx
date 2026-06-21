import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip
} from 'recharts';
import { BarChart3, HelpCircle } from 'lucide-react';

const SubjectAnalyticsChart = ({ data = [], loading = false }) => {
  
  // Custom Color Palette for the 8 Subjects matching premium SaaS dashboard
  const COLORS = {
    'Telugu': '#f59e0b',          // Amber
    'Hindi': '#f43f5e',           // Rose
    'English': '#3b82f6',         // Blue
    'Maths': '#8b5cf6',           // Purple
    'Physics': '#06b6d4',         // Cyan
    'Chemistry': '#10b981',       // Emerald
    'Biology': '#22c55e',         // Green
    'Social Studies': '#d946ef'   // Fuchsia
  };

  const DEFAULT_COLORS = ['#f59e0b', '#f43f5e', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#22c55e', '#d946ef'];

  // Sort data strictly by requested subject order
  const sortedData = React.useMemo(() => {
    const subjectOrder = {
      'telugu': 1,
      'hindi': 2,
      'english': 3,
      'maths': 4,
      'physics': 5,
      'chemistry': 6,
      'biology': 7,
      'social': 8,
      'social studies': 8
    };

    return [...data].sort((a, b) => {
      const aOrder = subjectOrder[(a.subject || '').toLowerCase().trim()] || 99;
      const bOrder = subjectOrder[(b.subject || '').toLowerCase().trim()] || 99;
      return aOrder - bOrder;
    });
  }, [data]);

  // Filter data to only show subjects with attempted quizzes > 0
  const chartData = sortedData
    .filter(item => item.attempted > 0)
    .map(item => ({
      name: item.subject,
      value: item.attempted,
      percentage: item.percentage
    }));

  const totalAttempted = sortedData.reduce((acc, curr) => acc + curr.attempted, 0);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs font-sans">
          <p className="font-bold text-sm tracking-wide">{data.name}</p>
          <div className="h-px bg-slate-800 my-1.5" />
          <p className="font-medium text-slate-300">Quizzes Taken: <span className="font-black text-white">{data.value}</span></p>
          <p className="font-medium text-slate-300 mt-0.5">Average Score: <span className="font-black text-white">{data.percentage}%</span></p>
        </div>
      );
    }
    return null;
  };

  // Custom Legend component
  const RenderLegend = () => {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 px-2">
        {sortedData.map((item, idx) => {
          const color = COLORS[item.subject] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
          const hasAttempted = item.attempted > 0;
          return (
            <div key={item.subject} className="flex items-center justify-between text-xs py-0.5">
              <div className="flex items-center gap-2 overflow-hidden mr-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="font-semibold text-slate-600 truncate">{item.subject}</span>
              </div>
              <span className={`font-black text-slate-800 shrink-0 ${!hasAttempted ? 'opacity-30' : ''}`}>
                {item.attempted} tests
              </span>
            </div>
          );
        })}
      </div>
    );
  };

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
          <h3 className="font-black text-slate-800 text-lg tracking-tight font-sans">Quiz Subject Analytics</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Total attempts contribution breakdown</p>
        </div>
        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-500">
          <BarChart3 className="w-4 h-4" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 flex flex-col justify-center py-4 overflow-hidden relative">
        {totalAttempted > 0 ? (
          <>
            {/* Real Donut Pie Chart */}
            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => {
                      const color = COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={color} 
                          className="hover:opacity-90 cursor-pointer outline-none focus:outline-none"
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Central Text inside Donut */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center justify-center">
                <span className="block text-2xl font-black text-slate-800 tracking-tighter leading-none">
                  {totalAttempted}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                  Attempts
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <RenderLegend />
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3.5 my-auto">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <HelpCircle className="w-8 h-8 stroke-1.5" />
            </div>
            <div>
              <span className="block font-bold text-sm text-slate-700">No Attempts Recorded Yet</span>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mt-1">
                Take your first quiz in any subject from the "Tests" tab to generate dynamic analysis data!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectAnalyticsChart;
