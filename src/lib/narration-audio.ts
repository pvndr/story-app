"use client";

/**
 * Narration audio — single-voice controller + pitch-down processing.
 *
 * TWO problems this solves (vs. the previous <audio> + MediaElementSource approach):
 *
 *  1. Pitch-down wasn't reliably audible. <audio>.preservesPitch is ignored or
 *     quirky when routed through createMediaElementSource in some engines.
 *     Fix: decode the WAV to an AudioBuffer and play via AudioBufferSourceNode,
 *     whose playbackRate ALWAYS shifts pitch (there is no "preserve" concept).
 *
 *  2. Voices overlapped. Each NarrationPlayer managed its own element, so a
 *     new one didn't stop the previous. Fix: a module-level controller holds the
 *     single active narration; playNarration() stops whatever is running first.
 *
 * TIMBRE STRATEGY:
 *   The TTS "jam" (only native-English voice) reads young. We generate it at a
 *   FASTER speed (1.5x, pitch-preserving time-stretch at synthesis), then play
 *   the buffer back at a LOWER rate (0.6). Net:
 *     - pitch drops ~7 semitones (clearly deepened, child → adult-male range)
 *     - tempo = 1.5 * 0.6 = 0.9x  (near-natural, slightly deliberate)
 *   Plus a lowpass (muffle bright partials) and a subtle waveshaper (gravel).
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** Resume the context (must follow a user gesture). */
export async function resumeNarrationContext(): Promise<void> {
  const c = getContext();
  if (c && c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* noop */
    }
  }
}

/** subtle gravel distortion curve (soft asymmetric clip) */
function gravelCurve(amount = 3): Float32Array {
  const n = 8192;
  const curve = new Float32Array(n);
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] =
      ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/* ---------- single-active-narration controller ---------- */

type Active = {
  source: AudioBufferSourceNode;
  nodes: AudioNode[]; // for disconnect cleanup
  startTime: number; // ctx.currentTime when started (for progress)
  bufferDur: number; // adjusted duration (buffer.duration / playbackRate)
  raf: number;
  onEnded?: () => void;
  onProgress?: (p: number) => void;
};

let active: Active | null = null;

/** Module-level lock: prevents multiple NarrationPlayers from fetching
 *  simultaneously when several scroll into view at once. */
let fetchLock = false;

/** Acquire the fetch lock (returns false if another fetch is in progress). */
export function acquireFetchLock(): boolean {
  if (fetchLock) return false;
  fetchLock = true;
  return true;
}

/** Release the fetch lock. */
export function releaseFetchLock(): void {
  fetchLock = false;
}

/** Stop the currently-playing narration, if any. */
export function stopNarration(): void {
  if (!active) return;
  const a = active;
  active = null;
  cancelAnimationFrame(a.raf);
  try {
    a.source.onended = null;
    a.source.stop();
  } catch {
    /* already ended */
  }
  for (const n of a.nodes) {
    try {
      n.disconnect();
    } catch {
      /* noop */
    }
  }
  a.onEnded?.();
}

/**
 * Decode + play a narration WAV with pitch-down processing.
 * Stops any currently-playing narration first (no overlap).
 *
 * Returns the adjusted duration in seconds (for progress/UI).
 */
export async function playNarration(
  arrayBuffer: ArrayBuffer,
  opts: {
    playbackRate?: number;
    lowpassHz?: number;
    gravel?: number;
    onEnded?: () => void;
    onProgress?: (p: number) => void;
  }
): Promise<number> {
  const c = getContext();
  if (!c) throw new Error("audio context unavailable");

  // stop whatever is currently playing — guarantees single voice
  stopNarration();
  await resumeNarrationContext();

  const buffer = await c.decodeAudioData(arrayBuffer.slice(0));
  const rate = opts.playbackRate ?? 0.6;

  const source = c.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = opts.lowpassHz ?? 2200;
  filter.Q.value = 0.7;

  const shaper = c.createWaveShaper();
  shaper.curve = gravelCurve(opts.gravel ?? 3);
  shaper.oversample = "2x";

  const gain = c.createGain();
  gain.gain.value = 1.0;

  source.connect(filter);
  filter.connect(shaper);
  shaper.connect(gain);
  gain.connect(c.destination);

  const nodes: AudioNode[] = [source, filter, shaper, gain];
  const bufferDur = buffer.duration / rate;

  const a: Active = {
    source,
    nodes,
    startTime: c.currentTime,
    bufferDur,
    raf: 0,
    onEnded: opts.onEnded,
    onProgress: opts.onProgress,
  };
  active = a;

  source.onended = () => {
    // only react if this is still the active narration
    if (active !== a) return;
    active = null;
    cancelAnimationFrame(a.raf);
    for (const n of nodes) {
      try {
        n.disconnect();
      } catch {
        /* noop */
      }
    }
    a.onProgress?.(1);
    a.onEnded?.();
  };

  // progress loop
  const tick = () => {
    if (active !== a) return;
    const elapsed = c.currentTime - a.startTime;
    const p = Math.min(1, elapsed / a.bufferDur);
    a.onProgress?.(p);
    a.raf = requestAnimationFrame(tick);
  };
  a.raf = requestAnimationFrame(tick);

  source.start();
  return bufferDur;
}
