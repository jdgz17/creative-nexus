import React from 'react';
import { Hexagon } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-8 mt-auto">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 opacity-60">
          <Hexagon className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold tracking-tight text-white font-sans">
            Creative Nexus
          </span>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          <p>© {new Date().getFullYear()} Creative Nexus. Todos los derechos reservados.</p>
          <p className="mt-1">Diseñado para potenciar la imaginación y romper bloqueos creativos.</p>
        </div>

      </div>
    </footer>
  );
};
