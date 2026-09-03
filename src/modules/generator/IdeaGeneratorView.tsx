import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Shuffle, Star, RefreshCw, Music, Tv, Lock, Unlock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpinWheel, WheelSegment } from '../../components/SpinWheel';

// ─── Data (served locally from public/images/) ────────────────────────────────

interface AnimeItem {
  id: string;
  title: string;
  genre: string;
  iconicSongOrStyle: string;
  color: string;
  imageUrl: string;
}

interface MusicianItem {
  id: string;
  name: string;
  genre: string;
  iconicWork: string;
  color: string;
  imageUrl: string;
}

const BASE = import.meta.env.BASE_URL as string;

const ANIME_LIST: AnimeItem[] = [
  { id: 'demon-slayer',      title: 'Demon Slayer',           genre: 'Acción / Shonen',          iconicSongOrStyle: 'Gurenge · Kamado Tanjiro no Uta',      color: '#ef4444', imageUrl: `${BASE}images/anime/demon-slayer.jpg`      },
  { id: 'jujutsu-kaisen',    title: 'Jujutsu Kaisen',         genre: 'Sobrenatural / Acción',     iconicSongOrStyle: 'Kaikai Kitan · Specialz',               color: '#3b82f6', imageUrl: `${BASE}images/anime/jujutsu-kaisen.jpg`    },
  { id: 'attack-on-titan',   title: 'Attack on Titan',        genre: 'Fantasía Oscura / Bélico',  iconicSongOrStyle: 'Guren no Yumiya · The Rumbling',        color: '#92400e', imageUrl: `${BASE}images/anime/attack-on-titan.jpg`   },
  { id: 'one-piece',         title: 'One Piece',              genre: 'Aventura / Piratas',        iconicSongOrStyle: 'We Are! · Overtaken',                   color: '#f59e0b', imageUrl: `${BASE}images/anime/one-piece.jpg`         },
  { id: 'solo-leveling',     title: 'Solo Leveling',          genre: 'Acción / Fantasía Oscura',  iconicSongOrStyle: 'LEveL · Dark Choirs',                   color: '#7c3aed', imageUrl: `${BASE}images/anime/solo-leveling.jpg`     },
  { id: 'naruto-shippuden',  title: 'Naruto Shippuden',       genre: 'Ninja / Aventura',          iconicSongOrStyle: 'Blue Bird · Silhouette',                color: '#ea580c', imageUrl: `${BASE}images/anime/naruto-shippuden.png`  },
  { id: 'chainsaw-man',      title: 'Chainsaw Man',           genre: 'Acción Caótica / Gore',     iconicSongOrStyle: 'Kick Back',                             color: '#dc2626', imageUrl: `${BASE}images/anime/chainsaw-man.png`      },
  { id: 'death-note',        title: 'Death Note',             genre: 'Suspense / Sobrenatural',   iconicSongOrStyle: 'The World · Alumina',                   color: '#475569', imageUrl: `${BASE}images/anime/death-note.jpg`        },
  { id: 'evangelion',        title: 'Evangelion',             genre: 'Mecha / Psicológico',       iconicSongOrStyle: 'A Cruel Angel Thesis',                  color: '#a855f7', imageUrl: `${BASE}images/anime/evangelion.jpg`        },
  { id: 'bocchi-the-rock',   title: 'Bocchi the Rock!',       genre: 'Música / Slice of Life',    iconicSongOrStyle: 'Seishun Complex',                       color: '#ec4899', imageUrl: `${BASE}images/anime/bocchi-the-rock.png`   },
  { id: 'hunter-x-hunter',   title: 'Hunter x Hunter',        genre: 'Aventura / Estrategia',     iconicSongOrStyle: 'Departure!',                            color: '#10b981', imageUrl: `${BASE}images/anime/hunter-x-hunter.png`  },
  { id: 'edgerunners',       title: 'Cyberpunk: Edgerunners', genre: 'Sci-Fi / Synthwave',        iconicSongOrStyle: 'I Really Want to Stay at Your House',   color: '#06b6d4', imageUrl: `${BASE}images/anime/edgerunners.jpg`       },
];

