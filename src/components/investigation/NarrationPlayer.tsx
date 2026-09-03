"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNarration } from "@/lib/narration";
import { audio } from "@/lib/audio";
import { buildNarrationGraph, resumeNarrationContext } from "@/lib/narration-audio";

/**
 * Narrates a passage when it scrolls into view.
 *
 * The voice is the TTS "jam" (the only native-English voice in the catalogue),
 * run through a Web Audio pitch-down + lowpass + gravel chain so it reads as a
 * low, measured, world-weary male rather than a child. See narration-audio.ts.
 *
 * Rules:
 *  - Only plays when ambient audio is enabled AND voiceover is on (no autoplay).
 *  - Only one narration at a time.
 *  - Plays once per mount (once:true inView); replay via the affordance.
 */
export default function NarrationPlayer({
  id,
  text,
  playbackRate = 0.82,
  align = "center",
}: {
  id: string;
  text: string;
  /** playback rate (with preservesPitch=false, this also drops the pitch) */
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
  const graphRef = useRef<ReturnType<typeof buildNarrationGraph> | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const urlRef = useRef<string | null>(null);
  const playedRef = useRef(false);

  const isPlaying = current === id;

  // trigger when in view + allowed
  useEffect(() => {
    if (!inView || playedRef.current) return;
    if (!audio.isEnabled() || !voiceoverOn) return;
    playedRef.current = true;
    void play();
  }, [inView, voiceoverOn]);

  // if voiceover gets toggled off mid-playback, stop
  useEffect(() => {
    if (!voiceoverOn && graphRef.current?.el) {
      graphRef.current.el.pause();
      cleanupRef.current?.();
      cleanupRef.current = null;
      graphRef.current = null;
      setCurrent(null);
    }
  }, [voiceoverOn, setCurrent]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  async function play() {
    setCurrent(id);
    setLoading(true);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "jam", speed: 1.0 }),
      });
      if (!res.ok) throw new Error(`narrate ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;

      const graph = buildNarrationGraph(url, { playbackRate });
      if (!graph) throw new Error("audio graph unavailable");
      graphRef.current = graph;
      cleanupRef.current = graph.cleanup;
      const el = graph.el;

      el.onended = () => {
        setCurrent(null);
        setProgress(0);
        cleanupRef.current?.();
        cleanupRef.current = null;
        graphRef.current = null;
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
          urlRef.current = null;
        }
      };
      el.ontimeupdate = () => {
        if (el.duration) setProgress(el.currentTime / el.duration);
      };
      setLoading(false);
      // ensure the narration AudioContext is running (needs a prior gesture,
      // which the voiceover-enable / replay click provides)
      await resumeNarrationContext();
      await el.play();
    } catch (e) {
      console.error("[narration] failed", e);
      setCurrent(null);
      setLoading(false);
    }
  }

  function replay() {
    if (graphRef.current?.el) {
      graphRef.current.el.pause();
      cleanupRef.current?.();
      cleanupRef.current = null;
      graphRef.current = null;
    }
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
