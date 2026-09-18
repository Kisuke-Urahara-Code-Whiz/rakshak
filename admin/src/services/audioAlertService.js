/**
 * Web Audio API Emergency Alert Synthesizer
 * Generates attention-grabbing geotechnical alarm beeps without relying on external mp3 files.
 */

class AudioAlertService {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('rakshak_audio_muted') === 'true';
    this.activeOscillators = [];
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muteState) {
    this.muted = Boolean(muteState);
    try {
      localStorage.setItem('rakshak_audio_muted', this.muted ? 'true' : 'false');
    } catch {}
    if (this.muted) {
      this.stopAlert();
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Play an urgent dual-frequency geotechnical emergency pulse
   * Pattern: High beep (880Hz) -> Low beep (660Hz) pulsed 3 times
   */
  playAlertBeep({ pulses = 3, toneFreq1 = 880, toneFreq2 = 660, pulseDuration = 0.14, gap = 0.08 } = {}) {
    if (this.muted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const startTime = ctx.currentTime + 0.05;

      for (let i = 0; i < pulses; i++) {
        const pulseStart = startTime + i * (pulseDuration * 2 + gap * 2);

        // Tone 1 (High Warning Frequency)
        this.createTone(ctx, toneFreq1, pulseStart, pulseDuration);

        // Tone 2 (Lower Attention Frequency)
        this.createTone(ctx, toneFreq2, pulseStart + pulseDuration + 0.02, pulseDuration);
      }
    } catch (err) {
      console.warn('[AudioAlertService] Could not play emergency beep:', err);
    }
  }

  createTone(ctx, freq, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    // Smooth envelope attack and decay to prevent harsh audio clicks
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);

    this.activeOscillators.push(osc);
    osc.onended = () => {
      const idx = this.activeOscillators.indexOf(osc);
      if (idx !== -1) this.activeOscillators.splice(idx, 1);
    };
  }

  stopAlert() {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });
    this.activeOscillators = [];
  }
}

export const audioAlertService = new AudioAlertService();
export default audioAlertService;
