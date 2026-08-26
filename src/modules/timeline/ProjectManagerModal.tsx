import React, { useState } from 'react';
import { FolderKanban, Plus, Copy, Trash2, Check, X, Clock, Music } from 'lucide-react';
import { useTimelineStore } from '../../store/useTimelineStore';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    duplicateProject,
    deleteProject,
  } = useTimelineStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newBpm, setNewBpm] = useState(120);
  const [newBeats, setNewBeats] = useState(16);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    createProject(newProjectName, newBpm, newBeats);
    setNewProjectName('');
    setIsCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-5 animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Proyectos de Pista Guardados
              </h3>
              <p className="text-xs text-slate-400">
                Guardado automático y seguro en tu navegador (localStorage).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Project Section */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Nuevo Proyecto de Pista
            </h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="ej. Beat Chillhop Nocturno"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">BPM (Tempo)</label>
                <input
                  type="number"
                  min={40}
                  max={240}
                  value={newBpm}
                  onChange={(e) => setNewBpm(parseInt(e.target.value, 10) || 120)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Longitud (Beats)</label>
                <select
                  value={newBeats}
                  onChange={(e) => setNewBeats(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={16}>16 Beats (4 compases)</option>
                  <option value={32}>32 Beats (8 compases)</option>
                  <option value={64}>64 Beats (16 compases)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
              >
                Crear Pista
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 rounded-2xl border border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Proyecto</span>
          </button>
        )}

        {/* Existing Projects List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const totalBlocks = proj.tracks.reduce((acc, t) => acc + t.blocks.length, 0);

            return (
              <div
                key={proj.id}
                onClick={() => {
                  setActiveProjectId(proj.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-white truncate">
                      {proj.name}
                    </h5>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{proj.bpm} BPM</span>
                    <span>•</span>
                    <span>{proj.tracks.length} Pistas ({totalBlocks} bloques)</span>
                    <span>•</span>
                    <span>{proj.totalBeats} Beats</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => duplicateProject(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Duplicar proyecto"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {projects.length > 1 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar proyecto "${proj.name}"?`)) {
                          deleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
