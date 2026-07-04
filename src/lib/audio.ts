/**
 * Investigation Audio Engine
 * --------------------------
 * All ambient + interaction sounds are synthesized with the Web Audio API.
 * No external audio assets required. Everything is subtle by design.
 *
 * Ambient layers (when enabled):
 *   - distant thunder (low rumble bursts)
 *   - Louisiana insects (chirp bed)
 *   - wooden floor creaks
 *   - wind (filtered noise)
 *   - tape recorder hum (60Hz + harmonic)
 *   - fluorescent light buzz (120Hz)
 *
 * Interaction one-shots:
 *   paper, typewriter, shutter, cassette, stamp, drawer, pencil, click, strap
 */

type Layer = {
  start: (ctx: AudioContext, master: GainNode) => void;
  stop?: () => void;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambientGain: GainNode | null = null;
const activeNodes: { stop?: () => void }[] = [];
let enabled = false;
let listeners: Array<(on: boolean) => void> = [];

function ac(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    ambientGain = ctx.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(master);
  }
  return ctx;
}

/* ---------- noise buffer cache ---------- */
let noiseBuf: AudioBuffer | null = null;
function noiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  noiseBuf = buf;
  return buf;
}

/* ---------- one-shot helpers ---------- */
function env(
  c: AudioContext,
  gain: GainNode,
  peak: number,
  attack: number,
  decay: number,
  t0: number
) {
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
}

/* ============================================================
   INTERACTION SOUNDS
   ============================================================ */
function playNoiseBurst(opts: {
  peak: number;
  attack: number;
  decay: number;
  filterType: BiquadFilterType;
  freq: number;
  q?: number;
  dest?: GainNode;
}) {
  if (!enabled || !ctx || !master) return;
  const c = ctx;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  src.loop = true;
  const filt = c.createBiquadFilter();
  filt.type = opts.filterType;
  filt.frequency.value = opts.freq;
  filt.Q.value = opts.q ?? 1;
  const g = c.createGain();
  src.connect(filt);
  filt.connect(g);
  g.connect(opts.dest ?? master);
  env(c, g, opts.peak, opts.attack, opts.decay, t);
  src.start(t);
  src.stop(t + opts.attack + opts.decay + 0.05);
}

