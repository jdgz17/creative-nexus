import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Shuffle, Star, RefreshCw, Music, Tv, Lock, Unlock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpinWheel, WheelSegment } from '../../components/SpinWheel';
import { ANIME_LIST, AnimeItem } from '../../data/animeData';
import { MUSICIANS_LIST, MusicianItem } from '../../data/musicianData';

// ── Image URLs fetched from real APIs ─────────────────────────────────────
async function fetchAnimeImage(malId: number, fallback: string): Promise<string> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
    if (!res.ok) return fallback;
    const json = await res.json();
    return json?.data?.images?.jpg?.large_image_url ?? fallback;
  } catch {
    return fallback;
  }
}

async function fetchWikiImage(wikiTitle: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`,
    );
    if (!res.ok) return fallback;
    const json = await res.json();
    const url: string | undefined = json?.thumbnail?.source;
    if (!url) return fallback;
    // Upgrade to larger thumbnail (replace /NNpx- with /400px-)
    return url.replace(/\/\d+px-/, '/400px-');
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const IdeaGeneratorView: React.FC = () => {
  // Real image URLs, start with MAL CDN / Wikimedia fallbacks
  const [animeImages, setAnimeImages] = useState<Record<string, string>>(
    Object.fromEntries(ANIME_LIST.map((a) => [a.id, a.coverUrl])),
  );
  const [musicImages, setMusicImages] = useState<Record<string, string>>(
    Object.fromEntries(MUSICIANS_LIST.map((m) => [m.id, m.photoUrl])),
  );
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Fetch real images once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Fetch anime from Jikan (rate-limited: 3 req/s)
      for (const anime of ANIME_LIST) {
        if (cancelled) break;
        const url = await fetchAnimeImage(anime.malId, anime.coverUrl);
        if (!cancelled) setAnimeImages((prev) => ({ ...prev, [anime.id]: url }));
        await new Promise((r) => setTimeout(r, 340)); // ~3 req/sec
      }

      // Fetch musician photos from Wikipedia REST API (generous rate limit)
      await Promise.all(
        MUSICIANS_LIST.map(async (m) => {
          const url = await fetchWikiImage(m.wikiTitle, m.photoUrl);
          if (!cancelled) setMusicImages((prev) => ({ ...prev, [m.id]: url }));
        }),
      );

      if (!cancelled) setImagesLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Spin state ───────────────────────────────────────────────────────────
  const [animeIndex, setAnimeIndex] = useState(0);
  const [musicIndex, setMusicIndex] = useState(0);
  const [animeSpinning, setAnimeSpinning] = useState(false);
  const [musicSpinning, setMusicSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [isLockAnime, setIsLockAnime] = useState(false);
  const [isLockMusic, setIsLockMusic] = useState(false);

  // Next planned indices (picked at spin time, shown instantly in result card)
  const nextAnimeRef = useRef(0);
  const nextMusicRef = useRef(0);

  // History
  const [history, setHistory] = useState<{ anime: AnimeItem; musician: MusicianItem; id: string }[]>([]);

  const isSpinning = animeSpinning || musicSpinning;

  const handleSpin = () => {
    if (isSpinning) return;

    const newAnimeIdx = isLockAnime
      ? animeIndex
      : Math.floor(Math.random() * ANIME_LIST.length);
    const newMusicIdx = isLockMusic
      ? musicIndex
      : Math.floor(Math.random() * MUSICIANS_LIST.length);

    nextAnimeRef.current = newAnimeIdx;
    nextMusicRef.current = newMusicIdx;

    // Update visible result immediately
    setAnimeIndex(newAnimeIdx);
    setMusicIndex(newMusicIdx);
    setHasSpun(true);

    // Save to history
    const anime = ANIME_LIST[newAnimeIdx];
    const musician = MUSICIANS_LIST[newMusicIdx];
    setHistory((prev) => [{ anime, musician, id: `h-${Date.now()}` }, ...prev.slice(0, 7)]);

    // Confetti
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
        colors: [anime.color, musician.color, '#fff', '#6366f1'],
      });
    }, 200);

    // Start wheel animations
    if (!isLockAnime) setAnimeSpinning(true);
    if (!isLockMusic) setMusicSpinning(true);
  };

  const handleAnimeComplete = useCallback(() => {
    setAnimeSpinning(false);
  }, []);

  const handleMusicComplete = useCallback(() => {
    setMusicSpinning(false);
  }, []);

  // ── Segments (memoised so wheel doesn't re-create them every render) ─────
  const animeSegments: WheelSegment[] = useMemo(
    () =>
      ANIME_LIST.map((a) => ({
        id: a.id,
        label: a.title.split(':')[0].split('(')[0].trim(),
        imageUrl: animeImages[a.id] ?? a.coverUrl,
        color: a.color,
      })),
    [animeImages],
  );

  const musicSegments: WheelSegment[] = useMemo(
    () =>
      MUSICIANS_LIST.map((m) => ({
        id: m.id,
        label: m.name.split(' ')[0],
        imageUrl: musicImages[m.id] ?? m.photoUrl,
        color: m.color,
      })),
    [musicImages],
  );

  const animeResult = ANIME_LIST[animeIndex];
  const musicResult = MUSICIANS_LIST[musicIndex];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center pb-16 px-4 pt-6 gap-8">

      {/* Header */}
      <div className="text-center space-y-2 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          🎰 Gira las Ruletas
        </h1>
        <p className="text-sm text-slate-400">
          Anime <span className="text-slate-600">×</span> Músico — ¿qué combinación creativa saldrá?
        </p>
        {!imagesLoaded && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Cargando imágenes reales…
          </div>
        )}
      </div>

      {/* ── Wheels ── */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-14 w-full max-w-5xl">

        {/* Anime Wheel */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Tv className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-300">Anime</span>
            <button
              onClick={() => setIsLockAnime((v) => !v)}
              className={`ml-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                isLockAnime
                  ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {isLockAnime ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isLockAnime ? 'Fijado' : 'Libre'}
            </button>
          </div>

          <SpinWheel
            segments={animeSegments}
            targetIndex={animeIndex}
            isSpinning={animeSpinning}
            onSpinComplete={handleAnimeComplete}
            size={360}
          />
        </div>

        {/* VS */}
        <div className="hidden lg:flex flex-col items-center gap-3 text-slate-700 font-black text-lg">
          <div className="h-20 w-px bg-slate-800" />
          <span>VS</span>
          <div className="h-20 w-px bg-slate-800" />
        </div>
        <div className="flex lg:hidden items-center gap-4 text-slate-600 text-xs font-bold">
          <div className="h-px w-16 bg-slate-800" />VS
          <div className="h-px w-16 bg-slate-800" />
        </div>

        {/* Music Wheel */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-rose-300">Músico / Artista</span>
            <button
              onClick={() => setIsLockMusic((v) => !v)}
              className={`ml-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                isLockMusic
                  ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {isLockMusic ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              {isLockMusic ? 'Fijado' : 'Libre'}
            </button>
          </div>

          <SpinWheel
            segments={musicSegments}
            targetIndex={musicIndex}
            isSpinning={musicSpinning}
            onSpinComplete={handleMusicComplete}
            size={360}
          />
        </div>
      </div>

      {/* ── Spin Button ── */}
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
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Girando…
          </>
        ) : (
          <>
            <Shuffle className="w-6 h-6" />
            {hasSpun ? '¡Girar de nuevo!' : '¡Girar las dos ruletas!'}
          </>
        )}
      </button>

      {/* ── Result Card (shown immediately on spin) ── */}
      {hasSpun && (
        <div
          key={`${animeIndex}-${musicIndex}`}
          className="w-full max-w-2xl rounded-3xl border p-6 space-y-4 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${animeResult.color}18 0%, #0f172a 55%, ${musicResult.color}18 100%)`,
            borderColor: `${animeResult.color}55`,
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Star className="w-4 h-4 text-amber-400" />
            Combinación Creativa del Turno
            {isSpinning && (
              <span className="ml-auto text-indigo-400 animate-pulse">Ruletas girando…</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Anime */}
            <div className="flex items-center gap-3">
              <img
                src={animeImages[animeResult.id]}
                alt={animeResult.title}
                className="w-20 h-24 rounded-2xl object-cover border-2 shadow-md shrink-0"
                style={{ borderColor: animeResult.color }}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{animeResult.genre}</div>
                <div className="text-base font-black text-white leading-tight">{animeResult.title}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{animeResult.iconicSongOrStyle}</div>
              </div>
            </div>

            {/* Musician */}
            <div className="flex items-center gap-3">
              <img
                src={musicImages[musicResult.id]}
                alt={musicResult.name}
                className="w-20 h-24 rounded-2xl object-cover object-top border-2 shadow-md shrink-0"
                style={{ borderColor: musicResult.color }}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{musicResult.genre}</div>
                <div className="text-base font-black text-white leading-tight">{musicResult.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{musicResult.iconicWork}</div>
              </div>
            </div>
          </div>

          {/* Creative Prompt */}
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
        <div className="w-full max-w-2xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
            Anteriores
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {history.slice(1).map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex -space-x-2 shrink-0">
                  <img src={animeImages[h.anime.id] ?? h.anime.coverUrl} className="w-8 h-8 rounded-lg object-cover border-2 border-slate-900" alt="" />
                  <img src={musicImages[h.musician.id] ?? h.musician.photoUrl} className="w-8 h-8 rounded-lg object-cover object-top border-2 border-slate-900" alt="" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {h.anime.title} × {h.musician.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
