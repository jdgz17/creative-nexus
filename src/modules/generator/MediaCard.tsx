import React, { useState } from 'react';
import { Film, Tv, Gamepad2, Sparkles, Lock, Unlock, Shuffle } from 'lucide-react';
import { MediaItem } from '../../types';
import { AUDIOVISUAL_MEDIA_LIST } from '../../data/audiovisualData';

interface MediaCardProps {
  media: MediaItem;
  isLocked: boolean;
  onToggleLock: () => void;
  onSelectMedia: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  isLocked,
  onToggleLock,
  onSelectMedia,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const typeIcons = {
    pelicula: Film,
    serie: Tv,
    animacion: Sparkles,
    videojuego: Gamepad2,
  };

  const Icon = typeIcons[media.type] || Film;

  const typeLabels = {
    pelicula: 'Película',
    serie: 'Serie de TV',
    animacion: 'Animación',
    videojuego: 'Videojuego',
  };

  return (
    <div className={`relative flex flex-col rounded-3xl overflow-hidden soft-card transition-all duration-300 border-2 ${
      isLocked ? 'border-indigo-500 shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Banner / Cover Image */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-950">
        <img
          src={media.posterUrl}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges & Lock Button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-indigo-300 border border-slate-700/80 backdrop-blur-md shadow-sm">
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              {typeLabels[media.type]}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-md">
              {media.year}
            </span>
          </div>

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
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-indigo-500/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
              }`}
              title={isLocked ? 'Fijado (no cambiará al generar)' : 'Fijar esta película'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Floating Title Over Poster */}
        <div className="absolute bottom-4 left-5 right-5 z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            {media.genre}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
            {media.title}
          </h2>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col justify-between flex-1 space-y-4 bg-slate-900/90">
        <div className="space-y-3">
          {media.tagline && (
            <p className="text-xs font-semibold text-slate-400 italic">
              "{media.tagline}"
            </p>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sinopsis del Mundo:
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {media.synopsis}
            </p>
          </div>
        </div>

        {/* Manual Picker Dropdown if opened */}
        {showPicker && (
          <div className="pt-3 border-t border-slate-800 animate-fadeIn">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
              Seleccionar otra obra audiovisual:
            </label>
            <select
              value={media.id}
              onChange={(e) => {
                const found = AUDIOVISUAL_MEDIA_LIST.find((m) => m.id === e.target.value);
                if (found) {
                  onSelectMedia(found);
                  setShowPicker(false);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {AUDIOVISUAL_MEDIA_LIST.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.year}) - {typeLabels[item.type]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
