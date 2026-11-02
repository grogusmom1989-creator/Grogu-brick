/**
 * Audio synthesis engine for 1D World & Reiki Frequency Harmonics.
 * Uses Web Audio API with zero external dependencies.
 */

class OneDAudioEngine {
  private ctx: AudioContext | null = null;
  private activeDroneOsc: OscillatorNode | null = null;
  private activeDroneGain: GainNode | null = null;
  private currentDroneFreq: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a single harmonic bell / pulse tone with gentle envelope
   */
  public playTone(freq: number, duration = 1.8, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      // Smooth attack and exponential decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {
      console.warn('Audio tone error', e);
    }
  }

  /**
   * Start a continuous meditation drone with subtle harmonic overtone
   */
  public startDrone(freq: number) {
    try {
      this.stopDrone();
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Fade in
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);

      this.activeDroneOsc = osc;
      this.activeDroneGain = gain;
      this.currentDroneFreq = freq;
    } catch (e) {
      console.warn('Audio drone error', e);
    }
  }

  /**
   * Stop active drone with gentle fade out
   */
  public stopDrone() {
    try {
      if (this.activeDroneGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.activeDroneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          this.activeDroneOsc?.stop();
          this.activeDroneOsc?.disconnect();
          this.activeDroneGain?.disconnect();
          this.activeDroneOsc = null;
          this.activeDroneGain = null;
          this.currentDroneFreq = null;
        }, 850);
      }
    } catch (e) {
      this.activeDroneOsc = null;
      this.activeDroneGain = null;
      this.currentDroneFreq = null;
    }
  }

  public getActiveDroneFreq(): number | null {
    return this.currentDroneFreq;
  }
}

export const oneDAudio = new OneDAudioEngine();
