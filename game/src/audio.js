// Original sound effects, synthesized with the Web Audio API: no audio files,
// every blip and sizzle is an oscillator or filtered noise built here.
// The first user gesture unlocks the audio context (browsers require one).

export function createAudio() {
  let context = null;
  let muted = false;
  let sizzleNodes = null;

  function ensure() {
    if (context !== null) return context;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      return null;
    }
    return context;
  }

  /** Unlock (and resume) the context from a user gesture. */
  function unlock() {
    const ctx = ensure();
    if (ctx !== null && ctx.state === 'suspended') void ctx.resume();
  }

  function tone(freq, duration, type, gainValue, when = 0, slideTo = null) {
    if (muted) return;
    const ctx = ensure();
    if (ctx === null) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  function noise(duration, gainValue, filterFreq, when = 0) {
    if (muted) return;
    const ctx = ensure();
    if (ctx === null) return;
    const start = ctx.currentTime + when;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(start);
    source.stop(start + duration + 0.05);
  }

  return {
    unlock,
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    /** A soft pop when an ingredient lands on the plate. */
    pop() {
      tone(520, 0.09, 'sine', 0.16, 0, 760);
    },
    /** A knife chop when an order ticket arrives. */
    chop() {
      noise(0.06, 0.22, 1800);
      tone(180, 0.07, 'triangle', 0.14, 0, 120);
    },
    /** A bright two-note ding when a dish is served. */
    ding() {
      tone(880, 0.16, 'sine', 0.2);
      tone(1318, 0.28, 'sine', 0.18, 0.11);
    },
    /** A low buzz for a wrong serve. */
    buzz() {
      tone(140, 0.22, 'sawtooth', 0.12, 0, 90);
    },
    /** A sad thud when an order walks out. */
    thud() {
      tone(110, 0.3, 'sine', 0.2, 0, 55);
      noise(0.12, 0.1, 300);
    },
    /** A short tick when the shift clock drops under ten seconds. */
    tick() {
      tone(1200, 0.05, 'square', 0.06);
    },
    /** A little fanfare when the shift ends. */
    jingle() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, index) => tone(freq, 0.22, 'triangle', 0.16, index * 0.13));
    },
    /** Start the stove's gentle sizzle loop; call stopSizzle to end it. */
    startSizzle() {
      if (muted) return;
      const ctx = ensure();
      if (ctx === null || sizzleNodes !== null) return;
      const length = Math.floor(ctx.sampleRate * 1.2);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3800;
      const gain = ctx.createGain();
      gain.gain.value = 0.015;
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
      sizzleNodes = { source, gain };
    },
    stopSizzle() {
      if (sizzleNodes === null) return;
      try {
        sizzleNodes.source.stop();
      } catch {
        // Already stopped.
      }
      sizzleNodes = null;
    },
  };
}
