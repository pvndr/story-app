"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, SectionLabel } from "./primitives";
import { audio } from "@/lib/audio";

type Loc = {
  id: string;
  name: string;
  x: number; // % on map
  y: number;
  polaroid?: string;
  note: string;
  log: string;
  weather: string;
};

const locations: Loc[] = [
  {
    id: "field",
    name: "Cane Field — Mile 7",
    x: 38,
    y: 54,
    polaroid: "/evidence/polaroid-field.png",
    note:
      "Where she was found. The cane had been flattened in a circle. No vehicle came close enough to explain it.",
    log: "02:14 — call from a fisherman. Body confirmed 02:51. No ID on scene.",
    weather: "Overcast. 61°F. Wind off the bayou, southwest, steady.",
  },
  {
    id: "tree",
    name: "The Old Tree",
    x: 52,
    y: 38,
    polaroid: "/evidence/polaroid-tree.png",
    note:
      "A meeting place, or a marker. Tire tracks returned here three separate nights. The soil remembers what the people will not say.",
    log: "Surveillance log — 3 nights. Vehicle present, plates removed. No arrest made.",
    weather: "Fog. Visibility 40ft. Temp falling after dusk.",
  },
  {
    id: "house",
    name: "The House (unmapped)",
    x: 66,
    y: 64,
    polaroid: "/evidence/polaroid-house.png",
    note:
      "It does not appear on parish records older than the 1970s. Neighbors claim it was never there. I have photographs that it was.",
    log: "No record of construction. No deed. No demolition. Tax office: ‘no comment.’",
    weather: "Still. The wind did not move the moss here. It moved everywhere else.",
  },
  {
    id: "church",
    name: "Wayside Chapel",
    x: 28,
    y: 70,
    polaroid: "/evidence/polaroid-church.png",
    note:
      "Abandoned, but the door was oiled recently. Someone comes here. The cross leans east. I do not think it fell on its own.",
    log: "Forced entry — none. Interior swept clean. Candle wax, fresh, at the altar.",
    weather: "Rain the night prior. Ground soft. No footprints leading in.",
  },
  {
    id: "bayou",
    name: "Bayou Crossing",
    x: 78,
    y: 44,
    polaroid: "/evidence/polaroid-bayou.png",
    note:
      "Where the road stops being a road. Children are told not to play past it. The ones who do not listen come back changed.",
    log: "Boat rental records — same name, every summer, since 1981.",
    weather: "Humid. 78°F. Thunder north, not arriving.",
  },
];

