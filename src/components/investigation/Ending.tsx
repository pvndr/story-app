"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal, SectionLabel } from "./primitives";
import NarrationPlayer from "./NarrationPlayer";
import { audio } from "@/lib/audio";

/* ------------------------------------------------------------------ *
 * ENDING — a slow, silence-driven coda.
 *
 * Phase sequence (times are ms from the moment #ending scrolls in):
 *   page          0       torn page visible, aggressive lamp flicker
 *   cassetteStop  1400    tape stops (audio.cassette); flicker still hard
 *   silence       2800    3.5s of nothing but the flicker dying down
 *   closing       6300    notebook rotateX 0 → -92deg over 1.8s + close sound
 *   darkening     8100    room fades to near-black over 1.6s
 *   lampOnly      9700    single tungsten glow fades in over 1.8s
 *   lampOff       11500   glow fades to black over 0.9s
 *   black         12400   pure black, 2.5s pause
 *   reveal        14900   line-by-line tribute, then hold
 * ------------------------------------------------------------------ */

type Phase =
  | "page"
  | "cassetteStop"
  | "silence"
  | "closing"
  | "darkening"
  | "lampOnly"
  | "lampOff"
  | "black"
  | "reveal";

const EASE: [number, number, number, number] = [0.18, 0.7, 0.18, 1];

