"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useNarration } from "@/lib/narration";
import { audio } from "@/lib/audio";

/**
 * Narrates a passage when it scrolls into view.
 *
 * Rules:
 *  - Only plays when ambient audio is enabled AND the visitor has turned
 *    voiceover on (the no-autoplay contract).
 *  - Only one narration at a time — requesting a new one stops the previous.
 *  - Plays once per mount (once:true inView).
 *
 * Place this anywhere in a section; it renders a tiny "VOICEOVER" affordance
 * that lights up while speaking, so the visitor understands where the voice
 * is coming from.
 */
export default function NarrationPlayer({
  id,
  text,
  speed = 0.85,
  align = "center",
}: {
  id: string;
  text: string;
  speed?: number;
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
  const audioElRef = useRef<HTMLAudioElement | null>(null);
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
    if (!voiceoverOn && audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
      setCurrent(null);
    }
  }, [voiceoverOn, setCurrent]);

  async function play() {
    setCurrent(id);
    setLoading(true);
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "jam", speed }),
      });
      if (!res.ok) throw new Error(`narrate ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const el = new Audio(url);
      audioElRef.current = el;
      el.volume = 0.9;
      el.onended = () => {
        setCurrent(null);
        setProgress(0);
        URL.revokeObjectURL(url);
        audioElRef.current = null;
      };
      el.ontimeupdate = () => {
        if (el.duration) setProgress(el.currentTime / el.duration);
      };
      setLoading(false);
      await el.play();
    } catch (e) {
      console.error("[narration] failed", e);
      setCurrent(null);
      setLoading(false);
    }
  }

  // manual replay (clicking the affordance)
  function replay() {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
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
