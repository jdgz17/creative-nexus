import { create } from 'zustand';
import { MediaItem, CharacterItem, IdeaPair } from '../types';
import { AUDIOVISUAL_MEDIA_LIST } from '../data/audiovisualData';
import { CHARACTERS_LIST } from '../data/characterData';

interface IdeaGeneratorState {
  currentMedia: MediaItem;
  currentCharacter: CharacterItem;
  isMediaLocked: boolean;
  isCharacterLocked: boolean;
  isGenerating: boolean;
  history: IdeaPair[];

  // Actions
  generateRandom: () => void;
  toggleMediaLock: () => void;
  toggleCharacterLock: () => void;
  setMedia: (media: MediaItem) => void;
  setCharacter: (character: CharacterItem) => void;
  restoreFromHistory: (pair: IdeaPair) => void;
  clearHistory: () => void;
}

const STORAGE_KEY = 'creative_nexus_ideas_history';

const loadHistory = (): IdeaPair[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return [];
};

const saveHistory = (history: IdeaPair[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
  } catch {
    // fallback
  }
};

const PROMPT_CHALLENGES = [
  '¿Cómo cambiaría la historia si {character} fuera el protagonista principal en {media}?',
  'Imagina una secuela o spin-off donde {character} debe resolver el conflicto central de {media}.',
  '¿Qué papel o antagonista jugaría {character} si entrara por sorpresa en el mundo de {media}?',
  '¿Qué habilidades o giros inesperados aportaría {character} a la trama de {media}?',
];

const getRandom = <T,>(arr: T[], current?: T): T => {
  if (arr.length <= 1) return arr[0];
  let picked = arr[Math.floor(Math.random() * arr.length)];
  while (current && picked === current) {
    picked = arr[Math.floor(Math.random() * arr.length)];
  }
  return picked;
};

export const useIdeaGeneratorStore = create<IdeaGeneratorState>((set, get) => {
  const initialMedia = AUDIOVISUAL_MEDIA_LIST[0];
  const initialCharacter = CHARACTERS_LIST[0];

  return {
    currentMedia: initialMedia,
    currentCharacter: initialCharacter,
    isMediaLocked: false,
    isCharacterLocked: false,
    isGenerating: false,
    history: loadHistory(),

    generateRandom: () => {
      const { currentMedia, currentCharacter, isMediaLocked, isCharacterLocked, history } = get();
      
      set({ isGenerating: true });

      setTimeout(() => {
        const nextMedia = isMediaLocked ? currentMedia : getRandom(AUDIOVISUAL_MEDIA_LIST, currentMedia);
        const nextCharacter = isCharacterLocked ? currentCharacter : getRandom(CHARACTERS_LIST, currentCharacter);

        const template = getRandom(PROMPT_CHALLENGES);
        const creativePrompt = template
          .replace('{character}', nextCharacter.name)
          .replace('{media}', nextMedia.title);

        const newPair: IdeaPair = {
          id: `idea-${Date.now()}`,
          media: nextMedia,
          character: nextCharacter,
          creativePrompt,
          createdAt: Date.now(),
        };

        const updatedHistory = [newPair, ...history.filter(h => !(h.media.id === nextMedia.id && h.character.id === nextCharacter.id))];
        saveHistory(updatedHistory);

        set({
          currentMedia: nextMedia,
          currentCharacter: nextCharacter,
          isGenerating: false,
          history: updatedHistory,
        });
      }, 250);
    },

    toggleMediaLock: () => {
      set((state) => ({ isMediaLocked: !state.isMediaLocked }));
    },

    toggleCharacterLock: () => {
      set((state) => ({ isCharacterLocked: !state.isCharacterLocked }));
    },

    setMedia: (media) => {
      set({ currentMedia: media });
    },

    setCharacter: (character) => {
      set({ currentCharacter: character });
    },

    restoreFromHistory: (pair) => {
      set({
        currentMedia: pair.media,
        currentCharacter: pair.character,
      });
    },

    clearHistory: () => {
      saveHistory([]);
      set({ history: [] });
    },
  };
});
