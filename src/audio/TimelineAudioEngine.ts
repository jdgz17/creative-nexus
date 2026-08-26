import { InstrumentType, TimelineTrack, TimelineBlock } from '../types';

export class TimelineAudioEngine {
  private static instance: TimelineAudioEngine | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private isPlaying: boolean = false;
  private bpm: number = 120;
  private totalBeats: number = 16;
  private tracks: TimelineTrack[] = [];
  private loop: boolean = true;

  private currentBeat: number = 0;
  private startTime: number = 0;
  private startBeatOffset: number = 0;
  private animationFrameId: number | null = null;
  private scheduledBlockIds: Set<string> = new Set();

  private onBeatUpdate?: (beat: number) => void;

  private constructor() {}

  public static getInstance(): TimelineAudioEngine {
    if (!TimelineAudioEngine.instance) {
      TimelineAudioEngine.instance = new TimelineAudioEngine();
    }
    return TimelineAudioEngine.instance;
  }

  public init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setBpm(bpm: number): void {
    this.bpm = Math.max(40, Math.min(240, bpm));
  }

  public setTotalBeats(beats: number): void {
    this.totalBeats = Math.max(4, beats);
  }

  public setLoop(loop: boolean): void {
    this.loop = loop;
  }

  public setTracks(tracks: TimelineTrack[]): void {
    this.tracks = tracks;
  }

  public setOnBeatUpdate(cb: (beat: number) => void): void {
    this.onBeatUpdate = cb;
  }

  public play(fromBeat?: number): void {
    this.init();
    if (!this.ctx) return;

    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startBeatOffset = fromBeat !== undefined ? fromBeat : this.currentBeat;
    if (this.startBeatOffset >= this.totalBeats) {
      this.startBeatOffset = 0;
    }
    this.startTime = this.ctx.currentTime;
    this.scheduledBlockIds.clear();

    this.loopPlayback();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public stop(): void {
    this.pause();
    this.currentBeat = 0;
    this.startBeatOffset = 0;
    this.scheduledBlockIds.clear();
    if (this.onBeatUpdate) {
      this.onBeatUpdate(0);
    }
  }

  public seek(beat: number): void {
    const clamped = Math.max(0, Math.min(this.totalBeats, beat));
    this.currentBeat = clamped;
    this.startBeatOffset = clamped;
    if (this.ctx) {
      this.startTime = this.ctx.currentTime;
    }
    this.scheduledBlockIds.clear();
    if (this.onBeatUpdate) {
      this.onBeatUpdate(clamped);
    }
  }

  private loopPlayback = (): void => {
    if (!this.isPlaying || !this.ctx) return;

    const secondsPerBeat = 60.0 / this.bpm;
    const elapsedSeconds = this.ctx.currentTime - this.startTime;
    const elapsedBeats = elapsedSeconds / secondsPerBeat;
    
    let rawBeat = this.startBeatOffset + elapsedBeats;

    if (rawBeat >= this.totalBeats) {
      if (this.loop) {
        this.startTime = this.ctx.currentTime;
        this.startBeatOffset = 0;
        rawBeat = 0;
        this.scheduledBlockIds.clear();
      } else {
        this.stop();
        return;
      }
    }

    this.currentBeat = rawBeat;
    if (this.onBeatUpdate) {
      this.onBeatUpdate(rawBeat);
    }

    // Schedule blocks slightly ahead of current time
    const lookaheadBeats = 0.5; // ~250ms ahead
    const scheduleWindowStart = rawBeat;
    const scheduleWindowEnd = rawBeat + lookaheadBeats;

    const hasSolo = this.tracks.some((t) => t.isSolo);

    this.tracks.forEach((track) => {
      if (track.isMuted) return;
      if (hasSolo && !track.isSolo) return;

      track.blocks.forEach((block) => {
        // Unique key for this loop iteration
        const loopIteration = Math.floor(rawBeat / this.totalBeats);
        const blockEventId = `${block.id}-${loopIteration}-${Math.floor(block.startBeat)}`;

        if (
          block.startBeat >= scheduleWindowStart &&
          block.startBeat < scheduleWindowEnd &&
          !this.scheduledBlockIds.has(blockEventId)
        ) {
          this.scheduledBlockIds.add(blockEventId);
          const beatDiff = block.startBeat - rawBeat;
          const scheduleTime = this.ctx!.currentTime + beatDiff * secondsPerBeat;
          const durationSeconds = block.durationBeats * secondsPerBeat;

          this.triggerSound(
            block.instrument,
            scheduleTime,
            (block.volume ?? 1) * track.volume,
            block.pitch ?? 0,
            durationSeconds
          );
        }
      });
    });

    this.animationFrameId = requestAnimationFrame(this.loopPlayback);
  };

  public previewInstrument(instrument: InstrumentType, pitch: number = 0): void {
    this.init();
    if (this.ctx) {
      this.triggerSound(instrument, this.ctx.currentTime, 0.8, pitch, 0.4);
    }
  }

  public triggerSound(
    instrument: InstrumentType,
    time: number,
    volume: number = 0.8,
    pitch: number = 0,
    duration: number = 0.4
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const pitchRatio = Math.pow(2, pitch / 12);
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), time);
    gainNode.connect(this.masterGain);

