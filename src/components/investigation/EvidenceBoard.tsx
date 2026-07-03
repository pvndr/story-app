"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionLabel } from "./primitives";
import { audio } from "@/lib/audio";

type ItemId = "victim" | "field" | "tree" | "house" | "witness" | "suspect" | "receipt";

const items: Record<
  ItemId,
  { x: string; y: string; w: number; rotate: number; kind: "photo" | "note" | "map" | "receipt" }
> = {
  victim: { x: "8%", y: "10%", w: 150, rotate: -5, kind: "photo" },
  field: { x: "30%", y: "6%", w: 140, rotate: 3, kind: "photo" },
  tree: { x: "58%", y: "12%", w: 140, rotate: -3, kind: "photo" },
  house: { x: "78%", y: "8%", w: 150, rotate: 4, kind: "photo" },
  witness: { x: "14%", y: "52%", w: 170, rotate: 2, kind: "note" },
  suspect: { x: "44%", y: "48%", w: 130, rotate: -4, kind: "photo" },
  receipt: { x: "72%", y: "54%", w: 150, rotate: 5, kind: "receipt" },
};

// which items connect to which
const links: [ItemId, ItemId][] = [
  ["victim", "field"],
  ["victim", "witness"],
  ["field", "tree"],
  ["tree", "house"],
  ["house", "suspect"],
  ["witness", "suspect"],
  ["suspect", "receipt"],
];

const reveals: Record<ItemId, string> = {
  victim: "Crown of antlers. Same builder. Same hand.",
  field: "Soil matched mile 7. He walked it more than once.",
  tree: "Tire tracks. No vehicle reported. Who drove here?",
  house: "Not on any parish map. Someone erased it.",
  witness: "Two children saw something. They were told to forget.",
  suspect: "Sketched from memory. The witness looked away twice.",
  receipt: "Cord. Rope. Kerosene. Bought together. Paid cash.",
};

export default function EvidenceBoard() {
  const [hovered, setHovered] = useState<ItemId | null>(null);

  const isActive = (id: ItemId) =>
    hovered !== null &&
    (hovered === id || links.some(([a, b]) => (a === hovered && b === id) || (b === hovered && a === id)));

  return (
    <section
      id="evidence-board"
      className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 02" title="Evidence Board" />
        <p className="mb-6 max-w-2xl font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/70">
          Pinned over months. The strings are mine. I do not know which of them
          mean something yet. Hover a photograph.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div
          className="relative grain min-w-[760px]"
          style={{
            minHeight: 620,
            background:
              "radial-gradient(ellipse at 30% 20%, #5a4628 0%, #4a3820 35%, #382a16 75%, #2a2010 100%)",
            boxShadow: "inset 0 0 80px rgba(0,0,0,0.7), 0 20px 50px rgba(0,0,0,0.7)",
          }}
        >
          {/* cork speckle */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(20,12,4,0.6) 0.6px, transparent 1px)",
              backgroundSize: "7px 7px",
            }}
          />

          {/* strings (SVG) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ zIndex: 5 }}
          >
            {links.map(([a, b], i) => {
              const ia = items[a];
              const ib = items[b];
              const active = isActive(a) || isActive(b);
              // approximate centers in px relative to board
              const ax = parseFloat(ia.x) / 100;
              const ay = parseFloat(ia.y) / 100;
              const bx = parseFloat(ib.x) / 100;
              const by = parseFloat(ib.y) / 100;
              // board ref for sizing uses percentage directly
              return (
                <line
                  key={i}
                  x1={`${ax * 100 + 4}%`}
                  y1={`${ay * 100 + 4}%`}
                  x2={`${bx * 100 + 4}%`}
                  y2={`${by * 100 + 4}%`}
                  className="string-path"
                  style={{
                    opacity: active ? 1 : hovered ? 0.2 : 0.55,
                    stroke: active ? "var(--tungsten)" : "var(--rust)",
                    strokeWidth: active ? 2 : 1.3,
                    filter: active
                      ? "drop-shadow(0 0 5px rgba(231,183,102,0.7))"
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              );
            })}
          </svg>

          {/* items */}
          {(
            Object.keys(items) as ItemId[]
          ).map((id) => {
            const it = items[id];
            const active = isActive(id);
            return (
              <BoardItem
                key={id}
                id={id}
                item={it}
                active={active}
                onHover={(h) => {
                  setHovered(h ? id : null);
                  if (h) audio.pencil();
                }}
              />
            );
          })}

          {/* hover reveal note */}
          <motion.div
            className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 px-4"
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            transition={{ duration: 0.4 }}
          >
            {hovered && (
              <div className="bg-[rgba(10,9,7,0.9)] px-4 py-2 font-[family-name:var(--font-hand)] text-[16px] text-[var(--tungsten)]">
                {reveals[hovered]}
              </div>
            )}
          </motion.div>
        </div>
        </div>
      </Reveal>
    </section>
  );
}

