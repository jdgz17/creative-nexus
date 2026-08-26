import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Sliders, Dices, Music, Compass } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-8">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Compass className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black tracking-tight text-white font-sans">
            Creative Nexus
          </span>
          <span className="text-[11px] text-slate-400 font-medium -mt-0.5">
            Ideación & Estudio Creativo
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`
          }
        >
          <Dices className="w-4 h-4" />
          <span>Generador de Ideas</span>
        </NavLink>

        <NavLink
          to="/timeline"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`
          }
        >
          <Music className="w-4 h-4" />
          <span>Editor de Línea de Tiempo</span>
        </NavLink>
      </nav>
    </header>
  );
};
