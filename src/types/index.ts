export type MediaType = 'pelicula' | 'serie' | 'animacion' | 'videojuego';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  year: number;
  genre: string;
  posterUrl: string;
  tagline: string;
  synopsis: string;
}

export type CharacterCategory = 'actor' | 'personaje_ficcion' | 'icono_pop' | 'historico';

export interface CharacterItem {
  id: string;
  name: string;
  category: CharacterCategory;
  famousFor: string;
  photoUrl: string;
  roleOrPersonality: string;
  quirk?: string;
}

export interface IdeaPair {
  id: string;
  media: MediaItem;
  character: CharacterItem;
  creativePrompt: string;
  createdAt: number;
}

// Timeline Studio Types
export type InstrumentType = 
  | 'kick' 
  | 'snare' 
  | 'hihat' 
  | 'bass' 
  | 'synth_lead' 
  | 'ambient_pad' 
  | 'chords' 
  | 'fx_riser';

export interface TimelineBlock {
  id: string;
  trackId: string;
  instrument: InstrumentType;
  name: string;
  color: string;
  startBeat: number;       // Posición de inicio en compases/beats (0, 1, 2...)
  durationBeats: number;   // Duración en beats (ej. 1 beat, 2 beats, 4 beats = 1 compás, etc.)
  pitch?: number;          // Semitonos (-12 a +12)
  volume?: number;         // 0 a 1
}

export interface TimelineTrack {
  id: string;
  name: string;
  instrument: InstrumentType;
  color: string;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
  blocks: TimelineBlock[];
}

export interface TimelineProject {
  id: string;
  name: string;
  description?: string;
  bpm: number;
  totalBeats: number;      // Total de beats de la pista (ej. 16, 32, 64)
  tracks: TimelineTrack[];
  createdAt: number;
  updatedAt: number;
}