function BoardItem({
  id,
  item,
  active,
  onHover,
}: {
  id: ItemId;
  item: { x: string; y: string; w: number; rotate: number; kind: string };
  active: boolean;
  onHover: (h: boolean) => void;
}) {
  return (
    <motion.div
      className="mag-target absolute z-10"
      style={{ left: item.x, top: item.y, width: item.w, rotate: item.rotate }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 40 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
    >
      {/* pin */}
      <div className="pin absolute -top-2 left-1/2 z-20 -translate-x-1/2" />

      {item.kind === "photo" && <PhotoCard id={id} active={active} />}
      {item.kind === "note" && <NoteCard id={id} active={active} />}
      {item.kind === "receipt" && <ReceiptCard id={id} active={active} />}
      {item.kind === "map" && <MapCard id={id} active={active} />}
    </motion.div>
  );
}

function PhotoCard({ id, active }: { id: ItemId; active: boolean }) {
  const src: Partial<Record<ItemId, string>> = {
    victim: "/evidence/polaroid-bayou.png",
    field: "/evidence/polaroid-field.png",
    tree: "/evidence/polaroid-tree.png",
    house: "/evidence/polaroid-house.png",
    suspect: "/evidence/sketch-suspect.png",
  };
  return (
    <div
      className="bg-[#e8dcc0] p-1.5 pb-7"
      style={{
        boxShadow: active
          ? "0 0 22px rgba(231,183,102,0.7), 3px 5px 12px rgba(0,0,0,0.7)"
          : "3px 5px 12px rgba(0,0,0,0.7)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="photo-sharpen relative overflow-hidden" style={{ height: 110 }}>
        { }
        <img
          src={src[id]}
          alt="evidence"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="px-1 pt-1 text-center font-[family-name:var(--font-hand)] text-[12px] text-[var(--ink-soft)]">
        {id}
      </div>
    </div>
  );
}

function NoteCard({ active }: { id: ItemId; active: boolean }) {
  return (
    <div
      className="paper-dark grain relative p-3 font-[family-name:var(--font-hand)] text-[13px] leading-snug text-[var(--ink)]"
      style={{
        width: "100%",
        boxShadow: active
          ? "0 0 22px rgba(231,183,102,0.7), 3px 5px 12px rgba(0,0,0,0.7)"
          : "3px 5px 12px rgba(0,0,0,0.7)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="mb-1 font-typewriter text-[8px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">
        Witness stmt. — partial
      </div>
      “...saw a man near the trees. He waved. Or he was telling us to leave.
      Then he was gone and the light was wrong.”
      <div className="mt-2 text-right text-[11px] opacity-70">— unverified</div>
    </div>
  );
}

function ReceiptCard({ active }: { id: ItemId; active: boolean }) {
  return (
    <div
      className="relative bg-[#d8cdb0] p-2 font-typewriter text-[9px] text-[var(--ink)]"
      style={{
        width: "100%",
        boxShadow: active
          ? "0 0 22px rgba(231,183,102,0.7), 3px 5px 12px rgba(0,0,0,0.7)"
          : "3px 5px 12px rgba(0,0,0,0.7)",
        filter: "sepia(0.25)",
      }}
    >
      <div className="text-center text-[8px] uppercase tracking-[0.15em]">
        Tuttle’s Goods — Jessup
      </div>
      <div className="my-1 border-t border-dashed border-[var(--ink-faded)]" />
      <div className="flex justify-between"><span>cord, hemp</span><span>2.10</span></div>
      <div className="flex justify-between"><span>rope, 50ft</span><span>4.40</span></div>
      <div className="flex justify-between"><span>kerosene</span><span>1.85</span></div>
      <div className="mt-1 border-t border-dashed border-[var(--ink-faded)]" />
      <div className="flex justify-between font-bold"><span>TOTAL</span><span>8.35</span></div>
      <div className="mt-1 text-center text-[7px] uppercase">paid — cash</div>
    </div>
  );
}

function MapCard({ active }: { id: ItemId; active: boolean }) {
  return (
    <div
      className="bg-[#c2b289] p-2 font-typewriter text-[10px] text-[var(--ink)]"
      style={{
        width: "100%",
        boxShadow: active ? "0 0 22px rgba(231,183,102,0.7)" : "3px 5px 12px rgba(0,0,0,0.7)",
      }}
    >
      [map fragment]
    </div>
  );
}
