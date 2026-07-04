"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TypewriterText from "./TypewriterText";
import { audio } from "@/lib/audio";

type Phase = "dark" | "lamp" | "cover" | "typing" | "ready" | "opening" | "done";

const TITLE_LINES = ["RUST COHLE", "INVESTIGATION NOTEBOOK", "1995 — 2012"];

export default function Intro({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<Phase>("dark");
  const [step, setStep] = useState(0); // which title line is typing/done
  const [strapOpen, setStrapOpen] = useState(false);

  // schedule the sequence
  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("lamp");
      audio.cassette();
    }, 2600);
    const t2 = setTimeout(() => setPhase("cover"), 3300);
    const t3 = setTimeout(() => setPhase("typing"), 4400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const advance = () => setStep((s) => s + 1);

  useEffect(() => {
    // when all title lines done -> ready
    if (step >= TITLE_LINES.length) {
      const t = setTimeout(() => setPhase("ready"), 600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleStrap = () => {
    if (phase !== "ready" || strapOpen) return;
    setStrapOpen(true);
    audio.strap();
    setTimeout(() => {
      setPhase("opening");
      audio.paper();
    }, 900);
    setTimeout(() => {
      setPhase("done");
      onEnter();
    }, 2400);
  };

  // allow skip on click anywhere during early phases
  const skipAll = () => {
    if (phase === "opening" || phase === "done") return;
    setStep(TITLE_LINES.length);
    setPhase("ready");
  };

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden"
          style={{ background: "#000" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
          onClick={skipAll}
        >
          {/* desk surface */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 65%, #16120c 0%, #0a0805 45%, #000 80%)",
            }}
          />

          {/* lamp light cone */}
          {(phase === "lamp" ||
            phase === "cover" ||
            phase === "typing" ||
            phase === "ready" ||
            phase === "opening") && (
            <div
              className="lamp-flicker absolute left-1/2 top-[-10%] h-[120%] w-[70%] -translate-x-1/2"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(231,183,102,0.22) 0%, rgba(201,149,63,0.10) 30%, transparent 65%)",
                mixBlendMode: "screen",
              }}
            />
          )}

          {/* dust motes */}
          {(phase === "lamp" ||
            phase === "cover" ||
            phase === "typing" ||
            phase === "ready") &&
            Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: `${42 + Math.random() * 16}%`,
                  top: `${30 + Math.random() * 50}%`,
                  width: `${1 + Math.random() * 2.5}px`,
                  height: `${1 + Math.random() * 2.5}px`,
                  background: "rgba(231,183,102,0.5)",
                  animation: `dustFloat ${6 + Math.random() * 8}s linear ${
                    Math.random() * 6
                  }s infinite`,
                }}
              />
            ))}

          {/* notebook cover */}
          {(phase === "cover" ||
            phase === "typing" ||
            phase === "ready" ||
            phase === "opening") && (
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: phase === "opening" ? 0 : 1,
                y: 0,
                rotateX: phase === "opening" ? -75 : 0,
                scale: phase === "opening" ? 1.08 : 1,
              }}
              transition={{
                opacity: { duration: phase === "opening" ? 0.8 : 2.2 },
                y: { duration: 2.2 },
                rotateX: { duration: 1.6, ease: "easeIn" },
                scale: { duration: 1.6 },
              }}
              style={{ transformOrigin: "center bottom", perspective: 1400 }}
            >
              <div
                className="relative grain deckle"
                style={{
                  width: "min(86vw, 720px)",
                  aspectRatio: "1344 / 768",
                  backgroundImage: "url(/evidence/notebook-cover.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow:
                    "0 40px 90px rgba(0,0,0,0.9), 0 0 60px rgba(231,183,102,0.08), inset 0 0 120px rgba(0,0,0,0.55), inset 0 2px 2px rgba(231,183,102,0.12)",
                }}
              >
                {/* worn-leather grain — a fine pebbled noise over the cover */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    opacity: 0.35,
                    mixBlendMode: "overlay",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='lg'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23lg)'/%3E%3C/svg%3E\")",
                  }}
                />
                {/* darken overlay so text is readable, with a lamp hotspot */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 38%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.78) 100%)",
                  }}
                />

                {/* typed title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <div
                    className="font-typewriter text-[var(--tungsten)]"
                    style={{
                      fontSize: "clamp(1.4rem, 5vw, 2.6rem)",
                      letterSpacing: "0.12em",
                      /* debossed into leather: a dark press-shadow below + a
                       * bright top edge catching the lamp light */
                      textShadow:
                        "0 3px 14px rgba(0,0,0,0.95), 0 2px 2px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.6), -1px -1px 0.5px rgba(255,220,150,0.5), 1px -1px 0.5px rgba(255,220,150,0.35)",
                    }}
                  >
                    {phase === "typing" || phase === "ready" || phase === "opening" ? (
                      step >= 1 ? (
                        <div>{TITLE_LINES[0]}</div>
                      ) : (
                        <TypewriterText
                          text={TITLE_LINES[0]}
                          speed={95}
                          sound
                          onDone={advance}
                        />
                      )
                    ) : null}
                  </div>

                  <div
                    className="font-serif-d mt-3 text-[var(--paper)]"
                    style={{
                      fontSize: "clamp(0.85rem, 2.6vw, 1.3rem)",
                      letterSpacing: "0.32em",
                      opacity: 0.92,
                    }}
                  >
                    {step >= 2 ? (
                      <div>{TITLE_LINES[1]}</div>
                    ) : step === 1 ? (
                      <TypewriterText
                        text={TITLE_LINES[1]}
                        speed={75}
                        sound
                        onDone={advance}
                      />
                    ) : null}
                  </div>

                  <div
                    className="font-typewriter mt-2 text-[var(--beige)]"
                    style={{
                      fontSize: "clamp(0.8rem, 2.4vw, 1.1rem)",
                      letterSpacing: "0.28em",
                      opacity: 0.8,
                    }}
                  >
                    {step >= 3 ? (
                      <div>{TITLE_LINES[2]}</div>
                    ) : step === 2 ? (
                      <TypewriterText
                        text={TITLE_LINES[2]}
                        speed={90}
                        sound
                        onDone={advance}
                      />
                    ) : null}
                  </div>

                  {/* confidential stamp + property line */}
                  {step >= TITLE_LINES.length && (
                    <motion.div
                      className="mt-8 flex flex-col items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                    >
                      <div
                        className="font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--beige)]"
                        style={{ opacity: 0.7 }}
                      >
                        Property of Louisiana State Police
                      </div>
                      <div className="stamp text-xs">Confidential</div>
                    </motion.div>
                  )}
                </div>

                {/* leather strap + brass clasp */}
                {phase === "ready" && (
                  <motion.button
                    aria-label="Unlock the notebook strap"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStrap();
                    }}
                    className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: strapOpen ? 0 : 1, y: strapOpen ? 200 : 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* strap body */}
                    <div
                      className="relative h-[150px] w-[58px] -translate-y-2"
                      style={{
                        background:
                          "linear-gradient(180deg, #2a1c10 0%, #3a2614 50%, #241710 100%)",
                        borderRadius: "3px",
                        boxShadow:
                          "0 4px 14px rgba(0,0,0,0.7), inset 0 0 8px rgba(0,0,0,0.6)",
                      }}
                    >
                      {/* brass clasp */}
                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background:
                            "radial-gradient(circle at 35% 30%, #e7b766, #8a5e22 70%, #3a2510)",
                          boxShadow:
                            "0 2px 6px rgba(0,0,0,0.8), inset 0 0 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        <div
                          className="absolute left-1/2 top-1/2 h-[3px] w-[26px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a1c10]"
                          style={{ transform: "translate(-50%,-50%) rotate(35deg)" }}
                        />
                      </div>
                    </div>
                    {/* hint */}
                    <motion.div
                      className="absolute left-1/2 top-[170px] -translate-x-1/2 whitespace-nowrap font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--tungsten)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ◖ click the strap ◗
                    </motion.div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* skip hint */}
          {(phase === "dark" || phase === "lamp" || phase === "cover") && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-typewriter text-[10px] uppercase tracking-[0.3em] text-[rgba(205,191,156,0.3)]">
              click to skip
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
