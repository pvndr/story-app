"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvestigation, TOTAL_CLUES } from "@/lib/investigation-progress";
import { audio } from "@/lib/audio";

/**
 * Investigation status tracker.
 *
 * A small evidence-tracker widget (NOT a percentage bar) fixed to the lower-left.
 * Shows filled/empty blocks and "N / 27 Clues". Surfaces quietly when a new
 * clue is collected. Hidden until the visitor has opened the notebook.
 */
export default function InvestigationTracker({
  active,
}: {
  active: boolean;
}) {
  const clues = useInvestigation((s) => s.clues);
  const [pulse, setPulse] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const count = clues.size;
  const prevRef = useRef(0);

  useEffect(() => {
    if (count > prevRef.current) {
      // schedule both state updates inside a timer so they are not
      // synchronous setState-in-effect calls
      const t = setTimeout(() => {
        setPulse(true);
        const t2 = setTimeout(() => setPulse(false), 2600);
        // store cleanup on the timeout for the next render
        (t as unknown as { _t2?: ReturnType<typeof setTimeout> })._t2 = t2;
      }, 0);
      return () => {
        clearTimeout(t);
        const t2 = (t as unknown as { _t2?: ReturnType<typeof setTimeout> })._t2;
        if (t2) clearTimeout(t2);
      };
    }
    prevRef.current = count;
  }, [count]);

  if (!active) return null;

  const filled = Math.min(count, TOTAL_CLUES);
  const blocks = Array.from({ length: TOTAL_CLUES }).map((_, i) => i < filled);
  // render blocks in two rows of ~14 for compactness
  const row1 = blocks.slice(0, 14);
  const row2 = blocks.slice(14);

  return (
    <div className="fixed bottom-5 left-5 z-[89] select-none">
      <motion.div
        className="relative border border-[rgba(205,191,156,0.22)] bg-[rgba(10,9,7,0.8)] px-4 py-3 backdrop-blur-sm"
        style={{ boxShadow: "0 6px 22px rgba(0,0,0,0.6)" }}
        animate={{ opacity: dismissed && !pulse ? 0.55 : 1 }}
        whileHover={{ opacity: 1 }}
        onHoverStart={() => setDismissed(false)}
      >
        <div className="mb-1 flex items-center justify-between gap-4">
          <span className="font-typewriter text-[8px] uppercase tracking-[0.28em] text-[var(--beige)]/70">
            Investigation Status
          </span>
          <button
            onClick={() => {
              audio.click();
              setDismissed(true);
            }}
            aria-label="dismiss"
            className="font-typewriter text-[8px] text-[var(--beige)]/40 hover:text-[var(--rust)]"
          >
            ✕
          </button>
        </div>

        <div className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-[var(--beige)]/50">
          Evidence Collected
        </div>

        <div className="mt-1.5 flex gap-[2px]">
          {row1.map((b, i) => (
            <Block key={i} on={b} />
          ))}
        </div>
        <div className="mt-[2px] flex gap-[2px]">
          {row2.map((b, i) => (
            <Block key={i} on={b} />
          ))}
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="font-typewriter text-[11px] tracking-[0.15em] text-[var(--tungsten)]">
            {count} <span className="text-[var(--beige)]/40">/ {TOTAL_CLUES}</span>
          </span>
          <span className="font-typewriter text-[8px] uppercase tracking-[0.2em] text-[var(--beige)]/40">
            Clues
          </span>
        </div>

        {/* new clue pulse */}
        <AnimatePresence>
          {pulse && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap border border-[var(--rust)] bg-[rgba(10,9,7,0.95)] px-2 py-0.5 font-typewriter text-[8px] uppercase tracking-[0.22em] text-[var(--tungsten)]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4 }}
            >
              new clue logged
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Block({ on }: { on: boolean }) {
  return (
    <motion.span
      className="inline-block h-[7px] w-[7px]"
      style={{
        background: on ? "var(--rust)" : "rgba(205,191,156,0.12)",
        boxShadow: on ? "0 0 4px rgba(138,59,34,0.6)" : "none",
      }}
      animate={on ? { opacity: [0.4, 1] } : {}}
      transition={{ duration: 0.5 }}
    />
  );
}
