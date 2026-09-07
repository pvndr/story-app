"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audio } from "@/lib/audio";
import { useNarration } from "@/lib/narration";

/**
 * Floating audio control. Starts as "Enable Investigation Audio" prompt;
 * once enabled it becomes a small persistent control with a second toggle for
 * the detective's voiceover narration. No audio ever autoplays.
 */
export default function AudioToggle() {
  const [on, setOn] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const voiceoverOn = useNarration((s) => s.voiceoverOn);
  const toggleVoiceover = useNarration((s) => s.toggleVoiceover);

  useEffect(() => {
    return audio.subscribe((v) => setOn(v));
  }, []);

  const handleToggle = () => {
    audio.toggle();
    setDismissed(true);
    if (!on) audio.cassette();
  };

  const handleVoiceover = () => {
    if (!on) {
      // enabling voiceover implicitly enables ambient audio (a gesture)
      audio.toggle();
      setDismissed(true);
    }
    toggleVoiceover();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex select-none flex-col items-end gap-2">
      {/* voiceover sub-toggle — appears once ambient audio is on */}
      <AnimatePresence>
        {on && (
          <motion.button
            onClick={handleVoiceover}
            aria-pressed={voiceoverOn}
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.4 }}
            className="group flex items-center gap-2 border border-[rgba(205,191,156,0.18)] bg-[rgba(10,9,7,0.82)] px-3 py-1.5 font-typewriter text-[9px] uppercase tracking-[0.2em] backdrop-blur-sm transition hover:border-[rgba(231,183,102,0.55)]"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.6)" }}
          >
            <span className="relative flex h-2 w-2">
              {voiceoverOn && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--rust)] opacity-60" />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{
                  background: voiceoverOn ? "var(--rust)" : "var(--ink-faded)",
                  boxShadow: voiceoverOn ? "0 0 6px var(--rust)" : "none",
                }}
              />
            </span>
            <span
              className={
                voiceoverOn
                  ? "text-[var(--tungsten)]"
                  : "text-[var(--beige)]/55"
              }
            >
              Voiceover {voiceoverOn ? "On" : "Off"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* main ambient toggle */}
      <button
        onClick={handleToggle}
        aria-pressed={on}
        className="group flex items-center gap-2 border border-[rgba(205,191,156,0.25)] bg-[rgba(10,9,7,0.82)] px-3.5 py-2 font-typewriter text-[11px] uppercase tracking-[0.18em] text-[var(--beige)] backdrop-blur-sm transition hover:border-[rgba(231,183,102,0.55)] hover:text-[var(--tungsten)]"
        style={{ boxShadow: "0 6px 22px rgba(0,0,0,0.6)" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          {on && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--tungsten)] opacity-60" />
          )}
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{
              background: on ? "var(--tungsten)" : "var(--ink-faded)",
              boxShadow: on ? "0 0 8px var(--tungsten)" : "none",
            }}
          />
        </span>
        <span>
          {!dismissed
            ? "Enable Investigation Audio"
            : on
            ? "Audio On"
            : "Audio Off"}
        </span>
      </button>
    </div>
  );
}
