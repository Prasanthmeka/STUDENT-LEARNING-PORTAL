import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, subtitle, parentPath, parentLabel, showBackButton = false }) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-saas hover:border-slate-300 transition-smooth mb-8 shrink-0">
      {/* Decorative Indigo Glow line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Student Hub</span>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {parentLabel && (
              <>
                <button 
                  onClick={() => parentPath && navigate(parentPath)} 
                  className="hover:text-indigo-500 transition-smooth"
                >
                  {parentLabel}
                </button>
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              </>
            )}
            <span className="text-slate-600 truncate max-w-[120px] md:max-w-none">{title}</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-none font-sans">
            {title}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1 leading-normal max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Back Button Action */}
        {showBackButton && (
          <button
            onClick={() => parentPath ? navigate(parentPath) : navigate(-1)}
            className="flex items-center gap-2 self-start md:self-auto py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 font-bold text-xs tracking-wide transition-smooth"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