    switch (instrument) {
      case 'kick': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 * pitchRatio, time);
        osc.frequency.exponentialRampToValueAtTime(32 * pitchRatio, time + 0.12);

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(1.0, time);
        env.gain.exponentialRampToValueAtTime(0.001, time + Math.min(0.35, duration));

        osc.connect(env);
        env.connect(gainNode);

        osc.start(time);
        osc.stop(time + Math.min(0.36, duration));
        break;
      }

      case 'snare': {
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 * pitchRatio, time);

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.8, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + 0.16);

        noise.connect(filter);
        filter.connect(env);
        env.connect(gainNode);

        noise.start(time);
        noise.stop(time + 0.18);
        break;
      }

      case 'hihat': {
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000 * pitchRatio, time);

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.6, time);
        env.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

        source.connect(filter);
        filter.connect(env);
        env.connect(gainNode);

        source.start(time);
        source.stop(time + 0.05);
        break;
      }

      case 'bass': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65.4 * pitchRatio, time); // C2

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, time);
        filter.frequency.exponentialRampToValueAtTime(120, time + duration);

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.7, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.connect(filter);
        filter.connect(env);
        env.connect(gainNode);

        osc.start(time);
        osc.stop(time + duration + 0.02);
        break;
      }

      case 'synth_lead': {
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc2.type = 'square';

        const baseFreq = 261.63 * pitchRatio; // C4
        osc.frequency.setValueAtTime(baseFreq, time);
        osc2.frequency.setValueAtTime(baseFreq, time);
        osc2.detune.setValueAtTime(10, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, time);

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.5, time);
        env.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(env);
        env.connect(gainNode);

        osc.start(time);
        osc2.start(time);
        osc.stop(time + duration + 0.02);
        osc2.stop(time + duration + 0.02);
        break;
      }

      case 'ambient_pad': {
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc2.type = 'sine';

        const baseFreq = 196.0 * pitchRatio; // G3
        osc.frequency.setValueAtTime(baseFreq, time);
        osc2.frequency.setValueAtTime(baseFreq * 1.5, time); // 5th

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.01, time);
        env.gain.linearRampToValueAtTime(0.4, time + 0.1);
        env.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.connect(env);
        osc2.connect(env);
        env.connect(gainNode);

        osc.start(time);
        osc2.start(time);
        osc.stop(time + duration + 0.05);
        osc2.stop(time + duration + 0.05);
        break;
      }

      case 'chords': {
        // Triad chord (Root, Major Third, Fifth)
        const root = 220 * pitchRatio; // A3
        const freqs = [root, root * 1.2599, root * 1.4983];

        freqs.forEach((f) => {
          const osc = this.ctx!.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, time);

          const env = this.ctx!.createGain();
          env.gain.setValueAtTime(0.25, time);
          env.gain.exponentialRampToValueAtTime(0.01, time + duration);

          osc.connect(env);
          env.connect(gainNode);

          osc.start(time);
          osc.stop(time + duration + 0.02);
        });
        break;
      }

      case 'fx_riser': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150 * pitchRatio, time);
        osc.frequency.exponentialRampToValueAtTime(1200 * pitchRatio, time + duration);

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.05, time);
        env.gain.linearRampToValueAtTime(0.4, time + duration * 0.8);
        env.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.connect(env);
        env.connect(gainNode);

        osc.start(time);
        osc.stop(time + duration + 0.02);
        break;
      }
    }
  }
}
