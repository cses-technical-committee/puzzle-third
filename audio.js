/**
 * TECHNOVA: TEAM PUZZLE ADVENTURE
 * Synthesized Web Audio Sound System
 *
 * Implements subtle, atmospheric audio effects using the native Web Audio API.
 * Completely standalone: zero external audio file dependencies.
 * Respects user gesture requirements, sound mute toggle, and reduces ear fatigue.
 */

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.masterGain = null;
    this.isMuted = false;
    this.lastPlayedTimes = {};
  }

  /**
   * Initializes the AudioContext after the first user gesture.
   */
  initContext() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
          this.masterGain = this.audioCtx.createGain();
          this.masterGain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
          this.masterGain.connect(this.audioCtx.destination);
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
    } catch (e) {
      // Audio context may be restricted in some browsers; ignore silently
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    try {
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.setValueAtTime(muted ? 0 : 0.6, this.audioCtx.currentTime);
      }
    } catch (e) {}
  }

  toggleSound() {
    this.setMuted(!this.isMuted);
    return !this.isMuted;
  }

  /**
   * Prevents spamming duplicate sound effects.
   */
  canPlay(soundName, throttleMs = 80) {
    try {
      if (this.isMuted || !this.soundEnabled) return false;
      this.initContext();
      if (!this.audioCtx) return false;

      const now = Date.now();
      if (this.lastPlayedTimes[soundName] && now - this.lastPlayedTimes[soundName] < throttleMs) {
        return false;
      }
      this.lastPlayedTimes[soundName] = now;
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Subtle UI Button Click
   */
  playButtonClick() {
    if (!this.canPlay("buttonClick")) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  /**
   * Radio / Option Selection Tick
   */
  playAnswerSelect() {
    if (!this.canPlay("answerSelect", 50)) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  /**
   * Start Mission Activation Chime
   */
  playStartMission() {
    if (!this.canPlay("startMission")) return;
    const ctx = this.audioCtx;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C4, E4, G4, C5, E5
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + index * 0.09;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  /**
   * Opening a Level Checkpoint
   */
  playLevelOpen() {
    if (!this.canPlay("levelOpen")) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  /**
   * Submission Processing Pulse
   */
  playAnswerSubmit() {
    if (!this.canPlay("answerSubmit")) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  /**
   * Incorrect Answer Soft Feedback (Gentle, non-punitive)
   */
  playIncorrect() {
    if (!this.canPlay("incorrect", 300)) return;
    const ctx = this.audioCtx;
    const freqs = [220, 185]; // A3 to F#3
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.14;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  /**
   * Level Complete Celebration Fanfare
   */
  playLevelComplete() {
    if (!this.canPlay("levelComplete")) return;
    const ctx = this.audioCtx;
    // Major chord flourish: C5, E5, G5, C6
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.08;

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  }

  /**
   * Secret Letter Reveal Shimmer
   */
  playLetterReveal() {
    if (!this.canPlay("letterReveal")) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.25); // A5

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  /**
   * Secret Letter Fly into HUD Collector
   */
  playLetterCollect() {
    if (!this.canPlay("letterCollect")) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.28); // Up to D6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  /**
   * Vault Lock Hum / Rotation
   */
  playVaultActivate() {
    if (!this.canPlay("vaultActivate")) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  /**
   * Grand Vault Unlock Sequence & Mission Victory Fanfare
   */
  playVaultUnlock() {
    if (!this.canPlay("vaultUnlock")) return;
    const ctx = this.audioCtx;

    // Phase 1: Mechanical Clunk
    const lowOsc = ctx.createOscillator();
    const lowGain = ctx.createGain();
    lowOsc.type = "sine";
    lowOsc.frequency.setValueAtTime(120, ctx.currentTime);
    lowOsc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.3);
    lowGain.gain.setValueAtTime(0.3, ctx.currentTime);
    lowGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    lowOsc.connect(lowGain);
    lowGain.connect(this.masterGain);
    lowOsc.start();
    lowOsc.stop(ctx.currentTime + 0.35);

    // Phase 2: Radiant Victory Fanfare
    const fanfareNotes = [
      { f: 392.0, t: 0.25 }, // G4
      { f: 523.25, t: 0.4 }, // C5
      { f: 659.25, t: 0.55 }, // E5
      { f: 783.99, t: 0.7 }, // G5
      { f: 1046.5, t: 0.9 }, // C6
      { f: 1318.51, t: 1.1 }  // E6
    ];

    fanfareNotes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + note.t;

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.f, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  }
}

// Global instance
window.soundManager = new SoundManager();
