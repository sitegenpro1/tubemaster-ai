import React from 'react';

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string; 
  description?: string; 
  noPadding?: boolean 
}> = ({ children, className = "", title, description, noPadding = false }) => (
  // Added transform-gpu and will-change-transform for smoother hover effects
  <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-brand-500/20 hover:bg-slate-900/70 group transform-gpu will-change-transform ${className}`}>
    {/* Glass Shine Effect */}
    <div className="absolute inset-0 bg-glass-shine opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-700" />
    
    <div className={`${noPadding ? '' : 'p-5 md:p-8'} relative z-10`}>
      {(title || description) && (
        <div className="mb-6 pb-4 border-b border-white/5">
          {title && <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-brand-200 transition-colors">{title}</h3>}
          {description && <p className="text-sm text-slate-400 mt-2 leading-relaxed font-light">{description}</p>}
        </div>
      )}
      {children}
    </div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'glow' | 'danger' }> = ({ 
  children, 
  variant = 'primary', 
  className = "", 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 tracking-wide text-sm md:text-base overflow-hidden isolate transform-gpu";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 border border-transparent",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50 hover:border-slate-600",
    outline: "border border-slate-600/50 text-slate-300 hover:border-brand-500/50 hover:text-brand-300 hover:bg-brand-500/5 backdrop-blur-sm",
    glow: "bg-white text-brand-950 hover:bg-brand-50 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_35px_rgba(20,184,166,0.5)] border border-transparent",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <div className="relative group">
    <input 
      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all placeholder:text-slate-600 hover:border-slate-700 backdrop-blur-sm" 
      {...props} 
    />
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10 blur-sm" />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select 
      className="w-full appearance-none bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all hover:border-slate-700 backdrop-blur-sm" 
      {...props} 
    >
      {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

export const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'brand' | 'purple' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-900/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-900/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-900/20',
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-brand-900/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-900/20'
  };
  return (
    <span className={`inline-flex items-center text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full border ${colors[color]} uppercase tracking-wider shadow-lg backdrop-blur-sm`}>
      {children}
    </span>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; center?: boolean }> = ({ title, subtitle, center }) => (
  <div className={`mb-12 ${center ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
      {title}
    </h2>
    {subtitle && <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">{subtitle}</p>}
  </div>
);