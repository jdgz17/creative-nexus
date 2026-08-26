import React, { useState } from 'react';
import { User, Award, Lock, Unlock, Shuffle, Heart } from 'lucide-react';
import { CharacterItem } from '../../types';
import { CHARACTERS_LIST } from '../../data/characterData';

interface CharacterCardProps {
  character: CharacterItem;
  isLocked: boolean;
  onToggleLock: () => void;
  onSelectCharacter: (item: CharacterItem) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isLocked,
  onToggleLock,
  onSelectCharacter,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const categoryLabels = {
    actor: 'Actor / Celebridad',
    personaje_ficcion: 'Personaje Icónico',
    icono_pop: 'Ícono Pop',
    historico: 'Figura Histórica',
  };

  const categoryBadgeColors = {
    actor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    personaje_ficcion: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icono_pop: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    historico: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className={`relative flex flex-col rounded-3xl overflow-hidden soft-card transition-all duration-300 border-2 ${
      isLocked ? 'border-rose-500 shadow-rose-500/10' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Banner / Portrait Image */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-950">
        <img
          src={character.photoUrl}
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges & Lock Button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm ${categoryBadgeColors[character.category]}`}>
            <User className="w-3.5 h-3.5" />
            {categoryLabels[character.category]}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-md backdrop-blur-md"
              title="Elegir manualmente"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleLock}
              className={`p-2 rounded-full transition-all shadow-md backdrop-blur-md ${
                isLocked
                  ? 'bg-rose-600 text-white border border-rose-400 shadow-rose-500/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
              }`}
              title={isLocked ? 'Fijado (no cambiará al generar)' : 'Fijar este personaje/actor'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Floating Title Over Photo */}
        <div className="absolute bottom-4 left-5 right-5 z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Conocido por: {character.famousFor}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
            {character.name}
          </h2>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col justify-between flex-1 space-y-4 bg-slate-900/90">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Personalidad / Rol:
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {character.roleOrPersonality}
            </p>
          </div>

          {character.quirk && (
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                Rasgo / Hábito Inconfundible:
              </h5>
              <p className="text-xs text-slate-300 font-sans">
                {character.quirk}
              </p>
            </div>
          )}
        </div>

        {/* Manual Picker Dropdown if opened */}
        {showPicker && (
          <div className="pt-3 border-t border-slate-800 animate-fadeIn">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
              Seleccionar otro personaje / actor:
            </label>
            <select
              value={character.id}
              onChange={(e) => {
                const found = CHARACTERS_LIST.find((c) => c.id === e.target.value);
                if (found) {
                  onSelectCharacter(found);
                  setShowPicker(false);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {CHARACTERS_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.famousFor})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
