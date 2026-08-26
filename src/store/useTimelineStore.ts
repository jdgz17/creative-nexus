import { create } from 'zustand';
import { TimelineProject, TimelineTrack, TimelineBlock, InstrumentType } from '../types';
import { TimelineAudioEngine } from '../audio/TimelineAudioEngine';

const STORAGE_KEY = 'creative_nexus_timeline_projects_v2';

const DEFAULT_INITIAL_PROJECT: TimelineProject = {
  id: 'proj-demo-1',
  name: 'Mi Primera Pista (Demo)',
  description: 'Un ritmo base de sintetizador con batería, bajo y melodía.',
  bpm: 120,
  totalBeats: 16, // 4 compases de 4 beats
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tracks: [
    {
      id: 'track-kick',
      name: '808 Kick Drum',
      instrument: 'kick',
      color: '#6366f1', // Indigo
      isMuted: false,
      isSolo: false,
      volume: 0.9,
      blocks: [
        { id: 'b-k1', trackId: 'track-kick', instrument: 'kick', name: 'Kick', color: '#6366f1', startBeat: 0, durationBeats: 1 },
        { id: 'b-k2', trackId: 'track-kick', instrument: 'kick', name: 'Kick', color: '#6366f1', startBeat: 4, durationBeats: 1 },
        { id: 'b-k3', trackId: 'track-kick', instrument: 'kick', name: 'Kick', color: '#6366f1', startBeat: 8, durationBeats: 1 },
        { id: 'b-k4', trackId: 'track-kick', instrument: 'kick', name: 'Kick', color: '#6366f1', startBeat: 12, durationBeats: 1 },
      ],
    },
    {
      id: 'track-snare',
      name: 'Crisp Snare',
      instrument: 'snare',
      color: '#f43f5e', // Rose
      isMuted: false,
      isSolo: false,
      volume: 0.85,
      blocks: [
        { id: 'b-s1', trackId: 'track-snare', instrument: 'snare', name: 'Snare', color: '#f43f5e', startBeat: 4, durationBeats: 1 },
        { id: 'b-s2', trackId: 'track-snare', instrument: 'snare', name: 'Snare', color: '#f43f5e', startBeat: 12, durationBeats: 1 },
      ],
    },
    {
      id: 'track-hihat',
      name: 'Hi-Hat Rhythm',
      instrument: 'hihat',
      color: '#06b6d4', // Cyan
      isMuted: false,
      isSolo: false,
      volume: 0.65,
      blocks: [
        { id: 'b-h1', trackId: 'track-hihat', instrument: 'hihat', name: 'Hat', color: '#06b6d4', startBeat: 2, durationBeats: 1 },
        { id: 'b-h2', trackId: 'track-hihat', instrument: 'hihat', name: 'Hat', color: '#06b6d4', startBeat: 6, durationBeats: 1 },
        { id: 'b-h3', trackId: 'track-hihat', instrument: 'hihat', name: 'Hat', color: '#06b6d4', startBeat: 10, durationBeats: 1 },
        { id: 'b-h4', trackId: 'track-hihat', instrument: 'hihat', name: 'Hat', color: '#06b6d4', startBeat: 14, durationBeats: 1 },
      ],
    },
    {
      id: 'track-bass',
      name: 'Sub Synth Bass',
      instrument: 'bass',
      color: '#eab308', // Amber
      isMuted: false,
      isSolo: false,
      volume: 0.85,
      blocks: [
        { id: 'b-b1', trackId: 'track-bass', instrument: 'bass', name: 'Bass C', color: '#eab308', startBeat: 0, durationBeats: 3, pitch: 0 },
        { id: 'b-b2', trackId: 'track-bass', instrument: 'bass', name: 'Bass G', color: '#eab308', startBeat: 4, durationBeats: 3, pitch: 7 },
        { id: 'b-b3', trackId: 'track-bass', instrument: 'bass', name: 'Bass A', color: '#eab308', startBeat: 8, durationBeats: 3, pitch: 9 },
        { id: 'b-b4', trackId: 'track-bass', instrument: 'bass', name: 'Bass F', color: '#eab308', startBeat: 12, durationBeats: 3, pitch: 5 },
      ],
    },
    {
      id: 'track-lead',
      name: 'Melodic Lead Synth',
      instrument: 'synth_lead',
      color: '#8b5cf6', // Violet
      isMuted: false,
      isSolo: false,
      volume: 0.7,
      blocks: [
        { id: 'b-l1', trackId: 'track-lead', instrument: 'synth_lead', name: 'Lead Arp', color: '#8b5cf6', startBeat: 2, durationBeats: 2, pitch: 4 },
        { id: 'b-l2', trackId: 'track-lead', instrument: 'synth_lead', name: 'Lead Arp', color: '#8b5cf6', startBeat: 6, durationBeats: 2, pitch: 7 },
        { id: 'b-l3', trackId: 'track-lead', instrument: 'synth_lead', name: 'Lead Arp', color: '#8b5cf6', startBeat: 10, durationBeats: 2, pitch: 11 },
        { id: 'b-l4', trackId: 'track-lead', instrument: 'synth_lead', name: 'Lead High', color: '#8b5cf6', startBeat: 14, durationBeats: 2, pitch: 12 },
      ],
    },
    {
      id: 'track-pad',
      name: 'Ambient Warm Pad',
      instrument: 'ambient_pad',
      color: '#10b981', // Emerald
      isMuted: false,
      isSolo: false,
      volume: 0.6,
      blocks: [
        { id: 'b-p1', trackId: 'track-pad', instrument: 'ambient_pad', name: 'Lush Pad', color: '#10b981', startBeat: 0, durationBeats: 8, pitch: 0 },
        { id: 'b-p2', trackId: 'track-pad', instrument: 'ambient_pad', name: 'Lush Pad 2', color: '#10b981', startBeat: 8, durationBeats: 8, pitch: 5 },
      ],
    },
  ],
};

