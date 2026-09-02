"use client";

import { motion } from "framer-motion";
import { CoffeeStain, Handwritten, Paper, PaperButton, Reveal } from "./primitives";
import NarrationPlayer from "./NarrationPlayer";

export default function FirstPage({ onContinue }: { onContinue?: () => void }) {
  return (
    <section
      id="first-page"
      className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <div className="relative">
          {/* open notebook spread */}
          <div className="grid grid-cols-1 overflow-hidden md:grid-cols-2">
            {/* LEFT PAGE */}
            <Paper
              className="min-h-[420px] rounded-l-sm p-8 sm:p-12"
              deckle
            >
              {/* center spine shadow */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[rgba(40,28,12,0.45)] to-transparent" />
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-[var(--ink-faded)]">
                  Notebook I
                </div>
                <div className="my-6 h-px w-16 bg-[var(--ink-faded)]/50" />
                {/* small abstract doodle */}
                <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-70">
                  <circle cx="60" cy="60" r="40" fill="none" stroke="var(--ink-soft)" strokeWidth="1.2" />
                  <circle cx="60" cy="60" r="28" fill="none" stroke="var(--ink-soft)" strokeWidth="1" />
                  <circle cx="60" cy="60" r="16" fill="none" stroke="var(--ink-soft)" strokeWidth="0.8" />
                  <path d="M60 20 L62 100 M20 60 L100 62" stroke="var(--ink-soft)" strokeWidth="0.6" />
                </svg>
                <div className="mt-6 font-typewriter text-[11px] tracking-[0.2em] text-[var(--ink-faded)]">
                  1995
                </div>
              </div>
              <CoffeeStain size={120} top="12%" left="14%" opacity={0.5} />
            </Paper>

            {/* RIGHT PAGE */}
            <Paper className="min-h-[420px] rounded-r-sm p-8 sm:p-12" deckle>
              <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-[rgba(40,28,12,0.45)] to-transparent" />
              <Reveal delay={0.2}>
                <div className="relative z-10">
                  <div className="mb-6 font-typewriter text-[10px] uppercase tracking-[0.3em] text-[var(--ink-faded)]">
                    Opening note — undated
                  </div>
                  <div
                    className="font-[family-name:var(--font-hand)] text-[var(--ink)]"
                    style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.4rem)", lineHeight: 1.85 }}
                  >
                    <p className="mb-3">
                      There are places that hold on. They keep the years, the
                      weather, the names no one speaks anymore.
                    </p>
                    <p className="mb-3">
                      I started this notebook because memory is a poor witness.
                      It edits itself. It flatters the teller.
                    </p>
                    <p className="mb-3">
                      What follows is what I could not explain away.
                    </p>
                    <p className="mb-3">
                      I do not know yet if we are hunting a man — or something
                      the land remembers.
                    </p>
                    <p className="mt-5 text-right" style={{ fontSize: "1.2rem" }}>
                      — R.C.
                    </p>
                  </div>

                  {/* margin annotation */}
                  <div className="mt-8">
                    <Handwritten
                      className="text-[15px]"
                      rotate={-2}
                      color="var(--rust)"
                    >
                      don't trust the dates. — r.c.
                    </Handwritten>
                  </div>

                  {/* voiceover — Rust reading his own opening note */}
                  <div className="mt-6">
                    <NarrationPlayer
                      id="first-page"
                      text="There are places that hold on. They keep the years, the weather, the names no one speaks anymore. I started this notebook because memory is a poor witness. It edits itself. It flatters the teller. What follows is what I could not explain away. I do not know yet if we are hunting a man — or something the land remembers."
                      speed={0.82}
                      align="left"
                    />
                  </div>
                </div>
              </Reveal>
              <CoffeeStain size={150} top="70%" left="60%" opacity={0.55} />
              {/* hidden discovery — invisible ink, only the magnifier reveals it */}
              <div className="pointer-events-none absolute bottom-10 right-10 z-20 font-[family-name:var(--font-hand)] text-[14px]">
                <span className="invisible-ink mag-target">
                  the names repeat. every generation.
                </span>
              </div>
            </Paper>
          </div>

          {/* continue button */}
          <motion.div
            className="mt-12 flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <PaperButton onClick={onContinue}>
              Continue Investigation →
            </PaperButton>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
