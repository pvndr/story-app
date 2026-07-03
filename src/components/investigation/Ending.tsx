"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Reveal, SectionLabel } from "./primitives";
import { audio } from "@/lib/audio";

type Phase = "page" | "open" | "lines" | "reveal" | "closing" | "final";

export default function Ending() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30%" });
  const [phase, setPhase] = useState<Phase>("page");

  useEffect(() => {
    if (!inView) return;
    audio.cassette();
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("open"), 1200));
    timers.push(setTimeout(() => setPhase("lines"), 3400));
    timers.push(setTimeout(() => setPhase("reveal"), 7200));
    timers.push(setTimeout(() => {
      setPhase("closing");
      audio.strap();
    }, 11500));
    timers.push(setTimeout(() => setPhase("final"), 13800));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section
      id="ending"
      ref={ref}
      className="relative mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 sm:py-32"
    >
      {/* aggressive lamp flicker overlay during page phase */}
      {phase === "page" && (
        <div
          className="hard-flicker pointer-events-none fixed inset-0 z-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(231,183,102,0.10) 0%, transparent 60%)",
          }}
        />
      )}

      <Reveal>
        <SectionLabel index="FILE 08" title="Final Page" />
      </Reveal>

      <div className="relative mt-8">
        {/* torn final page */}
        <AnimatePresence>
          {phase !== "final" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div
                className="paper grain deckle relative min-h-[420px] p-8 sm:p-12"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 70%, 92% 78%, 100% 86%, 84% 92%, 96% 100%, 0 100%)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
                }}
              >
                {/* torn — half the notes missing */}
                <div className="font-typewriter text-[12px] leading-relaxed text-[var(--ink-soft)]">
                  <p className="mb-3">
                    ...the name I was given does not lead where I was told it
                    would. There is a house behind the name, and behind the
                    house, a field, and behind the field —
                  </p>
                  <p className="mb-3 text-[var(--ink-faded)]">
                    ██████████████████████████████
                    <br />
                    ████████████████ <span className="text-[var(--rust)]">[page torn]</span>
                  </p>
                  <p className="mb-3">
                    ...I do not think there is one of them. I think there are
                    many, and they have been patient, and the patience is the
                    part that
                  </p>
                  <p className="text-[var(--ink-faded)]">
                    ██████████████████████████████████████
                    <br />
                    ████████████████████████ <span className="text-[var(--rust)]">[page torn]</span>
                  </p>
                </div>

                <div className="absolute right-8 top-6">
                  <div className="stamp text-[10px]">Unresolved</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* THE CASE REMAINS OPEN */}
        <AnimatePresence>
          {(phase === "open" ||
            phase === "lines" ||
            phase === "reveal" ||
            phase === "closing") && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: phase === "closing" ? 0 : 1, scale: 1 }}
              transition={{ duration: 1.2 }}
            >
              <h2
                className="font-serif-d text-[var(--tungsten)]"
                style={{
                  fontSize: "clamp(1.8rem, 6vw, 3.4rem)",
                  letterSpacing: "0.1em",
                  textShadow: "0 0 30px rgba(231,183,102,0.3)",
                }}
              >
                THE CASE REMAINS OPEN.
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* poetic lines */}
        <AnimatePresence>
          {(phase === "lines" || phase === "reveal") && (
            <motion.div
              className="mt-10 space-y-3 text-center font-typewriter text-[13px] uppercase tracking-[0.2em] text-[var(--beige)]/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "reveal" ? 0.55 : 1 }}
              transition={{ duration: 1.5 }}
            >
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}>
                Some truths cannot be explained.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}>
                Some stories refuse to end.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the reveal */}
        <AnimatePresence>
          {phase === "reveal" && (
            <motion.div
              className="mt-14 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4 }}
            >
              <p className="mx-auto max-w-xl font-[family-name:var(--font-hand)] text-[18px] leading-relaxed text-[var(--paper)]">
                Close the notebook. Then find out why it was never forgotten.
              </p>
              <motion.p
                className="mt-8 font-typewriter text-[11px] uppercase tracking-[0.25em] text-[var(--beige)]/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.5 }}
              >
                Inspired by the atmosphere of one of television’s
                <br className="hidden sm:block" /> greatest detective stories.
              </motion.p>
              <motion.p
                className="mt-4 font-serif-d text-2xl text-[var(--tungsten)] sm:text-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4, duration: 1.5 }}
                style={{ letterSpacing: "0.08em" }}
              >
                Watch True Detective — Season 1.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* final black screen */}
      <AnimatePresence>
        {phase === "final" && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center"
            style={{ background: "#000" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6 }}
          >
            <motion.p
              className="px-6 text-center font-serif-d text-[var(--beige)]"
              style={{
                fontSize: "clamp(1rem, 3vw, 1.5rem)",
                letterSpacing: "0.12em",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: 1, duration: 2.5 }}
            >
              Time leaves marks.
              <br />
              Some never fade.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