const interactions = {
  paper() {
    // paper turning / rustle: filtered noise, two short bursts
    playNoiseBurst({
      peak: 0.16,
      attack: 0.005,
      decay: 0.12,
      filterType: "bandpass",
      freq: 2600,
      q: 0.7,
    });
    setTimeout(
      () =>
        playNoiseBurst({
          peak: 0.1,
          attack: 0.004,
          decay: 0.09,
          filterType: "bandpass",
          freq: 1900,
          q: 0.6,
        }),
      70
    );
  },
  typewriter() {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    // key clack: short noise burst + low thunk
    playNoiseBurst({
      peak: 0.22,
      attack: 0.001,
      decay: 0.05,
      filterType: "highpass",
      freq: 3200,
    });
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.05);
    osc.connect(g);
    g.connect(master);
    env(c, g, 0.18, 0.001, 0.06, t);
    osc.start(t);
    osc.stop(t + 0.1);
  },
  // bell at end of line
  typewriterBell() {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    [1760, 2640].forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(g);
      g.connect(master);
      env(c, g, i === 0 ? 0.14 : 0.06, 0.002, 0.5, t);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  },
  shutter() {
    // camera shutter: two clicks
    playNoiseBurst({
      peak: 0.3,
      attack: 0.001,
      decay: 0.03,
      filterType: "highpass",
      freq: 2000,
    });
    setTimeout(
      () =>
        playNoiseBurst({
          peak: 0.26,
          attack: 0.001,
          decay: 0.05,
          filterType: "highpass",
          freq: 1600,
        }),
      60
    );
  },
  cassette() {
    // cassette click: mechanical thock
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    playNoiseBurst({
      peak: 0.2,
      attack: 0.001,
      decay: 0.04,
      filterType: "bandpass",
      freq: 1200,
      q: 2,
    });
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "square";
    osc.frequency.value = 90;
    osc.connect(g);
    g.connect(master);
    env(c, g, 0.12, 0.001, 0.05, t);
    osc.start(t);
    osc.stop(t + 0.08);
  },
  stamp() {
    // rubber stamp thud
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    osc.connect(g);
    g.connect(master);
    env(c, g, 0.28, 0.002, 0.18, t);
    osc.start(t);
    osc.stop(t + 0.25);
    playNoiseBurst({
      peak: 0.12,
      attack: 0.001,
      decay: 0.03,
      filterType: "bandpass",
      freq: 800,
      q: 1,
    });
  },
  drawer() {
    // drawer opening: long filtered noise sweep
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(300, t);
    filt.frequency.exponentialRampToValueAtTime(1400, t + 0.4);
    filt.Q.value = 1.2;
    const g = c.createGain();
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.start(t);
    src.stop(t + 0.55);
  },
  pencil() {
    // pencil writing: soft scratching
    playNoiseBurst({
      peak: 0.08,
      attack: 0.02,
      decay: 0.18,
      filterType: "bandpass",
      freq: 4200,
      q: 3,
    });
  },
  photoPickup() {
    // picking up a photograph: paper lift + faint slide
    playNoiseBurst({
      peak: 0.12,
      attack: 0.004,
      decay: 0.09,
      filterType: "bandpass",
      freq: 2200,
      q: 0.8,
    });
    setTimeout(
      () =>
        playNoiseBurst({
          peak: 0.06,
          attack: 0.02,
          decay: 0.14,
          filterType: "bandpass",
          freq: 1500,
          q: 0.6,
        }),
      60
    );
  },
  notebookClose() {
    // notebook closing: slow leather creak + soft cover thud
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    // long creak
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(420, t);
    filt.frequency.exponentialRampToValueAtTime(700, t + 0.7);
    filt.Q.value = 3;
    const g = c.createGain();
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    src.start(t);
    src.stop(t + 1.0);
    // cover thud at the end
    const osc = c.createOscillator();
    const og = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(90, t + 0.85);
    osc.frequency.exponentialRampToValueAtTime(38, t + 1.05);
    osc.connect(og);
    og.connect(master);
    env(c, og, 0.2, 0.003, 0.22, t + 0.85);
    osc.start(t + 0.85);
    osc.stop(t + 1.2);
  },
  click() {
    playNoiseBurst({
      peak: 0.14,
      attack: 0.001,
      decay: 0.03,
      filterType: "highpass",
      freq: 2500,
    });
  },
  strap() {
    // leather strap unlock: creak + thud
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(500, t);
    filt.frequency.exponentialRampToValueAtTime(900, t + 0.3);
    filt.Q.value = 4;
    const g = c.createGain();
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    src.start(t);
    src.stop(t + 0.45);
    // thud
    const osc = c.createOscillator();
    const og = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.5);
    osc.connect(og);
    og.connect(master);
    env(c, og, 0.22, 0.002, 0.16, t + 0.35);
    osc.start(t + 0.35);
    osc.stop(t + 0.6);
  },
  thunder() {
    // distant thunder roll
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 120;
    filt.Q.value = 0.5;
    const g = c.createGain();
    src.connect(filt);
    filt.connect(g);
    g.connect(ambientGain!);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.2, t + 2.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
    src.start(t);
    src.stop(t + 5.2);
  },
};

/* ============================================================
   AMBIENT LAYERS
   ============================================================ */
