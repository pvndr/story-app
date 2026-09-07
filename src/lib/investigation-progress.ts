"use client";

import { create } from "zustand";

/**
 * Investigation progress store.
 *
 * Clues register an id when the visitor actually engages with them (opens a
 * map pin, plays a tape, expands a dossier, flips a photo, etc.). The tracker
 * widget then shows the running total out of TOTAL_CLUES.
 *
 * Persisted to sessionStorage so a half-explored visit is remembered, but a
 * fresh session starts the investigation over.
 */

const STORAGE_KEY = "td-investigation-clues";
export const TOTAL_CLUES = 27;

type ProgressState = {
  clues: Set<string>;
  collect: (id: string) => void;
  reset: () => void;
  count: () => number;
};

function loadClues(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveClues(s: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(s)));
  } catch {
    /* noop */
  }
}

export const useInvestigation = create<ProgressState>((set, get) => ({
  clues: loadClues(),
  collect: (id) => {
    const s = get().clues;
    if (s.has(id)) return;
    const next = new Set(s);
    next.add(id);
    saveClues(next);
    set({ clues: next });
  },
  reset: () => {
    const empty = new Set<string>();
    saveClues(empty);
    set({ clues: empty });
  },
  count: () => get().clues.size,
}));
