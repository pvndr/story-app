"use client";

import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

/**
 * Floating audio toggle. Starts as "Enable Investigation Audio" prompt;
 * once enabled it becomes a small persistent control. No music ever
 * autoplays.
 */
export default function AudioToggle() {
  const [on, setOn] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    return audio.subscribe((v) => setOn(v));
  }, []);

  const handleToggle = () => {
    audio.toggle();
    setDismissed(true);
    if (!on) audio.cassette();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] select-none">
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
