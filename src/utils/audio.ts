class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Warm low-pass filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(280, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Deep root drone (55Hz / A1)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.droneOsc1.connect(gain1);
      gain1.connect(this.filter);
      this.droneOsc1.start();

      // Fifth overtone (82.4Hz / E2)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.droneOsc2.connect(gain2);
      gain2.connect(this.filter);
      this.droneOsc2.start();

      // Soft octave harmonic (110Hz / A2) with subtle triangle warmth
      this.droneOsc3 = this.ctx.createOscillator();
      this.droneOsc3.type = 'triangle';
      this.droneOsc3.frequency.setValueAtTime(110, this.ctx.currentTime);

      const gain3 = this.ctx.createGain();
      gain3.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.droneOsc3.connect(gain3);
      gain3.connect(this.filter);
      this.droneOsc3.start();

      this.isInitialized = true;
    } catch {
      // Graceful fallback
    }
  }

  public toggleMute(): boolean {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    this.updateMasterVolume();
    return !this.isMuted;
  }

  public setProgress(progress: number) {
    if (!this.ctx || !this.filter || this.isMuted) return;
    try {
      // Modulate filter cutoff smoothly with journey progress (200Hz to 650Hz)
      const targetFreq = 220 + Math.sin(progress * Math.PI) * 400 + progress * 150;
      this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
    } catch {
      // ignore
    }
  }

  public playDiscoverChime(ringIndex: number = 0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [220, 277.18, 329.63, 440, 554.37]; // A major pentatonic
      const freq = notes[ringIndex % notes.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch {
      // ignore
    }
  }

  public playPulsePulse() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(45, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch {
      // ignore
    }
  }

  private updateMasterVolume() {
    if (!this.ctx || !this.masterGain) return;
    const target = this.isMuted ? 0.0001 : 0.45;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }
}

export const sound = new AudioEngine();
