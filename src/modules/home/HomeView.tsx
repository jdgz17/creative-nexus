import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Shuffle, Music, ArrowRight, ChevronDown } from 'lucide-react';

export const HomeView: React.FC = () => {
  // Ensure we start at top when navigating here
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col bg-slate-950">
      
      {/* Hero Section - Takes exactly the remaining viewport height */}
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-8 flex flex-col items-center animate-fadeIn pb-16">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl sm:rounded-[32px] bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-2xl shadow-indigo-500/20 flex items-center justify-center">
            <Hexagon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-sm">
            Creative Nexus
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-lg font-medium">
            Rompe tus bloqueos creativos con herramientas diseñadas para la ideación rápida y la experimentación.
          </p>
        </div>

        {/* Scroll indicator pointing to utilities */}
        <div className="absolute bottom-10 left-0 w-full flex justify-center text-slate-500 animate-bounce">
          <ChevronDown className="w-8 h-8" />
        </div>
      </div>

      {/* Utilities Section - Appears just below the fold */}
      <div className="w-full flex justify-center py-24 px-6 bg-slate-950 border-t border-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          
          {/* Generator Card */}
          <Link 
            to="/fusion/anime-music" 
            className="group relative flex flex-col text-left p-10 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-indigo-500/10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-bl-[150px] -z-0 transition-transform duration-500 group-hover:scale-125" />
            
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-colors relative z-10 shadow-inner">
              <Shuffle className="w-8 h-8" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 relative z-10 tracking-tight">
              Fusión Creativa
            </h2>
            <p className="text-slate-400 font-medium mb-10 flex-grow relative z-10 text-lg leading-relaxed">
              Descubre combinaciones inesperadas entre tus animes favoritos y artistas legendarios con nuestras ruletas interactivas.
            </p>
            
            <div className="flex items-center gap-2 text-indigo-400 font-bold mt-auto relative z-10 group-hover:translate-x-2 transition-transform">
              Entrar a Fusión Creativa <ArrowRight className="w-5 h-5" />
            </div>
          </Link>

          {/* Timeline Card */}
          <Link 
            to="/timeline" 
            className="group relative flex flex-col text-left p-10 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-rose-500/10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-bl-[150px] -z-0 transition-transform duration-500 group-hover:scale-125" />
            
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-colors relative z-10 shadow-inner">
              <Music className="w-8 h-8" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4 relative z-10 tracking-tight">
              Estudio Multipista
            </h2>
            <p className="text-slate-400 font-medium mb-10 flex-grow relative z-10 text-lg leading-relaxed">
              Crea y organiza composiciones musicales en una línea de tiempo intuitiva. Un DAW minimalista directo en el navegador.
            </p>
            
            <div className="flex items-center gap-2 text-rose-400 font-bold mt-auto relative z-10 group-hover:translate-x-2 transition-transform">
              Entrar al Estudio <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
          
        </div>
      </div>

    </div>
  );
};
