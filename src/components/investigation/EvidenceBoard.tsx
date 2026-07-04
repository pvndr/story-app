"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, SectionLabel, CoffeeStain, InkSmudge } from "./primitives";
import { audio } from "@/lib/audio";
import { useInvestigation } from "@/lib/investigation-progress";
import { atmos } from "@/lib/investigation-random";

type ItemId =
  | "victim"
  | "field"
  | "tree"
  | "house"
  | "witness"
  | "suspect"
  | "receipt";

type ItemDef = {
  x: string;
  y: string;
  w: number;
  rotate: number;
  kind: "photo" | "note" | "map" | "receipt";
  unfoldNote: string;
  backText?: string;
};

const items: Record<ItemId, ItemDef> = {
  victim: {
    x: "8%",
    y: "10%",
    w: 150,
    rotate: -5,
    kind: "photo",
    unfoldNote:
      "Arranged kneeling, hands bound with wire. He took his time. He knew the clearing before he knew her.",
    backText:
      "Recovery 04:52. No soil under the nails. He bathed her after. The posture matters to him.",
  },
  field: {
    x: "30%",
    y: "6%",
    w: 140,
    rotate: 3,
    kind: "photo",
    unfoldNote:
      "Same loam at three sites. Not a route — a parish. He is comfortable in this ground.",
    backText:
      "I walked it twice. The second pass I felt watched. I did not look up. I do not know by what.",
  },
  tree: {
    x: "58%",
    y: "12%",
    w: 140,
    rotate: -3,
    kind: "photo",
    unfoldNote:
      "Bark scored at shoulder height. Someone came back. Not to bury — to sit with it.",
    backText:
      "Tread pattern, GM. No vehicle logged in the parish that week. Someone is missing from the report.",
  },
  house: {
    x: "78%",
    y: "8%",
    w: 150,
    rotate: 4,
    kind: "photo",
    unfoldNote:
      "Platted 1928. Struck from the records in 1962. Buildings do not erase themselves.",
    backText:
      "The foundation predates the parish. Predates the church. Something was here before the name.",
  },
  witness: {
    x: "14%",
    y: "52%",
    w: 170,
    rotate: 2,
    kind: "note",
    unfoldNote:
      "The children drew the same shape from separate rooms. Neither had seen the other's paper.",
  },
  suspect: {
    x: "44%",
    y: "48%",
    w: 130,
    rotate: -4,
    kind: "photo",
    unfoldNote:
      "Composite from two witnesses. They disagreed on the jaw. They agreed on the stillness of him.",
    backText:
      "He looked away when I asked about the church. Then he looked away again when I asked why he looked away.",
  },
  receipt: {
    x: "72%",
    y: "54%",
    w: 150,
    rotate: 5,
    kind: "receipt",
    unfoldNote:
      "Cord, rope, kerosene. Three things that do not belong together unless you are preparing. He was preparing.",
  },
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

const photoSrc: Partial<Record<ItemId, string>> = {
  victim: "/evidence/polaroid-bayou.png",
  field: "/evidence/polaroid-field.png",
  tree: "/evidence/polaroid-tree.png",
  house: "/evidence/polaroid-house.png",
  suspect: "/evidence/sketch-suspect.png",
};

const EASE: [number, number, number, number] = [0.22, 0.7, 0.2, 1];

export default function EvidenceBoard() {
  const [hovered, setHovered] = useState<ItemId | null>(null);
  const [selected, setSelected] = useState<ItemId | null>(null);
  const collect = useInvestigation((s) => s.collect);

  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ w: 760, h: 620 });

  // measure board so SVG coordinates + arrow angles stay accurate across
  // the responsive min-w-[760px] surface. Defer setState to satisfy the
  // strict no-synchronous-setState-in-effect rule.
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () =>
      setBoardSize({ w: el.offsetWidth, h: el.offsetHeight });
    const t = window.setTimeout(measure, 0);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  const connectedTo = (id: ItemId): ItemId[] =>
    links.reduce<ItemId[]>((acc, [a, b]) => {
      if (a === id) acc.push(b);
      if (b === id) acc.push(a);
      return acc;
    }, []);

  const isHoverActive = (id: ItemId) =>
    hovered !== null &&
    selected === null &&
    (hovered === id || connectedTo(hovered).includes(id));

  const isSelectedActive = (id: ItemId) =>
    selected !== null &&
    (selected === id || connectedTo(selected).includes(id));

  const isDimmed = (id: ItemId) => selected !== null && !isSelectedActive(id);

  const isLinkActive = (a: ItemId, b: ItemId) =>
    selected !== null && (a === selected || b === selected);

  const isLinkHover = (a: ItemId, b: ItemId) =>
    selected === null && hovered !== null && (a === hovered || b === hovered);

  // endpoint in pixels (matches the existing +4% offset into each item)
  const endpoint = (id: ItemId) => {
    const it = items[id];
    return {
      x: ((parseFloat(it.x) + 4) / 100) * boardSize.w,
      y: ((parseFloat(it.y) + 4) / 100) * boardSize.h,
    };
  };

  // a sagging thread path (catenary approximation) between two pinned points.
  // The control point sits below the midpoint by an amount proportional to the
  // span — gravity pulls real string into a curve, never a straight line.
  const sagPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const span = Math.hypot(b.x - a.x, b.y - a.y);
    const sag = Math.min(46, span * 0.18); // gravity sag in px
    return `M ${a.x} ${a.y} Q ${mx} ${my + sag} ${b.x} ${b.y}`;
  };

  const handleSelect = (id: ItemId) => {
    if (selected === id) {
      audio.click();
      setSelected(null);
      return;
    }
    // committing to a clue — the hidden note unfolds
    audio.paper();
    setSelected(id);
    collect(`board-${id}`);
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // only deselect when the click lands on the board itself, never on a child
    if (e.target === e.currentTarget && selected !== null) {
      audio.click();
      setSelected(null);
    }
  };

  // unfold note anchors near the committed clue, clamped onto the board
  const unfoldPos = (() => {
    if (!selected) return null;
    const it = items[selected];
    const leftNum = parseFloat(it.x);
    const topNum = parseFloat(it.y);
    const isTopRow = topNum < 30;
    return {
      left: `${Math.max(4, Math.min(66, leftNum))}%`,
      top: isTopRow ? `${topNum + 22}%` : `${Math.max(6, topNum - 24)}%`,
    };
  })();

  return (
    <section
      id="evidence-board"
      className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 02" title="Evidence Board" />
        <p className="mb-6 max-w-2xl font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/70">
          Pinned over months. The strings are mine. I do not know which of them
          mean something yet. Click a photograph. Hold it up to the light.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div
            ref={boardRef}
            onClick={handleBoardClick}
            className="relative grain min-w-[760px] cursor-pointer"
            style={{
              minHeight: 620,
              background:
                "radial-gradient(ellipse at 30% 20%, #5a4628 0%, #4a3820 35%, #382a16 75%, #2a2010 100%)",
              boxShadow:
                "inset 0 0 80px rgba(0,0,0,0.7), 0 20px 50px rgba(0,0,0,0.7)",
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

            {/* authentic wear on the cork, sparingly */}
            <CoffeeStain size={120} top="66%" left="2%" opacity={0.4} />
            <InkSmudge size={70} top="40%" left="60%" rotate={-18} opacity={0.55} />

            {/* strings (SVG) — base dashed layer + active draw overlay */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              style={{ zIndex: 5 }}
            >
              {/* base hand-drawn dashed lines (always present) */}
              {links.map(([a, b], i) => {
                const A = endpoint(a);
                const B = endpoint(b);
                const active = isLinkActive(a, b);
                const hover = isLinkHover(a, b);
                const dimmed = selected !== null && !active;
                const op = active
                  ? 0.45
                  : hover
                  ? 1
                  : dimmed
                  ? 0.1
                  : hovered
                  ? 0.3
                  : 0.55;
                return (
                  <path
                    key={`base-${i}`}
                    d={sagPath(A, B)}
                    className="string-path"
                    style={{
                      opacity: op,
                      stroke: hover && !active ? "var(--tungsten-soft)" : "var(--rust)",
                      strokeWidth: hover && !active ? 1.8 : 1.3,
                      transition: "opacity 0.5s ease",
                    }}
                  />
                );
              })}

              {/* active overlay — the glowing thread draws itself via pathLength */}
              {links.map(([a, b], i) => {
                const A = endpoint(a);
                const B = endpoint(b);
                const active = isLinkActive(a, b);
                return (
                  <motion.path
                    key={`draw-${i}`}
                    d={sagPath(A, B)}
                    initial={false}
                    animate={{
                      pathLength: active ? 1 : 0,
                      opacity: active ? 1 : 0,
                    }}
                    transition={{
                      pathLength: { duration: 0.9, ease: EASE },
                      opacity: { duration: 0.4, ease: EASE },
                    }}
                    style={{
                      stroke: "var(--tungsten)",
                      strokeWidth: 2.4,
                      fill: "none",
                      filter: "drop-shadow(0 0 6px rgba(231,183,102,0.85))",
                      willChange: "opacity",
                    }}
                  />
                );
              })}
            </svg>

            {/* handwritten arrowheads at the midpoint of each active string
                (separate HTML layer so rotation stays reliable) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ zIndex: 6 }}
            >
              {links.map(([a, b], i) => {
                const A = endpoint(a);
                const B = endpoint(b);
                const active = isLinkActive(a, b);
                const span = Math.hypot(B.x - A.x, B.y - A.y);
                const sag = Math.min(46, span * 0.18);
                // the arrow sits on the sagging curve, ~at t=0.5 where y = my + sag/2
                const mxPct = ((A.x + B.x) / 2 / boardSize.w) * 100;
                const myPct = ((A.y + B.y) / 2 + sag / 2) / boardSize.h * 100;
                const angle =
                  (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI;
                return (
                  <motion.div
                    key={`arrow-${i}`}
                    className="absolute"
                    style={{ left: `${mxPct}%`, top: `${myPct}%` }}
                    initial={false}
                    animate={{ opacity: active ? 1 : 0 }}
                    transition={{
                      duration: 0.6,
                      delay: active ? 0.7 : 0,
                      ease: EASE,
                    }}
                  >
                    <div
                      style={{
                        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                      }}
                    >
                      <svg
                        width="18"
                        height="12"
                        viewBox="-9 -6 18 12"
                        style={{
                          overflow: "visible",
                          display: "block",
                          filter:
                            "drop-shadow(0 0 3px rgba(231,183,102,0.7))",
                        }}
                      >
                        <path
                          d="M 7 0 L -5 -3.5 L -2 0 L -5 3.5 Z"
                          fill="var(--tungsten)"
                          stroke="var(--tungsten-soft)"
                          strokeWidth="0.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* items */}
            {(Object.keys(items) as ItemId[]).map((id) => {
              const it = items[id];
              return (
                <BoardItem
                  key={id}
                  id={id}
                  item={it}
                  isSelected={selected === id}
                  isActive={isSelectedActive(id)}
                  isDimmed={isDimmed(id)}
                  onSelect={handleSelect}
                  onHover={(h) => {
                    setHovered(h ? id : null);
                    if (h && selected === null) audio.pencil();
                  }}
                />
              );
            })}

            {/* unfold note — hidden marginalia near the committed clue */}
            <AnimatePresence>
              {selected && unfoldPos && (
                <motion.div
                  key={`unfold-${selected}`}
                  className="pointer-events-none absolute z-30 overflow-hidden"
                  style={{ left: unfoldPos.left, top: unfoldPos.top, width: 220 }}
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <div
                    className="paper-dark grain relative px-3 py-2.5 font-[family-name:var(--font-hand)] text-[14px] leading-snug text-[var(--ink)]"
                    style={{
                      boxShadow:
                        "0 10px 24px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.4)",
                      transform: `rotate(${atmos.rotate(
                        `unfold-${selected}`,
                        2
                      )}deg)`,
                    }}
                  >
                    <div className="mb-1 font-typewriter text-[8px] uppercase tracking-[0.22em] text-[var(--ink-faded)]">
                      marginalia — R.C.
                    </div>
                    {items[selected].unfoldNote}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* hover reveal note (only while nothing is committed) */}
            <motion.div
              className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 px-4"
              animate={{
                opacity: hovered && !selected ? 1 : 0,
                y: hovered && !selected ? 0 : 10,
              }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {hovered && !selected && (
                <div className="bg-[rgba(10,9,7,0.9)] px-4 py-2 font-[family-name:var(--font-hand)] text-[16px] text-[var(--tungsten)]">
                  {reveals[hovered]}
                </div>
              )}
            </motion.div>

            {/* deselect hint when a clue is committed */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  key="hint"
                  className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 px-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
                >
                  <div className="bg-[rgba(10,9,7,0.85)] px-3 py-1.5 font-typewriter text-[10px] uppercase tracking-[0.2em] text-[var(--beige)]/70">
                    click the board to set it down
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function BoardItem({
  id,
  item,
  isSelected,
  isActive,
  isDimmed,
  onSelect,
  onHover,
}: {
  id: ItemId;
  item: ItemDef;
  isSelected: boolean;
  isActive: boolean;
  isDimmed: boolean;
  onSelect: (id: ItemId) => void;
  onHover: (h: boolean) => void;
}) {
  // tiny per-session jitter so every visit sits a little differently
  const jitterX = atmos.jitter(`board-${id}-x`, 1.2);
  const jitterY = atmos.jitter(`board-${id}-y`, 0.8);
  const rotJitter = atmos.rotate(`board-${id}-r`, 1.5);
  const baseRotate = item.rotate + rotJitter;

  return (
    <motion.div
      className="mag-target absolute"
      style={{
        left: `calc(${item.x} + ${jitterX}%)`,
        top: `calc(${item.y} + ${jitterY}%)`,
        width: item.w,
        zIndex: isSelected ? 40 : 10,
        willChange: "transform, opacity",
      }}
      initial={{ opacity: 0, y: -20, rotate: baseRotate }}
      whileInView={{ opacity: 1, y: 0, rotate: baseRotate }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: EASE }}
      whileHover={{ scale: isSelected ? 1.04 : 1.08, rotate: 0, zIndex: 40 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={() => onSelect(id)}
    >
      <motion.div
        animate={{ opacity: isDimmed ? 0.32 : 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          willChange: "opacity",
          filter: isDimmed ? "saturate(0.4) brightness(0.78)" : "none",
          position: "relative",
        }}
      >
        {/* tungsten halo when active (committed or directly connected) */}
        <motion.div
          className="pointer-events-none absolute -inset-5"
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(231,183,102,0.42) 0%, rgba(231,183,102,0.12) 45%, transparent 72%)",
            filter: "blur(6px)",
            zIndex: 0,
          }}
        />

        {/* pin */}
        <div className="pin absolute -top-2 left-1/2 z-20 -translate-x-1/2" />

        {/* card */}
        <div className="relative" style={{ zIndex: 10 }}>
          {item.kind === "photo" && (
            <PhotoCard id={id} isSelected={isSelected} isActive={isActive} />
          )}
          {item.kind === "note" && <NoteCard active={isActive} />}
          {item.kind === "receipt" && <ReceiptCard active={isActive} />}
          {item.kind === "map" && <MapCard active={isActive} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhotoCard({
  id,
  isSelected,
  isActive,
}: {
  id: ItemId;
  isSelected: boolean;
  isActive: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const src = photoSrc[id] ?? "";
  const back = items[id].backText ?? "";

  // when the photo is set back down, return it to its face after the
  // deselection visual settles — deferred to avoid synchronous setState
  useEffect(() => {
    if (isSelected) return;
    const t = window.setTimeout(() => setFlipped(false), 520);
    return () => window.clearTimeout(t);
  }, [isSelected]);

  return (
    <div className="[perspective:1200px]" style={{ height: 150 }}>
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 1.0, ease: EASE }}
        style={{ willChange: "transform" }}
      >
        {/* front */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] bg-[#e8dcc0] p-1.5 pb-7"
          style={{
            boxShadow: isSelected
              ? "0 0 28px rgba(231,183,102,0.9), 1px 2px 3px rgba(0,0,0,0.4), 4px 7px 14px rgba(0,0,0,0.65), 8px 14px 26px rgba(0,0,0,0.35)"
              : isActive
              ? "0 0 22px rgba(231,183,102,0.6), 1px 2px 3px rgba(0,0,0,0.4), 4px 7px 14px rgba(0,0,0,0.6)"
              : "1px 2px 3px rgba(0,0,0,0.4), 4px 7px 14px rgba(0,0,0,0.55), 7px 13px 22px rgba(0,0,0,0.3)",
            transition: "box-shadow 0.6s ease",
            /* a faint tonal gradient suggests the photo's edges curl away from the board */
            backgroundImage:
              "linear-gradient(135deg, rgba(0,0,0,0) 80%, rgba(40,28,12,0.12) 100%)",
          }}
        >
          <div
            className="photo-sharpen relative overflow-hidden"
            style={{ height: 104 }}
          >
            <img
              src={src}
              alt="evidence"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="px-1 pt-1 text-center font-[family-name:var(--font-hand)] text-[12px] text-[var(--ink-soft)]">
            {id}
          </div>
          {isSelected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audio.photoPickup();
                setFlipped((v) => !v);
              }}
              className="mag-target absolute right-1 top-1 z-30 border border-[var(--ink-faded)] bg-[var(--paper)] px-1.5 py-0.5 font-typewriter text-[7px] uppercase tracking-[0.12em] text-[var(--ink)]"
              style={{ boxShadow: "1px 2px 4px rgba(0,0,0,0.5)" }}
              aria-label={flipped ? "Turn photo back to front" : "Turn photo over"}
            >
              ↻ {flipped ? "front" : "back"}
            </button>
          )}
        </div>

        {/* back — handwritten note on the verso */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#d8cdb0] p-3"
          style={{
            boxShadow: "3px 5px 12px rgba(0,0,0,0.7)",
            filter: "sepia(0.18)",
          }}
        >
          <div className="mb-1.5 font-typewriter text-[7px] uppercase tracking-[0.22em] text-[var(--ink-faded)]">
            verso — R.C.
          </div>
          <div className="font-[family-name:var(--font-hand)] text-[13px] leading-snug text-[var(--blood)]">
            {back}
          </div>
        </div>
      </motion.div>
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
          ? "0 0 22px rgba(231,183,102,0.6), 3px 5px 12px rgba(0,0,0,0.7)"
          : "3px 5px 12px rgba(0,0,0,0.7)",
        transition: "box-shadow 0.6s ease",
      }}
    >
      <div className="mb-1 font-typewriter text-[8px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">
        Witness stmt. — partial
      </div>
      &ldquo;...saw a man near the trees. He waved. Or he was telling us to leave.
      Then he was gone and the light was wrong.&rdquo;
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
          ? "0 0 22px rgba(231,183,102,0.6), 3px 5px 12px rgba(0,0,0,0.7)"
          : "3px 5px 12px rgba(0,0,0,0.7)",
        filter: "sepia(0.25)",
      }}
    >
      <div className="text-center text-[8px] uppercase tracking-[0.15em]">
        Tuttle&apos;s Goods — Jessup
      </div>
      <div className="my-1 border-t border-dashed border-[var(--ink-faded)]" />
      <div className="flex justify-between">
        <span>cord, hemp</span>
        <span>2.10</span>
      </div>
      <div className="flex justify-between">
        <span>rope, 50ft</span>
        <span>4.40</span>
      </div>
      <div className="flex justify-between">
        <span>kerosene</span>
        <span>1.85</span>
      </div>
      <div className="mt-1 border-t border-dashed border-[var(--ink-faded)]" />
      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>8.35</span>
      </div>
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
        boxShadow: active
          ? "0 0 22px rgba(231,183,102,0.6)"
          : "3px 5px 12px rgba(0,0,0,0.7)",
      }}
    >
      [map fragment]
    </div>
  );
}
