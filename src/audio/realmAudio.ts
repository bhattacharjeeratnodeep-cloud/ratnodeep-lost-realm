/* ============================================================================
   AUDIO_CREDITS
   All background music tracks and sound effects in RATNODEEP: THE LOST REALM
   are 100% original procedural 8-bit/16-bit chiptune compositions synthesized
   at runtime using the Web Audio API.
   License: CC0 1.0 Universal (Public Domain Dedication) — Original Works.
   No external or third-party copyrighted audio files are used.
   ============================================================================ */

export type BgmTheme = 'overworld' | 'story' | 'quests' | 'achievement';

export type SfxKind =
  | 'click'
  | 'menuOpen'
  | 'menuClose'
  | 'selectLocation'
  | 'collectSkill'
  | 'unlockSecret'
  | 'openProject'
  | 'completeQuest'
  | 'step'
  | 'playerCard';

interface NoteEvent {
  freq: number; // Hz (0 = rest)
  dur: number; // beats
  bass?: number; // optional bass Hz
}

// Gentle, warm fantasy chiptune phrases (low-volume, peaceful, nostalgic)
const THEMES: Record<BgmTheme, { bpm: number; loop: boolean; wave: OscillatorType; notes: NoteEvent[] }> = {
  // Cozy retro fantasy overworld ambience (D Major Pentatonic / Lydian)
  overworld: {
    bpm: 92,
    loop: true,
    wave: 'triangle',
    notes: [
      { freq: 587.33, dur: 1, bass: 146.83 }, // D5 / D3
      { freq: 659.25, dur: 1 }, // E5
      { freq: 739.99, dur: 1 }, // F#5
      { freq: 880.0, dur: 1 }, // A5
      { freq: 739.99, dur: 1, bass: 196.0 }, // F#5 / G3
      { freq: 659.25, dur: 1 }, // E5
      { freq: 587.33, dur: 2 }, // D5
      { freq: 493.88, dur: 1, bass: 164.81 }, // B4 / E3
      { freq: 587.33, dur: 1 }, // D5
      { freq: 659.25, dur: 1 }, // E5
      { freq: 739.99, dur: 1 }, // F#5
      { freq: 659.25, dur: 1, bass: 220.0 }, // E5 / A3
      { freq: 587.33, dur: 1 }, // D5
      { freq: 440.0, dur: 2 }, // A4
    ],
  },

  // Mysterious magical exploration (E Dorian)
  story: {
    bpm: 84,
    loop: true,
    wave: 'sine',
    notes: [
      { freq: 659.25, dur: 1, bass: 164.81 }, // E5 / E3
      { freq: 783.99, dur: 1 }, // G5
      { freq: 739.99, dur: 1 }, // F#5
      { freq: 587.33, dur: 1 }, // D5
      { freq: 659.25, dur: 2, bass: 146.83 }, // E5 / D3
      { freq: 493.88, dur: 1 }, // B4
      { freq: 587.33, dur: 1 }, // D5
      { freq: 659.25, dur: 1, bass: 130.81 }, // E5 / C3
      { freq: 739.99, dur: 1 }, // F#5
      { freq: 880.0, dur: 1 }, // A5
      { freq: 783.99, dur: 1 }, // G5
      { freq: 739.99, dur: 2, bass: 123.47 }, // F#5 / B2
      { freq: 587.33, dur: 2 }, // D5
    ],
  },

  // Subtle adventurous project exploration (G Major warm pulse)
  quests: {
    bpm: 102,
    loop: true,
    wave: 'triangle',
    notes: [
      { freq: 392.0, dur: 1, bass: 196.0 }, // G4 / G3
      { freq: 493.88, dur: 1 }, // B4
      { freq: 587.33, dur: 1 }, // D5
      { freq: 659.25, dur: 1 }, // E5
      { freq: 587.33, dur: 1, bass: 164.81 }, // D5 / E3
      { freq: 493.88, dur: 1 }, // B4
      { freq: 440.0, dur: 2 }, // A4
      { freq: 392.0, dur: 1, bass: 130.81 }, // G4 / C3
      { freq: 523.25, dur: 1 }, // C5
      { freq: 587.33, dur: 1 }, // D5
      { freq: 783.99, dur: 1 }, // G5
      { freq: 659.25, dur: 1, bass: 146.83 }, // E5 / D3
      { freq: 587.33, dur: 1 }, // D5
      { freq: 392.0, dur: 2 }, // G4
    ],
  },

  // Celebratory musical cue for achievement / player card (plays once cleanly)
  achievement: {
    bpm: 112,
    loop: false,
    wave: 'triangle',
    notes: [
      { freq: 523.25, dur: 0.75, bass: 130.81 }, // C5
      { freq: 659.25, dur: 0.75 }, // E5
      { freq: 783.99, dur: 0.75 }, // G5
      { freq: 1046.5, dur: 1.5, bass: 196.0 }, // C6
      { freq: 880.0, dur: 0.75, bass: 174.61 }, // A5
      { freq: 987.77, dur: 0.75 }, // B5
      { freq: 1046.5, dur: 2.5, bass: 261.63 }, // C6
    ],
  },
};

class RealmAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private musicEnabled = false;
  private sfxEnabled = true;
  private volume = 0.5;

  private activeTheme: BgmTheme | null = null;
  private loopTimer: number | null = null;
  private stepIndex = 0;
  private lastStepSfxAt = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.24; // Subtle, non-distracting ambient level

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.42;

        // Warm low-pass filter so square/triangle tones stay gentle & cozy
        const warmthFilter = this.ctx.createBiquadFilter();
        warmthFilter.type = 'lowpass';
        warmthFilter.frequency.value = 2400;

        this.bgmGain.connect(warmthFilter);
        this.sfxGain.connect(warmthFilter);
        warmthFilter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignore browser autoplay rejection until next user gesture
      });
    }

    return this.ctx;
  }

  public configure(opts: {
    musicEnabled: boolean;
    sfxEnabled: boolean;
    volume: number;
  }) {
    this.musicEnabled = opts.musicEnabled;
    this.sfxEnabled = opts.sfxEnabled;
    this.volume = Math.max(0, Math.min(1, opts.volume));

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(this.volume, now, 0.04);
    }

    if (!this.musicEnabled) {
      this.stopMusic(true);
    }
  }

  public unlockAndStartMusic(theme: BgmTheme) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (!this.musicEnabled) return;
    this.playTheme(theme);
  }

  public playTheme(theme: BgmTheme) {
    if (!this.musicEnabled) {
      this.activeTheme = theme;
      return;
    }

    if (this.activeTheme === theme && this.loopTimer !== null) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.bgmGain) return;

    this.stopMusic(false);
    this.activeTheme = theme;
    this.stepIndex = 0;

    // Gentle fade-in on new environment
    const now = ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setValueAtTime(0.001, now);
    this.bgmGain.gain.linearRampToValueAtTime(0.24, now + 0.35);

    this.scheduleNextNote();
  }

  private scheduleNextNote() {
    if (!this.musicEnabled || !this.activeTheme || !this.ctx || !this.bgmGain) {
      return;
    }

    const spec = THEMES[this.activeTheme];
    if (this.stepIndex >= spec.notes.length) {
      if (!spec.loop) {
        // Achievement fanfare finished; keep timer cleared
        this.loopTimer = null;
        return;
      }
      this.stepIndex = 0;
    }

    const note = spec.notes[this.stepIndex++];
    const beatMs = (60 / spec.bpm) * 1000;
    const durationSec = (note.dur * 60) / spec.bpm;
    const now = this.ctx.currentTime;

    if (note.freq > 0) {
      this.triggerVoice(note.freq, now, durationSec * 0.88, spec.wave, 0.45, this.bgmGain);
    }
    if (note.bass && note.bass > 0) {
      this.triggerVoice(note.bass, now, durationSec * 1.4, 'sine', 0.38, this.bgmGain);
    }

    this.loopTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, Math.max(80, note.dur * beatMs));
  }

  public stopMusic(immediate = false) {
    if (this.loopTimer !== null) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    if (this.ctx && this.bgmGain) {
      const now = this.ctx.currentTime;
      this.bgmGain.gain.cancelScheduledValues(now);
      if (immediate) {
        this.bgmGain.gain.setValueAtTime(0, now);
      } else {
        this.bgmGain.gain.setTargetAtTime(0, now, 0.08);
      }
    }
  }

  public playSfx(kind: SfxKind) {
    if (!this.sfxEnabled) return;

    // Throttle step SFX so holding movement keys stays subtle
    if (kind === 'step') {
      const t = performance.now();
      if (t - this.lastStepSfxAt < 140) return;
      this.lastStepSfxAt = t;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    switch (kind) {
      case 'click':
        this.triggerVoice(520, now, 0.055, 'triangle', 0.35, this.sfxGain);
        break;
      case 'menuOpen':
        this.triggerVoice(440, now, 0.07, 'triangle', 0.35, this.sfxGain);
        this.triggerVoice(659.25, now + 0.055, 0.09, 'triangle', 0.35, this.sfxGain);
        break;
      case 'menuClose':
        this.triggerVoice(587.33, now, 0.07, 'triangle', 0.32, this.sfxGain);
        this.triggerVoice(392.0, now + 0.055, 0.09, 'triangle', 0.3, this.sfxGain);
        break;
      case 'selectLocation':
        this.triggerVoice(587.33, now, 0.07, 'sine', 0.38, this.sfxGain);
        this.triggerVoice(880.0, now + 0.06, 0.11, 'triangle', 0.35, this.sfxGain);
        break;
      case 'collectSkill':
        this.triggerVoice(587.33, now, 0.08, 'triangle', 0.4, this.sfxGain);
        this.triggerVoice(739.99, now + 0.065, 0.08, 'triangle', 0.4, this.sfxGain);
        this.triggerVoice(880.0, now + 0.13, 0.08, 'triangle', 0.42, this.sfxGain);
        this.triggerVoice(1174.66, now + 0.195, 0.16, 'sine', 0.45, this.sfxGain);
        break;
      case 'unlockSecret':
        this.triggerVoice(493.88, now, 0.12, 'sine', 0.38, this.sfxGain);
        this.triggerVoice(659.25, now + 0.08, 0.12, 'sine', 0.38, this.sfxGain);
        this.triggerVoice(987.77, now + 0.16, 0.22, 'triangle', 0.42, this.sfxGain);
        break;
      case 'openProject':
        this.triggerVoice(392.0, now, 0.08, 'triangle', 0.36, this.sfxGain);
        this.triggerVoice(587.33, now + 0.065, 0.13, 'triangle', 0.38, this.sfxGain);
        break;
      case 'completeQuest':
        this.triggerVoice(523.25, now, 0.09, 'triangle', 0.42, this.sfxGain);
        this.triggerVoice(659.25, now + 0.08, 0.09, 'triangle', 0.42, this.sfxGain);
        this.triggerVoice(783.99, now + 0.16, 0.09, 'triangle', 0.42, this.sfxGain);
        this.triggerVoice(1046.5, now + 0.24, 0.22, 'triangle', 0.46, this.sfxGain);
        break;
      case 'step':
        this.triggerVoice(196.0, now, 0.045, 'sine', 0.2, this.sfxGain);
        break;
      case 'playerCard':
        this.triggerVoice(523.25, now, 0.1, 'triangle', 0.4, this.sfxGain);
        this.triggerVoice(783.99, now + 0.09, 0.1, 'triangle', 0.4, this.sfxGain);
        this.triggerVoice(1046.5, now + 0.18, 0.25, 'sine', 0.44, this.sfxGain);
        break;
    }
  }

  private triggerVoice(
    freq: number,
    startTime: number,
    duration: number,
    wave: OscillatorType,
    peakGain: number,
    destination: AudioNode
  ) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    } catch {
      // Fail gracefully if node scheduling hits edge limits
    }
  }
}

export const realmAudio = new RealmAudioEngine();
