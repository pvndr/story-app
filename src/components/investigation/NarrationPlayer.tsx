"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNarration } from "@/lib/narration";
import { audio } from "@/lib/audio";
import { playNarration, stopNarration, acquireFetchLock, releaseFetchLock } from "@/lib/narration-audio";

/**
 * Narrates a passage when it scrolls into view.
 *
 * Voice: TTS "jam" (only native-English voice), generated at 1.5x speed then
 * played back at `playbackRate` (default 0.6) via an AudioBufferSourceNode —
 * which GUARANTEES a pitch drop of ~7 semitones (child → deep male) while the
 * 1.5×0.6 = 0.9× net tempo stays near-natural. See narration-audio.ts.
 *
 * Rules:
 *  - Only plays when ambient audio is enabled AND voiceover is on (no autoplay).
 *  - Only ONE narration at a time — the controller stops the previous.
 *  - Plays once per mount; replay via the affordance.
 */
export default function NarrationPlayer({
  id,
  text,
  playbackRate = 0.6,
  align = "center",
}: {
  id: string;
  text: string;
  /** buffer playback rate (drops pitch). 0.6 ≈ -7 semitones. */
  playbackRate?: number;
  align?: "left" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const voiceoverOn = useNarration((s) => s.voiceoverOn);
  const current = useNarration((s) => s.current);
  const loading = useNarration((s) => s.loading);
  const setCurrent = useNarration((s) => s.setCurrent);
  const setLoading = useNarration((s) => s.setLoading);
  const [progress, setProgress] = useState(0);
  const playedRef = useRef(false);
  const idRef = useRef(id);
  idRef.current = id;

  const isPlaying = current === id;

  // No auto-trigger — narration only plays on explicit click. This prevents
  // concurrent fetches (which crash the dev server during 7s TTS generation)
  // and gives the visitor control over when to listen.
  // The "replay ▸" button is the sole entry point.

  // if voiceover gets toggled off mid-playback, stop everything
  useEffect(() => {
    if (!voiceoverOn) {
      stopNarration();
      setCurrent(null);
    }
  }, [voiceoverOn, setCurrent]);

  async function play() {
    setCurrent(id);
    setLoading(true);
    setProgress(0);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "jam", speed: 1.5 }),
      });
      if (!res.ok) throw new Error(`narrate ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();

      await playNarration(arrayBuffer, {
        playbackRate,
        onProgress: (p) => setProgress(p),
        onEnded: () => {
          setCurrent(null);
          setProgress(0);
        },
      });
      setLoading(false);
    } catch (e) {
      console.error("[narration] failed", e);
      setCurrent(null);
      setLoading(false);
    } finally {
      releaseFetchLock();
    }
  }

  function replay() {
    acquireFetchLock(); // overrides any existing lock for manual replay
    void play();
  }

  const show = voiceoverOn || isPlaying || loading;

  return (
    <div
      ref={ref}
      className={`pointer-events-auto flex items-center gap-2 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <AnimatePresence>
        {show && (
          <motion.button
            type="button"
            onClick={replay}
            disabled={!voiceoverOn}
            className="group flex items-center gap-2 border border-[rgba(205,191,156,0.18)] bg-[rgba(10,9,7,0.6)] px-2.5 py-1 font-typewriter text-[8px] uppercase tracking-[0.22em] text-[var(--beige)]/70 backdrop-blur-sm transition hover:border-[var(--tungsten)] hover:text-[var(--tungsten)] disabled:opacity-50"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.5 }}
            aria-label="replay narration"
            title={voiceoverOn ? "replay narration" : "enable voiceover first"}
          >
            {/* REC dot */}
            <span className="relative flex h-2 w-2">
              {isPlaying && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--rust)] opacity-60" />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{
                  background: loading
                    ? "var(--beige)"
                    : isPlaying
                    ? "var(--rust)"
                    : "var(--ink-faded)",
                  boxShadow: isPlaying ? "0 0 6px var(--rust)" : "none",
                }}
              />
            </span>
            <span>
              {loading
                ? "voice…"
                : isPlaying
                ? "narrating"
                : voiceoverOn
                ? "replay ▸"
                : "voiceover off"}
            </span>
            {/* progress bar */}
            {isPlaying && (
              <span className="relative block h-[2px] w-12 overflow-hidden bg-[rgba(205,191,156,0.15)]">
                <motion.span
                  className="absolute left-0 top-0 h-full bg-[var(--tungsten)]"
                  style={{ width: `${progress * 100}%` }}
                />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
