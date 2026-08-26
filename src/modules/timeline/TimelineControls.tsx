import React from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  FolderOpen,
  Plus,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Music,
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';

interface TimelineControlsProps {
  onOpenProjectManager: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({ onOpenProjectManager }) => {
  const {
    isPlaying,
    currentBeat,
    setBpm,
    setTotalBeats,
    loop,
    setLoop,
    togglePlay,
    stop,
    getActiveProject,
  } = useTimelineStore();

  const activeProject = getActiveProject();
  const bpm = activeProject.bpm;
  const totalBeats = activeProject.totalBeats;

  // Format current playhead (Compás.Beat)
  const currentBar = Math.floor(currentBeat / 4) + 1;
  const currentSubBeat = (Math.floor(currentBeat) % 4) + 1;
  const totalBars = totalBeats / 4;

  return (
    <div className="p-4 rounded-3xl soft-card border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* Left: Active Project Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenProjectManager}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
        >
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Proyecto Activo:
            </div>
            <div className="text-sm font-bold text-white max-w-[180px] truncate">
              {activeProject.name}
            </div>
          </div>
        </button>

        <button
          onClick={onOpenProjectManager}
          className="px-3 py-2.5 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-colors"
        >
          Proyectos
        </button>
      </div>

      {/* Center: Playback Transport Buttons */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all select-none ${
            isPlaying
              ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30 ring-2 ring-indigo-400/50'
              : 'bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 shadow-indigo-600/30 hover:scale-105 active:scale-95'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Reproducir</span>
            </>
          )}
        </button>

        <button
          onClick={stop}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Detener y volver al inicio"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={() => setLoop(!loop)}
          className={`p-3 rounded-2xl border transition-all ${
            loop
              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-sm'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
          title={loop ? 'Bucle activado' : 'Bucle desactivado'}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Position Counter */}
        <div className="px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase">TIEMPO</span>
          <span className="text-xs font-mono font-bold text-indigo-300">
            {currentBar}.{currentSubBeat} / {totalBars}.4
          </span>
        </div>
      </div>

      {/* Right: BPM (Tempo) & Total Bars Controls */}
      <div className="flex items-center justify-end gap-4">
        {/* BPM Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">TEMPO</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-mono font-bold text-white">{bpm}</span>
              <span className="text-[10px] text-slate-500">BPM</span>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => setBpm(bpm - 5)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reducir 5 BPM"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBpm(bpm + 5)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Aumentar 5 BPM"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Length in Bars */}
        <div className="flex flex-col bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800">
          <span className="text-[9px] font-bold text-slate-400 uppercase">LONGITUD</span>
          <select
            value={totalBeats}
            onChange={(e) => setTotalBeats(parseInt(e.target.value, 10))}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value={16} className="bg-slate-900 text-white">4 Compases (16 Beats)</option>
            <option value={32} className="bg-slate-900 text-white">8 Compases (32 Beats)</option>
            <option value={64} className="bg-slate-900 text-white">16 Compases (64 Beats)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
