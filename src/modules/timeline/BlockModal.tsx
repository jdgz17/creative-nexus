import React, { useState } from 'react';
import { Music, X, Trash2, Check, Sliders, Clock, Volume2 } from 'lucide-react';
import { TimelineBlock, InstrumentType } from '../../types';

interface BlockModalProps {
  isOpen: boolean;
  block: TimelineBlock | null;
  totalBeats: number;
  onClose: () => void;
  onSave: (updates: Partial<TimelineBlock>) => void;
  onDelete: (blockId: string) => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  block,
  totalBeats,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !block) return null;

  const [name, setName] = useState(block.name);
  const [startBeat, setStartBeat] = useState(block.startBeat);
  const [durationBeats, setDurationBeats] = useState(block.durationBeats);
  const [pitch, setPitch] = useState(block.pitch ?? 0);
  const [volume, setVolume] = useState(block.volume ?? 1);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      startBeat: Math.max(0, Math.min(totalBeats - 1, startBeat)),
      durationBeats: Math.max(1, durationBeats),
      pitch,
      volume,
    });
    onClose();
  };

  const durationPresets = [
    { label: '1 Beat (1/4)', beats: 1 },
    { label: '2 Beats (1/2)', beats: 2 },
    { label: '4 Beats (1 Compás)', beats: 4 },
    { label: '8 Beats (2 Compases)', beats: 8 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-5 animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: block.color }}
            />
            <h3 className="text-base font-bold text-white">
              Configurar Bloque de Instrumento
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Nombre del Bloque
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Inicio (Beat)
              </label>
              <input
                type="number"
                min={0}
                max={totalBeats - 1}
                value={startBeat}
                onChange={(e) => setStartBeat(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Duración (Beats)
              </label>
              <input
                type="number"
                min={1}
                max={totalBeats}
                value={durationBeats}
                onChange={(e) => setDurationBeats(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Duraciones Rápidas:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {durationPresets.map((dp) => (
                <button
                  type="button"
                  key={dp.beats}
                  onClick={() => setDurationBeats(dp.beats)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    durationBeats === dp.beats
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {dp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch Tuning */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-1">
              <span>Afinación / Tono</span>
              <span className="text-indigo-400">{pitch > 0 ? `+${pitch}` : pitch} semitonos</span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-1">
              <span>Volumen del Bloque</span>
              <span className="text-indigo-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onDelete(block.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Bloque</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