export default function LouisianaMap() {
  const [open, setOpen] = useState<Loc | null>(null);

  return (
    <section
      id="map"
      className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 04" title="Parish Map" />
        <p className="mb-8 max-w-2xl font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/70">
          I marked them by hand. Some places matter. I am not yet certain which,
          or why. Click a pin.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div
          className="paper grain deckle relative overflow-hidden p-3 sm:p-5"
          style={{ minHeight: 460 }}
        >
          {/* folded-paper creases */}
          <div className="pointer-events-none absolute inset-0 z-10 opacity-40">
            <div className="absolute left-1/3 top-0 h-full w-px bg-[rgba(60,44,20,0.4)]" />
            <div className="absolute left-2/3 top-0 h-full w-px bg-[rgba(60,44,20,0.4)]" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-[rgba(60,44,20,0.4)]" />
          </div>

          {/* map drawing */}
          <svg
            viewBox="0 0 400 300"
            className="relative z-0 h-full w-full"
            style={{ filter: "sepia(0.2)" }}
          >
            {/* state-ish outline */}
            <path
              d="M40 120 Q60 70 110 60 Q160 50 210 55 Q260 60 310 70 Q350 78 360 100 Q365 130 340 150 Q310 170 290 190 Q260 220 220 235 Q170 250 120 240 Q70 225 50 190 Q35 160 40 120 Z"
              fill="rgba(140,120,80,0.18)"
              stroke="var(--ink-soft)"
              strokeWidth="1.6"
              strokeDasharray="3 2"
            />
            {/* bayou rivers */}
            <path
              d="M70 100 Q120 130 160 110 Q210 85 250 120 Q300 160 330 140"
              fill="none"
              stroke="var(--faded-green)"
              strokeWidth="2"
              opacity="0.6"
            />
            <path
              d="M90 200 Q140 180 180 210 Q230 240 280 215"
              fill="none"
              stroke="var(--faded-green)"
              strokeWidth="1.6"
              opacity="0.5"
            />
            {/* compass */}
            <g transform="translate(340,40)" stroke="var(--ink-soft)" fill="none">
              <circle r="16" strokeWidth="1" />
              <path d="M0 -16 L4 0 L0 16 L-4 0 Z" fill="var(--ink-soft)" />
              <text x="0" y="-20" fontSize="8" textAnchor="middle" fill="var(--ink-soft)" fontFamily="serif">N</text>
            </g>
            {/* parish labels */}
            <text x="120" y="110" fontSize="8" fill="var(--ink-faded)" fontFamily="serif" fontStyle="italic">VERMILION</text>
            <text x="230" y="150" fontSize="8" fill="var(--ink-faded)" fontFamily="serif" fontStyle="italic">ERATH</text>
            <text x="160" y="220" fontSize="8" fill="var(--ink-faded)" fontFamily="serif" fontStyle="italic">IBERIA</text>
          </svg>

          {/* pins */}
          {locations.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                audio.shutter();
                setOpen(l);
              }}
              className="mag-target group absolute z-20 -translate-x-1/2 -translate-y-full"
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
              aria-label={l.name}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.25 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* pin */}
                <svg width="20" height="28" viewBox="0 0 20 28">
                  <path
                    d="M10 0 C4 0 0 4 0 10 C0 18 10 28 10 28 C10 28 20 18 20 10 C20 4 16 0 10 0 Z"
                    fill="var(--rust)"
                    stroke="#3a1408"
                    strokeWidth="1"
                  />
                  <circle cx="10" cy="9" r="3.2" fill="var(--tungsten)" />
                </svg>
                <span className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap font-typewriter text-[8px] uppercase tracking-[0.15em] text-[var(--ink)] opacity-0 transition group-hover:opacity-100">
                  {l.name}
                </span>
              </motion.div>
            </button>
          ))}

          {/* legend */}
          <div className="absolute bottom-3 left-4 z-10 font-typewriter text-[8px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">
            Hand-copied — R. Cohle, 1995–2012 · scale approximate
          </div>
        </div>
      </Reveal>

      {/* detail panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            style={{ background: "rgba(0,0,0,0.85)" }}
          >
            <motion.div
              className="paper grain deckle relative max-w-lg p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 30, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif-d text-xl text-[var(--ink)]">{open.name}</h3>
                <button
                  onClick={() => {
                    audio.cassette();
                    setOpen(null);
                  }}
                  className="font-typewriter text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faded)] hover:text-[var(--rust)]"
                >
                  close ✕
                </button>
              </div>

              {open.polaroid && (
                <div className="mb-4 flex justify-center">
                  <div className="bg-[#e8dcc0] p-2 pb-7" style={{ boxShadow: "3px 5px 12px rgba(0,0,0,0.5)", transform: "rotate(-2deg)" }}>
                    { }
                    <img
                      src={open.polaroid}
                      alt={open.name}
                      className="photo-sharpen h-40 w-40 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 font-typewriter text-[12px] leading-relaxed text-[var(--ink-soft)]">
                <div>
                  <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">Field note</div>
                  <p className="font-[family-name:var(--font-hand)] text-[16px] text-[var(--blood)]">{open.note}</p>
                </div>
                <div>
                  <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">Police log</div>
                  <p>{open.log}</p>
                </div>
                <div>
                  <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">Weather</div>
                  <p>{open.weather}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
