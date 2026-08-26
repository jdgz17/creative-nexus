import React, { useState, useEffect } from 'react';
import {
  Music,
  Plus,
  Sliders,
  FolderOpen,
  Volume2,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { TimelineControls } from './TimelineControls';
import { TimelineGrid } from './TimelineGrid';
import { BlockModal } from './BlockModal';
import { ProjectManagerModal } from './ProjectManagerModal';
import { TimelineBlock, InstrumentType } from '../../types';

export const TimelineView: React.FC = () => {
  const {
    getActiveProject,
    currentBeat,
    addTrack,
    addBlock,
    updateBlock,
    deleteBlock,
    initAudio,
    previewSound,
  } = useTimelineStore();

  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimelineBlock | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const activeProject = getActiveProject();

  useEffect(() => {
    initAudio();
  }, [initAudio]);

  const handleSelectBlock = (block: TimelineBlock) => {
    setSelectedBlock(block);
    setIsBlockModalOpen(true);
  };

  const handleAddBlockClick = (trackId: string, beatIndex: number) => {
    const track = activeProject.tracks.find((t) => t.id === trackId);
    if (!track) return;

    // Default duration depending on instrument
    let defaultDuration = 1;
    if (track.instrument === 'bass' || track.instrument === 'synth_lead') defaultDuration = 2;
    if (track.instrument === 'ambient_pad' || track.instrument === 'chords') defaultDuration = 4;

    addBlock(trackId, beatIndex, defaultDuration, track.name);
    previewSound(track.instrument);
  };

  const availableInstruments: { type: InstrumentType; label: string; color: string }[] = [
    { type: 'kick', label: 'Batería (Kick)', color: '#6366f1' },
    { type: 'snare', label: 'Caja (Snare)', color: '#f43f5e' },
    { type: 'hihat', label: 'Hi-Hat', color: '#06b6d4' },
    { type: 'bass', label: 'Bajo Sintético', color: '#eab308' },
    { type: 'synth_lead', label: 'Lead Melódico', color: '#8b5cf6' },
    { type: 'ambient_pad', label: 'Pad Armónico', color: '#10b981' },
    { type: 'chords', label: 'Acordes / Piano', color: '#3b82f6' },
    { type: 'fx_riser', label: 'Efecto FX Riser', color: '#ec4899' },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-1">
            <Music className="w-3.5 h-3.5" />
            <span>Estudio de Línea de Tiempo & Secuenciador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Editor de Pista & Arreglo Musical
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Añade instrumentos a la línea de tiempo, define en qué compás inician y cuánto duran sus notas.
          </p>
        </div>

        {/* Quick Instructions Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Haz clic en cualquier carril para añadir bloques de sonido</span>
        </div>
      </div>

      {/* Transport & Master Controls */}
      <TimelineControls onOpenProjectManager={() => setIsProjectManagerOpen(true)} />

      {/* Add New Track Instrument Bar */}
      <div className="p-3.5 rounded-3xl soft-card border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            + Añadir Pista de Instrumento:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {availableInstruments.map((inst) => (
            <button
              key={inst.type}
              onClick={() => addTrack(inst.label, inst.type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all hover:scale-105 shadow-sm"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: inst.color }}
              />
              <span>{inst.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Timeline Workspace Grid */}
      <TimelineGrid
        tracks={activeProject.tracks}
        totalBeats={activeProject.totalBeats}
        currentBeat={currentBeat}
        onSelectBlock={handleSelectBlock}
        onAddBlockClick={handleAddBlockClick}
      />

      {/* Block Settings Modal */}
      <BlockModal
        isOpen={isBlockModalOpen}
        block={selectedBlock}
        totalBeats={activeProject.totalBeats}
        onClose={() => {
          setIsBlockModalOpen(false);
          setSelectedBlock(null);
        }}
        onSave={(updates) => {
          if (selectedBlock) {
            updateBlock(selectedBlock.id, updates);
          }
        }}
        onDelete={(blockId) => {
          deleteBlock(blockId);
        }}
      />

      {/* Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
      />
    </div>
  );
};
