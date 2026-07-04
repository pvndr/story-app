/**
 * Investigation Randomness — controlled, session-seeded.
 *
 * Every visit feels slightly different, but the variation is tiny and
 * atmospheric. A seed is generated once per browser session (per tab) and
 * stored in sessionStorage, so a single visit stays internally consistent
 * while re-opening the archive reshuffles the small details.
 *
 * Uses an xorshift32 PRNG — fast, deterministic, no deps.
 */

const SEED_KEY = "td-investigation-seed";

function loadSeed(): number {
  if (typeof window === "undefined") return 1;
  try {
    const existing = sessionStorage.getItem(SEED_KEY);
    if (existing) {
      const n = parseInt(existing, 10);
      if (!Number.isNaN(n) && n !== 0) return n;
    }
    // new session -> new seed
    const n = (Math.floor(Math.random() * 0x7fffffff) | 1) || 2654435761;
    sessionStorage.setItem(SEED_KEY, String(n));
    return n;
  } catch {
    return 2654435761;
  }
}

let state = loadSeed();

/** Reset the seed (used in tests/dev only). */
export function reseedInvestigation() {
  state = (Math.floor(Math.random() * 0x7fffffff) | 1) || 2654435761;
  try {
    sessionStorage.setItem(SEED_KEY, String(state));
  } catch {
    /* noop */
  }
}

/** Deterministic float in [0,1). */
export function rnd(): number {
  // xorshift32
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  // state can be negative in 32-bit; mask to unsigned
  return ((state >>> 0) % 1000000) / 1000000;
}

/** Integer in [min, max] inclusive. */
export function rndInt(min: number, max: number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

/** Pick a random element. */
export function rndPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

/** Float in [min, max). */
export function rndRange(min: number, max: number): number {
  return min + rnd() * (max - min);
}

/** True with probability p (0..1). */
export function rndChance(p: number): boolean {
  return rnd() < p;
}

/** A small stable id for a slot, so the same slot always gets the same
 *  variation within a session (e.g. a stain at "case-file-corner" stays put
 *  until you re-open the archive). */
export function slot<T>(key: string, values: readonly T[]): T {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = (h >>> 0) % values.length;
  return values[idx];
}

/** Stable numeric hash for a slot key (use to derive positions/rotations). */
export function slotHash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

/** Variation helpers for atmospheric details. */
export const atmos = {
  /** a rotation in a small range, stable per slot */
  rotate: (key: string, deg = 6) => (slotHash(key) - 0.5) * 2 * deg,
  /** a position offset in %, stable per slot */
  jitter: (key: string, pct = 4) => (slotHash(key + "x") - 0.5) * 2 * pct,
  /** a scale variation */
  scale: (key: string, amt = 0.06) => 1 + (slotHash(key + "s") - 0.5) * 2 * amt,
  /** a small opacity variation around a base */
  opacity: (key: string, base: number, amt = 0.12) =>
    Math.max(0, Math.min(1, base + (slotHash(key + "o") - 0.5) * 2 * amt)),
};
