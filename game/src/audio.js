// Synthesised sound: WebAudio only, no audio files, no network.
// Everything is a short oscillator or noise burst, started on the
// first user gesture so browsers allow it.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
  }

  unlock() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  noise(dur, vol, low) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = low || 1200;
    const gain = this.ctx.createGain(); gain.gain.value = vol || 0.15;
    src.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    src.start(t);
  }

  // The turkey's own voice: three fast descending clucks.
  gobble() {
    if (!this.ctx || this.muted) return;
    [0, 0.09, 0.18].forEach((d, i) => {
      setTimeout(() => this.tone(420 - i * 60, 0.09, 'square', 0.07, 240), d * 1000);
    });
  }

  pickup() { this.tone(660, 0.08, 'sine', 0.12, 990); setTimeout(() => this.tone(990, 0.1, 'sine', 0.1), 70); }
  jump() { this.tone(300, 0.14, 'sine', 0.08, 560); }
  thud() { this.noise(0.12, 0.2, 500); this.tone(120, 0.12, 'sine', 0.14, 60); }
  knifeWhoosh() { this.noise(0.18, 0.1, 3000); }
  alarm() { this.tone(520, 0.12, 'square', 0.06, 780); setTimeout(() => this.tone(780, 0.12, 'square', 0.06, 520), 130); }
  hide() { this.tone(500, 0.2, 'triangle', 0.08, 240); }
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'triangle', 0.12), i * 120));
  }
  caughtSting() {
    [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'sawtooth', 0.07), i * 140));
  }
  toggleMute() { this.muted = !this.muted; return this.muted; }
}