const ambientLayers: Layer[] = [
  // wind — slow filtered noise
  {
    start(c, dest) {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c);
      src.loop = true;
      const filt = c.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 480;
      filt.Q.value = 0.6;
      const g = c.createGain();
      g.gain.value = 0.05;
      src.connect(filt);
      filt.connect(g);
      g.connect(dest);
      // slow LFO on gain
      const lfo = c.createOscillator();
      const lfoG = c.createGain();
      lfo.frequency.value = 0.08;
      lfoG.gain.value = 0.03;
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      src.start();
      lfo.start();
      this.stop = () => {
        try {
          src.stop();
          lfo.stop();
        } catch {
          /* noop */
        }
      };
    },
  },
  // tape recorder hum — 60Hz + harmonic
  {
    start(c, dest) {
      const g = c.createGain();
      g.gain.value = 0.012;
      g.connect(dest);
      const o1 = c.createOscillator();
      o1.type = "sawtooth";
      o1.frequency.value = 60;
      const o2 = c.createOscillator();
      o2.type = "sine";
      o2.frequency.value = 120;
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 400;
      o1.connect(f);
      o2.connect(f);
      f.connect(g);
      o1.start();
      o2.start();
      this.stop = () => {
        try {
          o1.stop();
          o2.stop();
        } catch {
          /* noop */
        }
      };
    },
  },
  // fluorescent buzz — 120Hz with slight detune
  {
    start(c, dest) {
      const g = c.createGain();
      g.gain.value = 0.008;
      g.connect(dest);
      const o = c.createOscillator();
      o.type = "square";
      o.frequency.value = 120;
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 2400;
      f.Q.value = 8;
      o.connect(f);
      f.connect(g);
      o.start();
      this.stop = () => {
        try {
          o.stop();
        } catch {
          /* noop */
        }
      };
    },
  },
  // insects — random chirps
  {
    start(c, dest) {
      let stopped = false;
      const schedule = () => {
        if (stopped) return;
        const t = c.currentTime;
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = "sine";
          o.frequency.value = 3200 + Math.random() * 1800;
          g.gain.value = 0.0001;
          o.connect(g);
          g.connect(dest);
          const st = t + i * 0.04 + Math.random() * 0.02;
          g.gain.setValueAtTime(0.0001, st);
          g.gain.exponentialRampToValueAtTime(0.018, st + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, st + 0.03);
          o.start(st);
          o.stop(st + 0.04);
        }
        setTimeout(schedule, 600 + Math.random() * 1400);
      };
      schedule();
      this.stop = () => {
        stopped = true;
      };
    },
  },
  // floor creaks — occasional low wooden groan
  {
    start(c, dest) {
      let stopped = false;
      const schedule = () => {
        if (stopped) return;
        const t = c.currentTime;
        const src = c.createBufferSource();
        src.buffer = noiseBuffer(c);
        src.loop = true;
        const f = c.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 220 + Math.random() * 160;
        f.Q.value = 5;
        const g = c.createGain();
        src.connect(f);
        f.connect(g);
        g.connect(dest);
        const dur = 0.3 + Math.random() * 0.5;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.start(t);
        src.stop(t + dur + 0.05);
        setTimeout(schedule, 5000 + Math.random() * 9000);
      };
      schedule();
      this.stop = () => {
        stopped = true;
      };
    },
  },
  // ceiling fan — slow low throb + faint mechanical tick
  {
    start(c, dest) {
      const g = c.createGain();
      g.gain.value = 0.015;
      g.connect(dest);
      // low air throb
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c);
      src.loop = true;
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 220;
      f.Q.value = 0.7;
      src.connect(f);
      f.connect(g);
      // slow LFO mimicking blade pass
      const lfo = c.createOscillator();
      const lfoG = c.createGain();
      lfo.frequency.value = 0.9; // ~54 rpm
      lfoG.gain.value = 0.012;
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      // faint tick each pass
      let stopped = false;
      const tick = () => {
        if (stopped) return;
        const t = c.currentTime;
        const o = c.createOscillator();
        const tg = c.createGain();
        o.type = "square";
        o.frequency.value = 70;
        o.connect(tg);
        tg.connect(dest);
        env(c, tg, 0.006, 0.001, 0.02, t);
        o.start(t);
        o.stop(t + 0.04);
        setTimeout(tick, 1100 + Math.random() * 120);
      };
      src.start();
      lfo.start();
      setTimeout(tick, 1500);
      this.stop = () => {
        stopped = true;
        try {
          src.stop();
          lfo.stop();
        } catch {
          /* noop */
        }
      };
    },
  },
  // swamp ambience — low frog/creek bed, occasional distant calls
  {
    start(c, dest) {
      let stopped = false;
      const bed = c.createBufferSource();
      bed.buffer = noiseBuffer(c);
      bed.loop = true;
      const bf = c.createBiquadFilter();
      bf.type = "bandpass";
      bf.frequency.value = 900;
      bf.Q.value = 0.5;
      const bg = c.createGain();
      bg.gain.value = 0.018;
      bed.connect(bf);
      bf.connect(bg);
      bg.connect(dest);
      bed.start();
      const schedule = () => {
        if (stopped) return;
        const t = c.currentTime;
        // distant frog call — short pitch-down chirp
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        const f0 = 380 + Math.random() * 260;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(f0 * 0.7, t + 0.18);
        o.connect(g);
        g.connect(dest);
        env(c, g, 0.012, 0.02, 0.22, t);
        o.start(t);
        o.stop(t + 0.3);
        setTimeout(schedule, 4000 + Math.random() * 7000);
      };
      setTimeout(schedule, 2500);
      this.stop = () => {
        stopped = true;
        try {
          bed.stop();
        } catch {
          /* noop */
        }
      };
    },
  },
  // tape hiss — steady high noise floor (the recorder is always on)
  {
    start(c, dest) {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c);
      src.loop = true;
      const f = c.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 4200;
      const g = c.createGain();
      g.gain.value = 0.006;
      src.connect(f);
      f.connect(g);
      g.connect(dest);
      src.start();
      this.stop = () => {
        try {
          src.stop();
        } catch {
          /* noop */
        }
      };
    },
  },
];

