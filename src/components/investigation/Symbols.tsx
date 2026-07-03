"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionLabel } from "./primitives";
import { audio } from "@/lib/audio";

type Sym = {
  name: string;
  draw: React.ReactNode;
  note: string;
};

const symbols: Sym[] = [
  {
    name: "spiral",
    draw: (
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <path
          d="M60 60 m0 -3 a3 3 0 1 1 0.1 0 m-0.1 0 q0 8 8 8 q12 0 12 -12 q0 -18 -18 -18 q-24 0 -24 24 q0 32 32 32 q42 0 42 -42"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
    note:
      "Drawn at every scene. Same hand, same pressure. Not decoration. A signature — or a ward. I do not know which is worse.",
  },
  {
    name: "antlers",
    draw: (
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <g stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M60 95 L60 60" />
          <path d="M60 60 L42 40 L46 26 M42 40 L28 44 L24 32 M28 44 L18 52" />
          <path d="M60 60 L78 40 L74 26 M78 40 L92 44 L96 32 M92 44 L102 52" />
          <path d="M60 70 L48 58 M60 70 L72 58" />
        </g>
      </svg>
    ),
    note:
      "Found on the victims. Worn, not placed. Whoever did this wanted them to wear something older than us.",
  },
  {
    name: "lattice",
    draw: (
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <g stroke="var(--ink)" strokeWidth="1.8" fill="none" strokeLinecap="round">
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`a${i}`} x1={20 + i * 13} y1={20} x2={20 + i * 13} y2={100} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`b${i}`} x1={20} y1={20 + i * 13} x2={100} y2={20 + i * 13} />
          ))}
          <line x1="20" y1="20" x2="100" y2="100" strokeWidth="1.2" />
          <line x1="100" y1="20" x2="20" y2="100" strokeWidth="1.2" />
        </g>
      </svg>
    ),
    note:
      "A trap for the devil, they say. Or an invitation. The geometry does not end where it should.",
  },
  {
    name: "child's drawing",
    draw: (
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <g stroke="var(--blood)" strokeWidth="2.6" fill="none" strokeLinecap="round">
          {/* crude house */}
          <path d="M30 80 L30 50 L60 30 L90 50 L90 80 Z" />
          <path d="M50 80 L50 60 L70 60 L70 80" />
          {/* figure */}
          <circle cx="60" cy="95" r="4" />
          <path d="M60 99 L60 110 M56 104 L64 104" />
          {/* sun with spirals */}
          <circle cx="20" cy="22" r="6" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={20 + Math.cos(a) * 8}
                y1={22 + Math.sin(a) * 8}
                x2={20 + Math.cos(a) * 13}
                y2={22 + Math.sin(a) * 13}
              />
            );
          })}
        </g>
      </svg>
    ),
    note:
      "Found in a schoolbook. The child who drew it does not remember drawing it. The house in the picture has no door.",
  },
  {
    name: "black sun",
    draw: (
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <g stroke="var(--ink)" strokeWidth="2" fill="none">
          <circle cx="60" cy="60" r="20" />
          <circle cx="60" cy="60" r="28" strokeDasharray="2 4" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={60 + Math.cos(a) * 30}
                y1={60 + Math.sin(a) * 30}
                x2={60 + Math.cos(a) * 46}
                y2={60 + Math.sin(a) * 46}
              />
            );
          })}
        </g>
      </svg>
    ),
    note:
      "It appears in the margins of parish records going back further than anyone will admit. Always the same. Always watching.",
  },
  {
    name: "crow",
    draw: (
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <g stroke="var(--ink)" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M30 70 Q45 50 60 62 Q78 50 92 64 L100 70 L88 74 Q70 86 50 78 Z" />
          <path d="M60 62 L58 48 L66 52" />
          <path d="M92 64 L104 56" />
          <path d="M50 78 L44 92 M62 80 L60 94" />
        </g>
      </svg>
    ),
    note:
      "They gather where it happens. Before, not after. As if they were told.",
  },
];

export default function Symbols() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section
      id="symbols"
      className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 03" title="Recurring Imagery" />
        <p className="mb-8 max-w-2xl font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/70">
          These appear and reappear. I have stopped assuming they are
          coincidence. Hover each one.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {symbols.map((s, i) => (
          <Reveal key={s.name} delay={i * 0.08}>
            <motion.div
              className="mag-target group relative aspect-square cursor-default overflow-hidden"
              onMouseEnter={() => {
                setActive(i);
                audio.pencil();
              }}
              onMouseLeave={() => setActive(null)}
              whileHover={{ scale: 1.03 }}
              style={{
                background:
                  "linear-gradient(135deg, var(--paper) 0%, var(--paper-2) 100%)",
                boxShadow:
                  "inset 0 0 30px rgba(60,44,20,0.4), 0 6px 16px rgba(0,0,0,0.5)",
              }}
            >
              <div className="grain absolute inset-0" />
              <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
                {s.draw}
              </div>
              <div className="absolute bottom-2 left-3 z-10 font-typewriter text-[9px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">
                fig. {String(i + 1).padStart(2, "0")} — {s.name}
              </div>

              {/* hover observation */}
              <motion.div
                className="absolute inset-0 z-20 flex items-center justify-center p-5"
                style={{ background: "rgba(20,16,8,0.92)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: active === i ? 1 : 0 }}
                transition={{ duration: 0.35 }}
              >
                <p className="font-[family-name:var(--font-hand)] text-center text-[15px] leading-relaxed text-[var(--tungsten)]">
                  {s.note}
                </p>
              </motion.div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
