import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Hexagon, ChevronDown, Sparkles } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isFusionActive = location.pathname.includes('/fusion');

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-4 sm:px-8">
      {/* Logo & Brand */}
      <NavLink to="/" className="flex items-center gap-3 mr-10 hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-md flex items-center justify-center">
          <Hexagon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-white font-sans">
          Creative Nexus
        </span>
      </NavLink>

      {/* Navigation Links */}
      <nav className="flex items-center gap-6 h-full">
        {/* Dropdown Menu para Fusión Creativa */}
        <div className="relative h-full flex items-center" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-150 py-2 focus:outline-none ${
              isFusionActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fusión Creativa
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            
            {isFusionActive && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
            )}
          </button>

          {/* Dropdown Modal */}
          {dropdownOpen && (
            <div className="absolute top-14 left-0 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden py-1 animate-fadeIn">
              <NavLink
                to="/fusion/anime-music"
                onClick={() => setDropdownOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`
                }
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Anime × Músico</div>
                  <div className="text-[10px] text-slate-500 leading-tight">Generador de conceptos</div>
                </div>
              </NavLink>
              {/* Espacio para futuras combinaciones (ej. Películas x Instrumento) */}
            </div>
          )}
        </div>

        <NavLink
          to="/timeline"
          className={({ isActive }) =>
            `flex h-full items-center text-sm font-semibold transition-colors duration-150 relative ${
              isActive
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              Estudio Multipista
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
              )}
            </>
          )}
        </NavLink>
      </nav>
    </header>
  );
};