export default function Ending() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-30%" }); // Removed once: true so it resets
  const [phase, setPhase] = useState<Phase>("page");
  const [revealedCount, setRevealedCount] = useState(0);

  // Reset the ending animation if the user scrolls back up
  useEffect(() => {
    if (!inView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("page");
      setRevealedCount(0);
    }
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // The desk lamp flickers; then the cassette stops. Silence takes over.
    timers.push(
      setTimeout(() => {
        audio.cassette();
        setPhase("cassetteStop");
      }, 1400)
    );

    // SILENCE — 3.5s of nothing but the faint lamp flicker dying down.
    timers.push(setTimeout(() => setPhase("silence"), 2800));

    // The notebook slowly closes (1.8s rotateX) + notebookClose sound.
    timers.push(
      setTimeout(() => {
        setPhase("closing");
        audio.notebookClose();
      }, 6300)
    );

    // The room becomes dark (~1.6s).
    timers.push(setTimeout(() => setPhase("darkening"), 8100));

    // Only the desk lamp remains — glow fades in (~1.8s).
    timers.push(setTimeout(() => setPhase("lampOnly"), 9700));

    // The lamp switches off — glow fades to black (~0.9s).
    timers.push(setTimeout(() => setPhase("lampOff"), 11500));

    // Fade to black; then 2.5s of pure black silence.
    timers.push(setTimeout(() => setPhase("black"), 12400));

    // Line-by-line reveal — terminal, held. Each line fades in over 1.6s;
    // ~1.4s between beats, with deliberate pauses between the marked ones.
    const revealStart = 14900;
    timers.push(setTimeout(() => setPhase("reveal"), revealStart));
    timers.push(setTimeout(() => setRevealedCount(1), revealStart));
    timers.push(setTimeout(() => setRevealedCount(2), revealStart + 3000)); // pause after L1
    timers.push(setTimeout(() => setRevealedCount(3), revealStart + 4400)); // 1.4s after L2
    timers.push(setTimeout(() => setRevealedCount(4), revealStart + 7400)); // pause after L3
    timers.push(setTimeout(() => setRevealedCount(5), revealStart + 10400)); // pause after L4

    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const flickerActive =
    phase === "page" ||
    phase === "cassetteStop" ||
    phase === "silence" ||
    phase === "closing";

  const flickerClass =
    phase === "silence" || phase === "closing" ? "lamp-flicker" : "hard-flicker";

  const flickerOpacity =
    phase === "closing" ? 0.45 : phase === "silence" ? 0.7 : 1;

  const notebookClosed =
    phase !== "page" && phase !== "cassetteStop" && phase !== "silence";

  const blackOpacity =
    phase === "page" ||
    phase === "cassetteStop" ||
    phase === "silence" ||
    phase === "closing"
      ? 0
      : phase === "darkening" || phase === "lampOnly"
      ? 0.97
      : 1;

  const blackDuration =
    phase === "darkening" ? 1.6 : phase === "lampOff" ? 0.9 : 1.2;

  const lampOpacity = phase === "lampOnly" ? 0.9 : 0;
  const lampDuration = phase === "lampOnly" ? 1.8 : 0.9;

  const revealActive = phase === "reveal";

  return (
    <section
      id="ending"
      ref={ref}
      className="relative mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 sm:py-32"
    >
      {/* aggressive lamp flicker overlay — dies down through silence, fades during closing */}
      {flickerActive && (
        <div
          aria-hidden
          className={`pointer-events-none fixed inset-0 z-30 ${flickerClass}`}
          style={{
            background:
              "radial-gradient(ellipse at 50% 38%, rgba(231,183,102,0.12) 0%, transparent 62%)",
            opacity: flickerOpacity,
            transition: "opacity 1.4s cubic-bezier(0.18,0.7,0.18,1)",
          }}
        />
      )}

      <Reveal>
        <SectionLabel index="FILE 08" title="Final Page" />
      </Reveal>

      <div className="relative mt-8" style={{ perspective: "1400px" }}>
        {/* torn final page — closes via 3D rotateX hinged at the bottom edge */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 0 }}
          animate={{
            opacity: inView ? 1 : 0,
            y: inView ? 0 : 40,
            rotateX: notebookClosed ? -92 : 0,
          }}
          transition={{
            opacity: { duration: 1, ease: EASE },
            y: { duration: 1, ease: EASE },
            rotateX: { duration: 1.8, ease: EASE },
          }}
          style={{ transformOrigin: "center bottom" }}
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
                ████████████████{" "}
                <span className="text-[var(--rust)]">[page torn]</span>
              </p>
              <p className="mb-3">
                ...I do not think there is one of them. I think there are
                many, and they have been patient, and the patience is the
                part that
              </p>
              <p className="text-[var(--ink-faded)]">
                ██████████████████████████████████████
                <br />
                ████████████████████████{" "}
                <span className="text-[var(--rust)]">[page torn]</span>
              </p>
            </div>

            <div className="absolute right-8 top-6">
              <div className="stamp text-[10px]">Unresolved</div>
            </div>

            {/* darkening shadow that falls across the page as it closes */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,9,7,0) 0%, rgba(10,9,7,0.55) 55%, rgba(10,9,7,0.92) 100%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: notebookClosed ? 1 : 0 }}
              transition={{ duration: 1.8, ease: EASE }}
            />
          </div>
        </motion.div>
      </div>

      {/* Black / darkening overlay — covers the whole scene from "darkening" onward */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[95]"
        style={{ background: "#000" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: blackOpacity }}
        transition={{ duration: blackDuration, ease: EASE }}
      />

      {/* Desk-lamp glow — the only light left, then it dies */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[96]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(231,183,102,0.55) 0%, rgba(231,183,102,0.18) 26%, rgba(231,183,102,0.04) 45%, transparent 62%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: lampOpacity }}
        transition={{ duration: lampDuration, ease: EASE }}
      />

      {/* Final reveal — line by line, centered, held */}
      {revealActive && (
        <div className="pointer-events-none fixed inset-0 z-[97] flex items-center justify-center px-6">
          <div className="flex flex-col items-center text-center">
            <motion.p
              className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-[var(--beige)]/70 sm:text-[11px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: revealedCount >= 1 ? 1 : 0,
                y: revealedCount >= 1 ? 0 : 8,
              }}
              transition={{ duration: 1.6, ease: EASE }}
            >
              Inspired by one of television&rsquo;s greatest detective stories.
            </motion.p>

            <motion.h2
              className="mt-12 font-serif-d text-[var(--tungsten)]"
              style={{
                fontSize: "clamp(2.2rem, 8.5vw, 4.75rem)",
                letterSpacing: "0.2em",
                textShadow: "0 0 42px rgba(231,183,102,0.22)",
              }}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{
                opacity: revealedCount >= 2 ? 1 : 0,
                y: revealedCount >= 2 ? 0 : 10,
                filter: revealedCount >= 2 ? "blur(0px)" : "blur(8px)",
              }}
              transition={{ duration: 1.6, ease: EASE }}
            >
              TRUE DETECTIVE
            </motion.h2>

            <motion.p
              className="mt-4 font-typewriter text-[var(--beige)]"
              style={{
                fontSize: "clamp(0.8rem, 2.4vw, 1.05rem)",
                letterSpacing: "0.42em",
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: revealedCount >= 3 ? 1 : 0,
                y: revealedCount >= 3 ? 0 : 6,
              }}
              transition={{ duration: 1.6, ease: EASE }}
            >
              Season One
            </motion.p>

            <motion.p
              className="mt-16 font-[family-name:var(--font-hand)] text-[var(--paper)]/85"
              style={{ fontSize: "clamp(1.15rem, 3.2vw, 1.6rem)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: revealedCount >= 4 ? 1 : 0,
                y: revealedCount >= 4 ? 0 : 8,
              }}
              transition={{ duration: 1.6, ease: EASE }}
            >
              Some stories never leave you.
            </motion.p>

            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: revealedCount >= 4 ? 1 : 0 }}
              transition={{ duration: 1.2, delay: 1 }}
            >
              <NarrationPlayer
                id="ending"
                text="Some stories never leave you. Time leaves marks. Some never fade."
              />
            </motion.div>

            <motion.a
              href="https://www.max.com/shows/true-detective"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={revealedCount >= 5 ? 0 : -1}
              className="group relative mt-14 inline-flex items-center gap-2 border border-[var(--beige)]/40 bg-transparent px-7 py-3.5 font-typewriter text-[11px] uppercase tracking-[0.3em] text-[var(--beige)] transition-all duration-500 hover:border-[var(--rust)] hover:text-[var(--rust)] hover:tracking-[0.36em]"
              style={{ pointerEvents: revealedCount >= 5 ? "auto" : "none" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: revealedCount >= 5 ? 1 : 0,
                y: revealedCount >= 5 ? 0 : 10,
              }}
              transition={{ duration: 1.6, ease: EASE }}
              onClick={() => audio.click()}
            >
              <span className="relative z-10">[ Watch the Series ]</span>
              <span className="absolute inset-0 origin-left scale-x-0 bg-[rgba(138,59,34,0.14)] transition-transform duration-700 group-hover:scale-x-100" />
            </motion.a>
          </div>
        </div>
      )}
    </section>
  );
}
