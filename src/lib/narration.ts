"use client";

import { create } from "zustand";
import { audio } from "@/lib/audio";

/**
 * Voiceover / narration state.
 *
 * - `voiceoverOn`: whether the visitor wants the male narration at all
 *   (independent of the ambient-audio toggle). Persisted to localStorage.
 * - `current`: the id of the passage currently playing, so only one
 *   narration speaks at a time.
 *
 * Narration only ever plays when BOTH the ambient audio is enabled (the
 * visitor opted into investigation audio) AND voiceoverOn is true. This
 * preserves the no-autoplay rule.
 */

const VO_KEY = "td-voiceover";

function loadVo(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(VO_KEY) === "1";
  } catch {
    return false;
  }
}

type NarrationState = {
  voiceoverOn: boolean;
  current: string | null;
  loading: boolean;
  setVoiceover: (v: boolean) => void;
  toggleVoiceover: () => void;
  setCurrent: (id: string | null) => void;
  setLoading: (v: boolean) => void;
};

export const useNarration = create<NarrationState>((set, get) => ({
  voiceoverOn: loadVo(),
  current: null,
  loading: false,
  setVoiceover: (v) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(VO_KEY, v ? "1" : "0");
      } catch {
        /* noop */
      }
    }
    set({ voiceoverOn: v });
    if (!v) get().setCurrent(null);
  },
  toggleVoiceover: () => get().setVoiceover(!get().voiceoverOn),
  setCurrent: (id) => {
    // stopping any narration also ducking is handled by the hook
    set({ current: id, loading: id !== null && get().current !== id });
  },
  setLoading: (v) => set({ loading: v }),
}));

/**
 * Is narration allowed right now? Ambient audio enabled AND voiceover on.
 */
export function narrationAllowed(): boolean {
  return audio.isEnabled() && useNarration.getState().voiceoverOn;
}
