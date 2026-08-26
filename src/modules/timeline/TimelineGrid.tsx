import React, { useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Music2,
  Radio,
  Sliders,
  Play,
} from 'lucide-react';
import { TimelineTrack, TimelineBlock, InstrumentType } from '../../types';
import { useTimelineStore } from '../../store/useTimelineStore';

interface TimelineGridProps {
  tracks: TimelineTrack[];
  totalBeats: number;
  currentBeat: number;
  onSelectBlock: (block: TimelineBlock) => void;
  onAddBlockClick: (trackId: string, beatIndex: number) => void;
}

const BEAT_WIDTH = 48; // px per beat

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  tracks,
  totalBeats,
  currentBeat,
  onSelectBlock,
  onAddBlockClick,
}) => {
  const {
    toggleTrackMute,
    toggleTrackSolo,
    setTrackVolume,
    deleteTrack,
    previewSound,
    seek,
  } = useTimelineStore();

  const rulerRef = useRef<HTMLDivElement>(null);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickedBeat = Math.floor(clickX / BEAT_WIDTH);
    seek(Math.max(0, Math.min(totalBeats - 1, clickedBeat)));
  };

  const timelineWidth = totalBeats * BEAT_WIDTH;

  return (
    <div className="rounded-3xl soft-card border border-slate-800 overflow-hidden select-none">
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* Top Ruler Header */}
          <div className="flex border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20">
            {/* Track Info Header */}
            <div className="w-56 sm:w-64 p-3 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-800 shrink-0 flex items-center justify-between">
              <span>PISTAS / INSTRUMENTOS</span>
              <span className="text-[10px] text-slate-500 font-normal">{tracks.length} Pistas</span>
            </div>

            {/* Bars & Beats Ruler */}
            <div
              ref={rulerRef}
              onClick={handleRulerClick}
              className="relative h-10 cursor-pointer bg-slate-950/60"
              style={{ width: `${timelineWidth}px` }}
            >
              {Array.from({ length: totalBeats }).map((_, beatIdx) => {
                const isBarStart = beatIdx % 4 === 0;
                const barNumber = Math.floor(beatIdx / 4) + 1;
                const subBeat = (beatIdx % 4) + 1;

                return (
                  <div
                    key={beatIdx}
                    className={`absolute top-0 bottom-0 border-l flex items-center px-1 text-[10px] font-mono ${
                      isBarStart
                        ? 'border-slate-700 font-bold text-indigo-300'
                        : 'border-slate-800/60 text-slate-500'
                    }`}
                    style={{
                      left: `${beatIdx * BEAT_WIDTH}px`,
                      width: `${BEAT_WIDTH}px`,
                    }}
                  >
                    {isBarStart ? `C${barNumber}` : `.${subBeat}`}
                  </div>
                );
              })}

              {/* Playhead Marker on Ruler */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none"
                style={{ left: `${currentBeat * BEAT_WIDTH}px` }}
              >
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -translate-x-[4px] -translate-y-1 shadow-md shadow-rose-500/50" />
              </div>
            </div>
          </div>

          {/* Track Lanes */}
          <div className="relative divide-y divide-slate-800/80 bg-slate-900/60">
            {/* Full Height Playhead Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none transition-all duration-75"
              style={{
                left: `calc(${currentBeat * BEAT_WIDTH}px + ${224}px)`,
                // 224px is w-56 for track header
              }}
            />

            {tracks.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No hay pistas. Haz clic en "Agregar Pista" para comenzar.
              </div>
            ) : (
              tracks.map((track) => (
                <div key={track.id} className="flex group hover:bg-slate-900/80 transition-colors">
                  {/* Left Track Header */}
                  <div className="w-56 sm:w-64 p-3 border-r border-slate-800 shrink-0 flex items-center justify-between gap-2 bg-slate-950/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => previewSound(track.instrument)}
                        className="p-2 rounded-xl transition-all shadow-sm shrink-0"
                        style={{ backgroundColor: `${track.color}25`, color: track.color }}
                        title="Probar sonido del instrumento"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {track.name}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-medium">
                          {track.instrument.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Mute, Solo, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleTrackMute(track.id)}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${
                          track.isMuted
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                        title="Silenciar Pista (Mute)"
                      >
                        M
                      </button>

                      <button
                        onClick={() => toggleTrackSolo(track.id)}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${
                          track.isSolo
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                        title="Solo Pista"
                      >
                        S
                      </button>

                      {tracks.length > 1 && (
                        <button
                          onClick={() => deleteTrack(track.id)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                          title="Eliminar Pista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Track Lane Grid & Blocks */}
                  <div
                    className="relative h-16 bg-slate-900/40 cursor-crosshair"
                    style={{ width: `${timelineWidth}px` }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const beatIndex = Math.floor(clickX / BEAT_WIDTH);
                      onAddBlockClick(track.id, beatIndex);
                    }}
                  >
                    {/* Beat Grid Lines */}
                    {Array.from({ length: totalBeats }).map((_, beatIdx) => (
                      <div
                        key={beatIdx}
                        className={`absolute top-0 bottom-0 border-l pointer-events-none ${
                          beatIdx % 4 === 0
                            ? 'border-slate-800/90'
                            : 'border-slate-800/30'
                        }`}
                        style={{ left: `${beatIdx * BEAT_WIDTH}px` }}
                      />
                    ))}

                    {/* Track Blocks */}
                    {track.blocks.map((block) => {
                      const blockWidth = block.durationBeats * BEAT_WIDTH - 4; // -4 for visual margin
                      const blockLeft = block.startBeat * BEAT_WIDTH + 2;

                      return (
                        <div
                          key={block.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBlock(block);
                          }}
                          className="absolute top-2 bottom-2 rounded-xl shadow-md cursor-pointer flex flex-col justify-between p-1.5 transition-transform hover:scale-[1.02] hover:brightness-110 active:scale-95 group/block"
                          style={{
                            left: `${blockLeft}px`,
                            width: `${Math.max(24, blockWidth)}px`,
                            backgroundColor: block.color,
                          }}
                          title={`${block.name} (Duración: ${block.durationBeats} beats - Clic para editar)`}
                        >
                          <div className="flex items-center justify-between text-slate-950 font-bold text-[10px] truncate leading-none">
                            <span className="truncate">{block.name}</span>
                            {block.pitch !== undefined && block.pitch !== 0 && (
                              <span className="text-[9px] opacity-80">
                                {block.pitch > 0 ? `+${block.pitch}` : block.pitch}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[8px] text-slate-900 font-semibold opacity-75">
                            <span>{block.durationBeats}b</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