const MUSICIAN_LIST: MusicianItem[] = [
  { id: 'freddie-mercury',  name: 'Freddie Mercury',  genre: 'Rock / Opera Rock',          iconicWork: 'Bohemian Rhapsody',       color: '#f59e0b', imageUrl: `${BASE}images/musicians/freddie-mercury.jpg`  },
  { id: 'jimi-hendrix',     name: 'Jimi Hendrix',     genre: 'Psychedelic Rock / Blues',   iconicWork: 'Purple Haze',             color: '#8b5cf6', imageUrl: `${BASE}images/musicians/jimi-hendrix.jpg`     },
  { id: 'david-bowie',      name: 'David Bowie',      genre: 'Glam Rock / Art Pop',        iconicWork: 'Heroes / Starman',        color: '#ec4899', imageUrl: `${BASE}images/musicians/david-bowie.jpg`      },
  { id: 'billie-eilish',    name: 'Billie Eilish',    genre: 'Dark Pop / Electropop',      iconicWork: 'Bad Guy / Happier Than Ever', color: '#10b981', imageUrl: `${BASE}images/musicians/billie-eilish.jpg` },
  { id: 'kurt-cobain',      name: 'Kurt Cobain',      genre: 'Grunge / Alternative Rock',  iconicWork: 'Smells Like Teen Spirit', color: '#64748b', imageUrl: `${BASE}images/musicians/kurt-cobain.jpg`      },
  { id: 'lady-gaga',        name: 'Lady Gaga',        genre: 'Electropop / Art Pop',       iconicWork: 'Bad Romance / Shallow',   color: '#a855f7', imageUrl: `${BASE}images/musicians/lady-gaga.jpg`        },
  { id: 'michael-jackson',  name: 'Michael Jackson',  genre: 'Pop / R&B / Funk',           iconicWork: 'Thriller / Billie Jean',  color: '#eab308', imageUrl: `${BASE}images/musicians/michael-jackson.jpg`  },
  { id: 'taylor-swift',     name: 'Taylor Swift',     genre: 'Pop / Country / Indie Folk', iconicWork: 'Anti-Hero / All Too Well',color: '#06b6d4', imageUrl: `${BASE}images/musicians/taylor-swift.png`     },
  { id: 'kendrick-lamar',   name: 'Kendrick Lamar',   genre: 'Conscious Hip-Hop / Jazz',   iconicWork: 'HUMBLE. / Alright',       color: '#ef4444', imageUrl: `${BASE}images/musicians/kendrick-lamar.jpg`   },
  { id: 'the-weeknd',       name: 'The Weeknd',       genre: 'R&B Dark / Synthpop',        iconicWork: 'Blinding Lights',         color: '#dc2626', imageUrl: `${BASE}images/musicians/the-weeknd.jpg`       },
  { id: 'prince',           name: 'Prince',           genre: 'Funk / R&B / Rock',          iconicWork: 'Purple Rain / Kiss',      color: '#7e22ce', imageUrl: `${BASE}images/musicians/prince.png`           },
  { id: 'amy-winehouse',    name: 'Amy Winehouse',    genre: 'Soul / Jazz / R&B',          iconicWork: 'Rehab / Back to Black',   color: '#be123c', imageUrl: `${BASE}images/musicians/amy-winehouse.jpg`    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const IdeaGeneratorView: React.FC = () => {
  const wheelsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [animeIndex, setAnimeIndex] = useState(0);
  const [musicIndex, setMusicIndex] = useState(0);
  const [animeSpinning, setAnimeSpinning] = useState(false);
  const [musicSpinning, setMusicSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isLockAnime, setIsLockAnime] = useState(false);
  const [isLockMusic, setIsLockMusic] = useState(false);
  const [history, setHistory] = useState<{ anime: AnimeItem; musician: MusicianItem; id: string }[]>([]);

  const pendingSpinsRef = useRef(0);
  const resultIdxRef = useRef({ anime: 0, music: 0 });
  const isSpinning = animeSpinning || musicSpinning;

  const triggerResult = useCallback(() => {
    const aIdx = resultIdxRef.current.anime;
    const mIdx = resultIdxRef.current.music;
    const anime = ANIME_LIST[aIdx];
    const musician = MUSICIAN_LIST[mIdx];

    setTimeout(() => {
      confetti({ particleCount: 90, spread: 110, origin: { y: 0.6 }, colors: [anime.color, musician.color, '#fff', '#6366f1'] });
      setShowResult(true);
      setHistory(prev => [{ anime, musician, id: `h-${Date.now()}` }, ...prev.slice(0, 7)]);

      // Scroll to result after 2s
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 2000);
    }, 300);
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;

    const newAnimeIdx = isLockAnime ? animeIndex : Math.floor(Math.random() * ANIME_LIST.length);
    const newMusicIdx = isLockMusic ? musicIndex : Math.floor(Math.random() * MUSICIAN_LIST.length);

    setAnimeIndex(newAnimeIdx);
    setMusicIndex(newMusicIdx);
    setShowResult(false);
    resultIdxRef.current = { anime: newAnimeIdx, music: newMusicIdx };

    // Scroll to wheels immediately
    wheelsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    let spins = 0;
    if (!isLockAnime) { spins++; setAnimeSpinning(true); }
    if (!isLockMusic) { spins++; setMusicSpinning(true); }
    pendingSpinsRef.current = spins;

    if (spins === 0) triggerResult();
  };

  const handleAnimeComplete = useCallback(() => {
    setAnimeSpinning(false);
    pendingSpinsRef.current -= 1;
    if (pendingSpinsRef.current <= 0) triggerResult();
  }, [triggerResult]);

  const handleMusicComplete = useCallback(() => {
    setMusicSpinning(false);
    pendingSpinsRef.current -= 1;
    if (pendingSpinsRef.current <= 0) triggerResult();
  }, [triggerResult]);

  const animeSegments: WheelSegment[] = useMemo(
    () => ANIME_LIST.map(a => ({ id: a.id, label: a.title.split(':')[0].split('(')[0].trim(), imageUrl: a.imageUrl, color: a.color })),
    []
  );
  const musicSegments: WheelSegment[] = useMemo(
    () => MUSICIAN_LIST.map(m => ({ id: m.id, label: m.name.split(' ')[0], imageUrl: m.imageUrl, color: m.color })),
    []
  );

  const animeResult = ANIME_LIST[animeIndex];
  const musicResult = MUSICIAN_LIST[musicIndex];

  return (
    <div className="min-h-screen flex flex-col items-center pb-16 px-4 pt-6 gap-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Anime <span className="text-slate-500">×</span> Músico
        </h1>
        <p className="text-xl font-semibold text-slate-400">
          🎰 Gira las ruletas y descubre qué combinación creativa saldrá.
        </p>
      </div>

      {/* ── Wheels ── */}
      <div ref={wheelsRef} className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full max-w-6xl mt-4 scroll-mt-20">
        {/* Anime Wheel */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Tv className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-300">Anime</span>
            <button
              onClick={() => setIsLockAnime(v => !v)}
              className={`ml-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                isLockAnime ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {isLockAnime ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isLockAnime ? 'Fijado' : 'Libre'}
            </button>
          </div>

          <SpinWheel segments={animeSegments} targetIndex={animeIndex} isSpinning={animeSpinning} onSpinComplete={handleAnimeComplete} size={576} />

          <div className="mt-4 h-8 flex items-center justify-center">
            {showResult && (
              <span className="px-4 py-1.5 rounded-full bg-slate-900 border text-sm font-bold" style={{ borderColor: `${animeResult.color}50`, color: animeResult.color }}>
                {animeResult.title}
              </span>
            )}
          </div>
        </div>

        {/* + separator */}
        <div className="hidden lg:flex flex-col items-center gap-3 text-slate-600 font-black text-4xl">
          <div className="h-32 w-px bg-slate-800" />
          <span>+</span>
          <div className="h-32 w-px bg-slate-800" />
        </div>
        <div className="flex lg:hidden items-center gap-4 text-slate-600 text-2xl font-black">
          <div className="h-px w-16 bg-slate-800" />+<div className="h-px w-16 bg-slate-800" />
        </div>

        {/* Music Wheel */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-rose-300">Músico / Artista</span>
            <button
              onClick={() => setIsLockMusic(v => !v)}
              className={`ml-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                isLockMusic ? 'bg-rose-600/30 border-rose-400 text-rose-200' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {isLockMusic ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isLockMusic ? 'Fijado' : 'Libre'}
            </button>
          </div>

          <SpinWheel segments={musicSegments} targetIndex={musicIndex} isSpinning={musicSpinning} onSpinComplete={handleMusicComplete} size={576} />

          <div className="mt-4 h-8 flex items-center justify-center">
            {showResult && (
              <span className="px-4 py-1.5 rounded-full bg-slate-900 border text-sm font-bold" style={{ borderColor: `${musicResult.color}50`, color: musicResult.color }}>
                {musicResult.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Spin Button ── */}
      <div className="mt-6">
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg text-white shadow-2xl transition-all select-none ${
            isSpinning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:brightness-110 hover:scale-105 active:scale-95 shadow-indigo-500/30'
          }`}
        >
          {isSpinning ? (
            <><RefreshCw className="w-5 h-5 animate-spin" />Girando…</>
          ) : (
            <><Shuffle className="w-6 h-6" />{history.length > 0 ? '¡Girar de nuevo!' : '¡Girar las dos ruletas!'}</>
          )}
        </button>
      </div>

      {/* ── Result Card ── */}
      {showResult && (
        <div
          ref={resultRef}
          className="w-full max-w-2xl rounded-3xl border p-6 space-y-4 shadow-2xl mt-6 scroll-mt-20"
          style={{
            background: `linear-gradient(135deg, ${animeResult.color}18 0%, #0f172a 55%, ${musicResult.color}18 100%)`,
            borderColor: `${animeResult.color}55`,
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Star className="w-4 h-4 text-amber-400" />
            Combinación Creativa del Turno
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <img src={animeResult.imageUrl} alt={animeResult.title} className="w-20 h-24 rounded-2xl object-cover border-2 shadow-md shrink-0" style={{ borderColor: animeResult.color }} />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{animeResult.genre}</div>
                <div className="text-base font-black text-white leading-tight">{animeResult.title}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{animeResult.iconicSongOrStyle}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <img src={musicResult.imageUrl} alt={musicResult.name} className="w-20 h-24 rounded-2xl object-cover object-top border-2 shadow-md shrink-0" style={{ borderColor: musicResult.color }} />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{musicResult.genre}</div>
                <div className="text-base font-black text-white leading-tight">{musicResult.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{musicResult.iconicWork}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-bold uppercase text-indigo-400 mb-1.5">💡 Reto Creativo</div>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              ¿Cómo sonaría el opening de{' '}
              <span className="font-bold" style={{ color: animeResult.color }}>{animeResult.title}</span>{' '}
              si lo compusiera y cantara{' '}
              <span className="font-bold" style={{ color: musicResult.color }}>{musicResult.name}</span>{' '}
              con su estilo musical característico de {musicResult.genre.split('/')[0].trim()}?
            </p>
          </div>
        </div>
      )}

      {/* ── History ── */}
      {history.length > 1 && (
        <div className="w-full max-w-2xl space-y-3 mt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">Anteriores</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {history.slice(1).map(h => (
              <div key={h.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex -space-x-2 shrink-0">
                  <img src={h.anime.imageUrl} className="w-8 h-8 rounded-lg object-cover border-2 border-slate-900" alt="" />
                  <img src={h.musician.imageUrl} className="w-8 h-8 rounded-lg object-cover object-top border-2 border-slate-900" alt="" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{h.anime.title} × {h.musician.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
