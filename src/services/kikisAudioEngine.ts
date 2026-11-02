/**
 * Kiki's World 2.0 High-Fidelity Audio & Frequency Synthesis Engine
 * Features:
 * - True stereo Binaural Beat synthesis (ChannelSplitter/Merger)
 * - Pure Solfeggio harmonic drone generators (432Hz, 528Hz, 639Hz, 963Hz)
 * - AnalyserNode for live canvas audio spectrum / waveform visualization
 * - External & local audio track playback with playlist support
 */

export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  type: 'frequency' | 'stream' | 'file';
  frequency?: number;
  url?: string;
  duration?: string;
  color?: string;
}

class KikisAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private activeDroneGain: GainNode | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isPlayingAudio = false;
  private currentTrack: PlaylistItem | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  /**
   * Play true stereo binaural beat (carrier in left ear, carrier + beat in right ear)
   */
  public startBinauralBeat(carrierFreq = 528, beatFreq = 6) {
    try {
      this.stopFrequencies();
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const merger = ctx.createChannelMerger(2);
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.2, now + 1.2);

      // Left Channel Oscillator
      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(carrierFreq, now);

      // Right Channel Oscillator (carrier + beat for brainwave entrainment)
      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(carrierFreq + beatFreq, now);

      oscL.connect(merger, 0, 0); // left
      oscR.connect(merger, 0, 1); // right

      merger.connect(masterGain);
      if (this.analyser) {
        masterGain.connect(this.analyser);
      }
      masterGain.connect(ctx.destination);

      oscL.start(now);
      oscR.start(now);

      this.leftOsc = oscL;
      this.rightOsc = oscR;
      this.activeDroneGain = masterGain;
    } catch (e) {
      console.warn('Failed to start binaural beat', e);
    }
  }

  /**
   * Play single Solfeggio harmonic tone
   */
  public playHarmonicTone(freq = 528, duration = 2.0) {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      if (this.analyser) {
        gain.connect(this.analyser);
      }
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {
      console.warn('Failed to play harmonic tone', e);
    }
  }

  /**
   * Stop active frequency generators
   */
  public stopFrequencies() {
    try {
      if (this.activeDroneGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.activeDroneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        setTimeout(() => {
          this.leftOsc?.stop();
          this.rightOsc?.stop();
          this.leftOsc?.disconnect();
          this.rightOsc?.disconnect();
          this.activeDroneGain?.disconnect();
          this.leftOsc = null;
          this.rightOsc = null;
          this.activeDroneGain = null;
        }, 650);
      }
    } catch (e) {
      this.leftOsc = null;
      this.rightOsc = null;
      this.activeDroneGain = null;
    }
  }

  /**
   * Media audio track player (for MP3/WAV/streaming music)
   */
  public playAudioUrl(url: string, track: PlaylistItem) {
    this.stopFrequencies();
    this.initContext();

    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.crossOrigin = 'anonymous';
    }

    this.audioEl.src = url;
    this.audioEl.play().catch((err) => {
      console.warn('Audio play request failed (awaiting user gesture):', err);
    });
    this.isPlayingAudio = true;
    this.currentTrack = track;
  }

  public pauseAudio() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.isPlayingAudio = false;
    }
  }

  public resumeAudio() {
    if (this.audioEl) {
      this.audioEl.play().catch(() => {});
      this.isPlayingAudio = true;
    }
  }

  public isAudioPlaying(): boolean {
    return this.isPlayingAudio;
  }

  public getCurrentTrack(): PlaylistItem | null {
    return this.currentTrack;
  }
}

export const kikisAudio = new KikisAudioEngine();