const loadProjects = (): TimelineProject[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [DEFAULT_INITIAL_PROJECT];
};

const saveProjects = (projects: TimelineProject[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // fallback
  }
};

interface TimelineState {
  projects: TimelineProject[];
  activeProjectId: string;
  isPlaying: boolean;
  currentBeat: number;
  loop: boolean;
  selectedBlockId: string | null;

  // Project getters & setters
  getActiveProject: () => TimelineProject;
  setActiveProjectId: (id: string) => void;
  createProject: (name: string, bpm?: number, totalBeats?: number) => string;
  updateActiveProject: (updates: Partial<TimelineProject>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => string;

  // Track actions
  addTrack: (name: string, instrument: InstrumentType) => void;
  deleteTrack: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  setTrackVolume: (trackId: string, volume: number) => void;

  // Block actions
  addBlock: (trackId: string, startBeat: number, durationBeats: number, name?: string, pitch?: number) => void;
  updateBlock: (blockId: string, updates: Partial<TimelineBlock>) => void;
  moveBlock: (blockId: string, newStartBeat: number, newTrackId?: string) => void;
  resizeBlock: (blockId: string, newDuration: number) => void;
  deleteBlock: (blockId: string) => void;
  setSelectedBlockId: (id: string | null) => void;

  // Timeline transport
  initAudio: () => void;
  setBpm: (bpm: number) => void;
  setTotalBeats: (beats: number) => void;
  togglePlay: () => void;
  stop: () => void;
  seek: (beat: number) => void;
  setLoop: (loop: boolean) => void;
  previewSound: (instrument: InstrumentType, pitch?: number) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => {
  const initialProjects = loadProjects();
  const engine = TimelineAudioEngine.getInstance();

  return {
    projects: initialProjects,
    activeProjectId: initialProjects[0]?.id || 'proj-demo-1',
    isPlaying: false,
    currentBeat: 0,
    loop: true,
    selectedBlockId: null,

    getActiveProject: () => {
      const { projects, activeProjectId } = get();
      return projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_INITIAL_PROJECT;
    },

    setActiveProjectId: (id) => {
      get().stop();
      set({ activeProjectId: id, selectedBlockId: null });
      const proj = get().projects.find((p) => p.id === id);
      if (proj) {
        engine.setBpm(proj.bpm);
        engine.setTotalBeats(proj.totalBeats);
        engine.setTracks(proj.tracks);
      }
    },

    createProject: (name, bpm = 120, totalBeats = 16) => {
      get().stop();
      const newId = `proj-${Date.now()}`;
      const newProject: TimelineProject = {
        id: newId,
        name: name.trim() || 'Nueva Pista',
        bpm,
        totalBeats,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tracks: [
          {
            id: `track-kick-${Date.now()}`,
            name: 'Kick Drum',
            instrument: 'kick',
            color: '#6366f1',
            isMuted: false,
            isSolo: false,
            volume: 0.9,
            blocks: [
              { id: `b-k1-${Date.now()}`, trackId: `track-kick-${Date.now()}`, instrument: 'kick', name: 'Kick', color: '#6366f1', startBeat: 0, durationBeats: 1 },
              { id: `b-k2-${Date.now()}`, trackId: `track-kick-${Date.now()}`, instrument: 'kick', name: 'Kick', color: '#6366f1', startBeat: 4, durationBeats: 1 },
            ],
          },
          {
            id: `track-snare-${Date.now()}`,
            name: 'Snare',
            instrument: 'snare',
            color: '#f43f5e',
            isMuted: false,
            isSolo: false,
            volume: 0.85,
            blocks: [
              { id: `b-s1-${Date.now()}`, trackId: `track-snare-${Date.now()}`, instrument: 'snare', name: 'Snare', color: '#f43f5e', startBeat: 4, durationBeats: 1 },
            ],
          },
          {
            id: `track-lead-${Date.now()}`,
            name: 'Synth Lead',
            instrument: 'synth_lead',
            color: '#8b5cf6',
            isMuted: false,
            isSolo: false,
            volume: 0.75,
            blocks: [
              { id: `b-l1-${Date.now()}`, trackId: `track-lead-${Date.now()}`, instrument: 'synth_lead', name: 'Lead Melodía', color: '#8b5cf6', startBeat: 2, durationBeats: 2, pitch: 4 },
            ],
          },
        ],
      };

      set((state) => {
        const updated = [newProject, ...state.projects];
        saveProjects(updated);
        return { projects: updated, activeProjectId: newId };
      });

      engine.setBpm(newProject.bpm);
      engine.setTotalBeats(newProject.totalBeats);
      engine.setTracks(newProject.tracks);

      return newId;
    },

    updateActiveProject: (updates) => {
      set((state) => {
        const updated = state.projects.map((p) => {
          if (p.id === state.activeProjectId) {
            const mod = { ...p, ...updates, updatedAt: Date.now() };
            if (updates.bpm !== undefined) engine.setBpm(updates.bpm);
            if (updates.totalBeats !== undefined) engine.setTotalBeats(updates.totalBeats);
            if (updates.tracks !== undefined) engine.setTracks(updates.tracks);
            return mod;
          }
          return p;
        });
        saveProjects(updated);
        return { projects: updated };
      });
    },

    deleteProject: (id) => {
      get().stop();
      set((state) => {
        const filtered = state.projects.filter((p) => p.id !== id);
        const fallback = filtered.length > 0 ? filtered : [DEFAULT_INITIAL_PROJECT];
        const nextActiveId = state.activeProjectId === id ? fallback[0].id : state.activeProjectId;
        saveProjects(fallback);
        return { projects: fallback, activeProjectId: nextActiveId };
      });
    },

    duplicateProject: (id) => {
      const { projects } = get();
      const target = projects.find((p) => p.id === id);
      if (!target) return id;

      const newId = `proj-${Date.now()}`;
      const duplicated: TimelineProject = {
        ...JSON.parse(JSON.stringify(target)),
        id: newId,
        name: `${target.name} (Copia)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => {
        const updated = [duplicated, ...state.projects];
        saveProjects(updated);
        return { projects: updated, activeProjectId: newId };
      });

      return newId;
    },

    addTrack: (name, instrument) => {
      const colorMap: Record<InstrumentType, string> = {
        kick: '#6366f1',
        snare: '#f43f5e',
        hihat: '#06b6d4',
        bass: '#eab308',
        synth_lead: '#8b5cf6',
        ambient_pad: '#10b981',
        chords: '#3b82f6',
        fx_riser: '#ec4899',
      };

      const newTrack: TimelineTrack = {
        id: `track-${Date.now()}`,
        name: name.trim() || instrument.toUpperCase(),
        instrument,
        color: colorMap[instrument] || '#6366f1',
        isMuted: false,
        isSolo: false,
        volume: 0.8,
        blocks: [],
      };

      const current = get().getActiveProject();
      const updatedTracks = [...current.tracks, newTrack];
      get().updateActiveProject({ tracks: updatedTracks });
    },

    deleteTrack: (trackId) => {
      const current = get().getActiveProject();
      const updatedTracks = current.tracks.filter((t) => t.id !== trackId);
      get().updateActiveProject({ tracks: updatedTracks });
    },

    toggleTrackMute: (trackId) => {
      const current = get().getActiveProject();
      const updatedTracks = current.tracks.map((t) =>
        t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
      );
      get().updateActiveProject({ tracks: updatedTracks });
    },

    toggleTrackSolo: (trackId) => {
      const current = get().getActiveProject();
      const updatedTracks = current.tracks.map((t) =>
        t.id === trackId ? { ...t, isSolo: !t.isSolo } : t
      );
      get().updateActiveProject({ tracks: updatedTracks });
    },

    setTrackVolume: (trackId, volume) => {
      const current = get().getActiveProject();
      const updatedTracks = current.tracks.map((t) =>
        t.id === trackId ? { ...t, volume } : t
      );
      get().updateActiveProject({ tracks: updatedTracks });
    },

    addBlock: (trackId, startBeat, durationBeats, name, pitch = 0) => {
      const current = get().getActiveProject();
      const targetTrack = current.tracks.find((t) => t.id === trackId);
      if (!targetTrack) return;

      const newBlock: TimelineBlock = {
        id: `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        trackId,
        instrument: targetTrack.instrument,
        name: name || targetTrack.name,
        color: targetTrack.color,
        startBeat: Math.max(0, startBeat),
        durationBeats: Math.max(1, durationBeats),
        pitch,
        volume: 1,
      };

      const updatedTracks = current.tracks.map((t) => {
        if (t.id === trackId) {
          return { ...t, blocks: [...t.blocks, newBlock] };
        }
        return t;
      });

      get().updateActiveProject({ tracks: updatedTracks });
      set({ selectedBlockId: newBlock.id });
    },

    updateBlock: (blockId, updates) => {
      const current = get().getActiveProject();
      const updatedTracks = current.tracks.map((t) => ({
        ...t,
        blocks: t.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
      }));
      get().updateActiveProject({ tracks: updatedTracks });
    },

    moveBlock: (blockId, newStartBeat, newTrackId) => {
      const current = get().getActiveProject();
      let movingBlock: TimelineBlock | null = null;

      // Find and remove block
      current.tracks.forEach((t) => {
        const found = t.blocks.find((b) => b.id === blockId);
        if (found) movingBlock = { ...found };
      });

      if (!movingBlock) return;

      const destTrackId = newTrackId || (movingBlock as TimelineBlock).trackId;
      const targetTrack = current.tracks.find((t) => t.id === destTrackId);
      if (!targetTrack) return;

      const updatedBlock: TimelineBlock = {
        ...(movingBlock as TimelineBlock),
        trackId: destTrackId,
        instrument: targetTrack.instrument,
        color: targetTrack.color,
        startBeat: Math.max(0, newStartBeat),
      };

      const updatedTracks = current.tracks.map((t) => {
        // Remove from old
        const filtered = t.blocks.filter((b) => b.id === blockId);
        if (t.id === destTrackId) {
          return { ...t, blocks: [...filtered, updatedBlock] };
        }
        return { ...t, blocks: filtered };
      });

      get().updateActiveProject({ tracks: updatedTracks });
    },

    resizeBlock: (blockId, newDuration) => {
      get().updateBlock(blockId, { durationBeats: Math.max(1, newDuration) });
    },

    deleteBlock: (blockId) => {
      const current = get().getActiveProject();
      const updatedTracks = current.tracks.map((t) => ({
        ...t,
        blocks: t.blocks.filter((b) => b.id !== blockId),
      }));
      get().updateActiveProject({ tracks: updatedTracks });
      if (get().selectedBlockId === blockId) {
        set({ selectedBlockId: null });
      }
    },

    setSelectedBlockId: (id) => {
      set({ selectedBlockId: id });
    },

    initAudio: () => {
      const current = get().getActiveProject();
      engine.init();
      engine.setBpm(current.bpm);
      engine.setTotalBeats(current.totalBeats);
      engine.setTracks(current.tracks);
      engine.setLoop(get().loop);
      engine.setOnBeatUpdate((beat) => {
        set({ currentBeat: beat });
      });
    },

    setBpm: (bpm) => {
      const clamped = Math.max(40, Math.min(240, bpm));
      engine.setBpm(clamped);
      get().updateActiveProject({ bpm: clamped });
    },

    setTotalBeats: (beats) => {
      const clamped = Math.max(4, beats);
      engine.setTotalBeats(clamped);
      get().updateActiveProject({ totalBeats: clamped });
    },

    togglePlay: () => {
      const { isPlaying, currentBeat } = get();
      get().initAudio();

      if (isPlaying) {
        engine.pause();
        set({ isPlaying: false });
      } else {
        engine.play(currentBeat);
        set({ isPlaying: true });
      }
    },

    stop: () => {
      engine.stop();
      set({ isPlaying: false, currentBeat: 0 });
    },

    seek: (beat) => {
      engine.seek(beat);
      set({ currentBeat: beat });
    },

    setLoop: (loop) => {
      engine.setLoop(loop);
      set({ loop });
    },

    previewSound: (instrument, pitch = 0) => {
      engine.previewInstrument(instrument, pitch);
    },
  };
});