/* ============================================================
   PUBLIC API
   ============================================================ */
export const audio = {
  isEnabled() {
    return enabled;
  },
  subscribe(fn: (on: boolean) => void) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
  async enable() {
    const c = ac();
    if (c.state === "suspended") await c.resume();
    enabled = true;
    if (!ambientGain || !master) return;
    // start ambient layers
    ambientLayers.forEach((layer) => {
      const wrapper = { stop: undefined } as Layer;
      ambientLayers[ambientLayers.indexOf(layer)].start(c, ambientGain!);
      // capture stop
      const l = ambientLayers[ambientLayers.indexOf(layer)];
      wrapper.stop = l.stop;
      activeNodes.push(wrapper);
    });
    // fade in ambient — slow, weighted arrival
    const t = c.currentTime;
    ambientGain.gain.cancelScheduledValues(t);
    ambientGain.gain.setValueAtTime(0.0001, t);
    ambientGain.gain.linearRampToValueAtTime(0.42, t + 4.5);
    listeners.forEach((l) => l(true));
  },
  disable() {
    if (!ctx || !ambientGain) return;
    const t = ctx.currentTime;
    ambientGain.gain.cancelScheduledValues(t);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, t);
    ambientGain.gain.linearRampToValueAtTime(0.0001, t + 1.2);
    setTimeout(() => {
      activeNodes.forEach((n) => n.stop?.());
      activeNodes.length = 0;
    }, 1400);
    enabled = false;
    listeners.forEach((l) => l(false));
  },
  toggle() {
    if (enabled) this.disable();
    else void this.enable();
  },
  // interaction one-shots
  paper: interactions.paper,
  typewriter: interactions.typewriter,
  typewriterBell: interactions.typewriterBell,
  shutter: interactions.shutter,
  cassette: interactions.cassette,
  stamp: interactions.stamp,
  drawer: interactions.drawer,
  pencil: interactions.pencil,
  photoPickup: interactions.photoPickup,
  notebookClose: interactions.notebookClose,
  click: interactions.click,
  strap: interactions.strap,
  thunder: interactions.thunder,
};

export type AudioApi = typeof audio;
