"use client";

/**
 * Narration audio processing graph.
 *
 * The TTS catalogue's only native-English voice ("jam") reads as too young for
 * a world-weary detective. Rather than switch to a Mandarin-voiced voice
 * (which would narrate English with the wrong accent), we keep "jam" and run
 * it through a Web Audio chain that transforms the timbre:
 *
 *   MediaElementSource → lowpass (muffle the high "child" partials, warm it)
 *                     → waveshaper (subtle gravel / dry-throat texture)
 *                     → gain (trim)
 *                     → destination
 *
 * Plus the audio element itself plays with `preservesPitch = false` and a
 * reduced `playbackRate`, which lowers BOTH speed and pitch — the single most
 * effective technique for ageing a voice down into a deep, tired register.
 *
 * The result reads as a low, measured, slightly gravelly male — the closest
 * a TTS voice can get to Rust Cohle without a real voice actor.
 *
 * One shared AudioContext is reused across all narrations (browsers limit the
 * number of contexts). Each narration builds its own graph and tears it down
 * on end.
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
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {
      /* will retry on next gesture */
    });
  }
  return ctx;
}

/** subtle gravel distortion curve (soft asymmetric clip) */
function gravelCurve(amount = 4): Float32Array {
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

export type NarrationGraph = {
  el: HTMLAudioElement;
  cleanup: () => void;
};

/**
 * Ensure the narration AudioContext is running. Must be called after a user
 * gesture (we only call play() after the visitor enables voiceover / clicks
 * replay, so a gesture has occurred).
 */
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

/**
 * Build a processed narration graph around an <audio> element pointing at the
 * given blob URL. Sets preservesPitch=false + playbackRate for pitch-down.
 * Returns the element and a cleanup fn to disconnect the graph.
 */
export function buildNarrationGraph(
  url: string,
  opts?: { playbackRate?: number; lowpassHz?: number; gravel?: number }
): NarrationGraph | null {
  const c = getContext();
  const el = new Audio(url);
  el.volume = 0.92;
  // pitch-down: when preservesPitch is false, a lower playbackRate lowers
  // BOTH speed and pitch — ageing the voice down.
  const rate = opts?.playbackRate ?? 0.82;
  el.playbackRate = rate;
  const preserves = false as const;
  try {
    (el as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch =
      preserves;
    (
      el as HTMLAudioElement & { mozPreservesPitch?: boolean }
    ).mozPreservesPitch = preserves;
    (
      el as HTMLAudioElement & { webkitPreservesPitch?: boolean }
    ).webkitPreservesPitch = preserves;
  } catch {
    /* noop */
  }

  if (!c) {
    // no Web Audio — fall back to plain element playback (still pitch-down)
    return { el, cleanup: () => {} };
  }

  const src = c.createMediaElementSource(el);
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = opts?.lowpassHz ?? 2100;
  filter.Q.value = 0.6;

  const shaper = c.createWaveShaper();
  shaper.curve = gravelCurve(opts?.gravel ?? 4);
  shaper.oversample = "2x";

  const gain = c.createGain();
  gain.gain.value = 1.0;

  src.connect(filter);
  filter.connect(shaper);
  shaper.connect(gain);
  gain.connect(c.destination);

  return {
    el,
    cleanup: () => {
      try {
        gain.disconnect();
        shaper.disconnect();
        filter.disconnect();
        src.disconnect();
      } catch {
        /* noop */
      }
    },
  };
}
