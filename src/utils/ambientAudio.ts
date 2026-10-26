/**
 * Procedural Retro Computer Room Ambient Synthesizer
 * Built with native Web Audio API (Zero external assets, 100% reliable, zero copyright risk).
 * Creates a soft, low-frequency 55Hz CRT/terminal room tone with subtle analog tape drift.
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public start(volume: number = 0.25): boolean {
    if (this.isPlaying) return true;

    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.volume = Math.max(0, Math.min(1, volume));

      // Master gain node with smooth attack
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(this.volume * 0.15, this.ctx.currentTime + 1.2);

      // Low-pass filter for muffled computer room hum
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Low Frequency Oscillator (LFO) for breathing drift
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // ~5.5s cycle

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(45, this.ctx.currentTime);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);

      // Primary 55Hz sub-bass hum (A1)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'triangle';
      this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      // Secondary 110Hz overtone (A2) with slight detune
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'sine';
      this.osc2.frequency.setValueAtTime(110.4, this.ctx.currentTime);

      // Wiring
      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.lfo.start();
      this.osc1.start();
      this.osc2.start();

      this.isPlaying = true;
      return true;
    } catch (err) {
      console.warn('Ambient audio could not initialize:', err);
      return false;
    }
  }

  public stop(): void {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    try {
      // Smooth fade out to prevent clicks
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);

      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.lfo?.stop();
          this.osc1?.disconnect();
          this.osc2?.disconnect();
          this.lfo?.disconnect();
          this.masterGain?.disconnect();
          this.filter?.disconnect();
        } catch {
          // ignore cleanup errors
        }
        this.osc1 = null;
        this.osc2 = null;
        this.lfo = null;
        this.filter = null;
        this.masterGain = null;
        this.isPlaying = false;
      }, 550);
    } catch {
      this.isPlaying = false;
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.isPlaying && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(this.volume * 0.15, this.ctx.currentTime + 0.1);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientAudio = new AmbientAudioEngine();
