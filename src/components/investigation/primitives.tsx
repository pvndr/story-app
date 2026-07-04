"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { audio } from "@/lib/audio";
import { atmos, slotHash } from "@/lib/investigation-random";

/* ---------- Paper sheet ---------- */
export function Paper({
  children,
  className = "",
  dark = false,
  ruled = false,
  grain = true,
  deckle = true,
  style,
}: {
  children?: ReactNode;
  className?: string;
  dark?: boolean;
  ruled?: boolean;
  grain?: boolean;
  deckle?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative ${dark ? "paper-dark" : "paper"} foxing ${
        ruled ? "ruled" : ""
      } ${grain ? "grain" : ""} ${deckle ? "deckle" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ---------- Section label ---------- */
export function SectionLabel({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3 font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--beige)]/70">
      <span className="text-[var(--rust)]">{index}</span>
      <span className="h-px flex-1 bg-[rgba(205,191,156,0.18)]" />
      <span>{title}</span>
    </div>
  );
}

/* ---------- Handwritten margin annotation ---------- */
export function Handwritten({
  children,
  className = "",
  rotate = -3,
  color = "var(--blood)",
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  color?: string;
}) {
  return (
    <span
      className={`font-[family-name:var(--font-hand)] ink-hand ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        color,
        display: "inline-block",
        fontStyle: "normal",
      }}
    >
      {children}
    </span>
  );
}

/* ---------- Coffee / water stain ---------- */
export function CoffeeStain({
  size = 140,
  top = "10%",
  left = "70%",
  opacity = 0.7,
  old = false,
  className = "",
}: {
  size?: number;
  top?: string | number;
  left?: string | number;
  opacity?: number;
  old?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`stain ${old ? "old" : ""} pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        top,
        left,
        opacity,
      }}
    />
  );
}

/* ---------- Paper clip ---------- */
export function PaperClip({
  top = "4%",
  left = "8%",
  rotate = -12,
  className = "",
}: {
  top?: string | number;
  left?: string | number;
  rotate?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ top, left, transform: `rotate(${rotate}deg)` }}
      width="34"
      height="60"
      viewBox="0 0 34 60"
      fill="none"
    >
      <path
        d="M10 4 C10 2 12 1 14 1 L20 1 C22 1 24 3 24 5 L24 48 C24 52 21 55 17 55 C13 55 10 52 10 48 L10 14 C10 11 12 9 15 9 C18 9 20 11 20 14 L20 42"
        stroke="#9a8a5a"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M10 4 C10 2 12 1 14 1 L20 1 C22 1 24 3 24 5 L24 48 C24 52 21 55 17 55 C13 55 10 52 10 48 L10 14 C10 11 12 9 15 9 C18 9 20 11 20 14 L20 42"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        transform="translate(0.5,0.8)"
      />
    </svg>
  );
}

/* ---------- Sticky note ---------- */
/* A real sticky note: one edge (the taped/stuck top) lies flat, the opposite
 * edge lifts slightly with a directional shadow cast by the desk lamp. */
export function StickyNote({
  children,
  top = "8%",
  right,
  left,
  rotate = 4,
  color = "#d9c873",
  className = "",
  width = 150,
}: {
  children: ReactNode;
  top?: string | number;
  right?: string | number;
  left?: string | number;
  rotate?: number;
  color?: string;
  className?: string;
  width?: number;
}) {
  return (
    <div
      className={`absolute z-20 font-[family-name:var(--font-hand)] ink-hand ${className}`}
      style={{
        top,
        right,
        left,
        width,
        transform: `rotate(${rotate}deg)`,
        background: `linear-gradient(180deg, ${color} 0%, ${shade(color, -8)} 100%)`,
        color: "#3a2f1c",
        padding: "10px 12px 14px",
        fontSize: "15px",
        lineHeight: 1.25,
        /* the stuck top edge is sharp; the bottom lifts — directional shadow */
        boxShadow:
          "0 1px 1px rgba(0,0,0,0.3), 2px 5px 9px rgba(0,0,0,0.45), 4px 9px 16px rgba(0,0,0,0.25)",
        /* a slight upward curl at the bottom-right corner */
        clipPath:
          "polygon(0 0, 100% 0, 100% 92%, 94% 100%, 0 100%)",
      }}
    >
      {children}
      {/* the lifted corner shadow */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: 0,
          bottom: 0,
          width: "26%",
          height: "18%",
          background:
            "linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.18) 100%)",
        }}
      />
    </div>
  );
}

/* darken a hex color by amt (negative) for subtle gradients */
function shade(hex: string, amt: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(m[1], 16) + amt);
  const g = clamp(parseInt(m[2], 16) + amt);
  const b = clamp(parseInt(m[3], 16) + amt);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/* ---------- Redaction ---------- */
export function Redact({ w }: { w: string }) {
  return <span className="redact">{w}</span>;
}

/* ---------- Scroll reveal — physical, not mechanical ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  rotate = 0,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  rotate?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-12% 0px -12% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, rotate, filter: "blur(6px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }
          : { opacity: 0, y, rotate, filter: "blur(6px)" }
      }
      transition={{ duration: 1.1, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Interactive button that feels like pressing paper ---------- */
export function PaperButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => {
        audio.click();
        onClick?.();
      }}
      className={`group relative inline-flex items-center gap-2 border border-[var(--ink-faded)] bg-transparent px-6 py-3 font-typewriter text-[11px] uppercase tracking-[0.28em] text-[var(--ink)] transition-all duration-300 hover:border-[var(--rust)] hover:text-[var(--rust)] hover:tracking-[0.34em] ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 origin-left scale-x-0 bg-[rgba(138,59,34,0.08)] transition-transform duration-500 group-hover:scale-x-100" />
    </button>
  );
}

/* ---------- Burn mark ---------- */
export function BurnMark({
  size = 90,
  top = "60%",
  left = "10%",
  className = "",
}: {
  size?: number;
  top?: string | number;
  left?: string | number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ top, left, width: size, height: size }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(20,12,4,0.9) 0%, rgba(40,24,10,0.6) 40%, rgba(60,40,20,0.2) 70%, transparent 85%)",
          filter: "blur(1px)",
        }}
      />
    </div>
  );
}

/* ---------- Ink smudge ---------- */
export function InkSmudge({
  size = 60,
  top = "20%",
  left = "70%",
  rotate = 0,
  opacity = 1,
  className = "",
}: {
  size?: number;
  top?: string | number;
  left?: string | number;
  rotate?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`smudge ${className}`}
      style={{
        width: size,
        height: size * 0.7,
        top,
        left,
        transform: `rotate(${rotate}deg)`,
        opacity,
      }}
    />
  );
}

/* ---------- Fingerprint ---------- */
export function Fingerprint({
  size = 36,
  top = "40%",
  left = "30%",
  rotate = 0,
  className = "",
}: {
  size?: number;
  top?: string | number;
  left?: string | number;
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`fingerprint ${className}`}
      style={{
        width: size,
        height: size * 1.3,
        top,
        left,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

/* ---------- Bent corner ---------- */
export function BentCorner({
  corner = "tr",
  className = "",
}: {
  corner?: "tr" | "tl";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`bent-corner ${corner === "tl" ? "bl" : ""} ${className}`}
      style={corner === "tr" ? { top: 0, right: 0 } : { top: 0, left: 0 }}
    />
  );
}

/* ---------- Torn tape ---------- */
export function TornTape({
  width = 120,
  height = 28,
  top = "6%",
  left = "50%",
  rotate = -6,
  className = "",
}: {
  width?: number;
  height?: number;
  top?: string | number;
  left?: string | number;
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`torn-tape ${className}`}
      style={{ width, height, top, left, transform: `rotate(${rotate}deg)` }}
    />
  );
}

/* ---------- Old staple ---------- */
export function Staple({
  top = "4%",
  left = "50%",
  rotate = 0,
  className = "",
}: {
  top?: string | number;
  left?: string | number;
  rotate?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`staple ${className}`}
      style={{ top, left, transform: `rotate(${rotate}deg)` }}
    />
  );
}

/* ---------- Faded ink span ---------- */
export function FadedInk({ children }: { children: ReactNode }) {
  return <span className="faded-ink">{children}</span>;
}

/* ---------- Pencil correction (struck-through) ---------- */
export function PencilCorrect({ children }: { children: ReactNode }) {
  return <span className="pencil-correct">{children}</span>;
}

/* ---------- Hanging paper with a barely-visible flutter ---------- */
export function HangingPaper({
  children,
  rotate = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`paper-flutter ${className}`}
      style={{ ["--rot" as string]: `${rotate}deg`, ...style }}
    >
      {children}
    </div>
  );
}

/* ---------- Physical page-flip wrapper ----------
 * Wraps a section so that on first scroll-into-view the page appears to
 * flip in from the left with curl, thickness shadow, and a paper rustle. */
export function PageFlip({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const played = useRef(false);
  useEffect(() => {
    if (inView && !played.current) {
      played.current = true;
      audio.paper();
    }
  }, [inView]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        animation: inView
          ? `pageFlipIn 1.4s cubic-bezier(0.22,0.7,0.2,1) ${delay}s both`
          : "none",
        transformOrigin: "left center",
        willChange: "transform, opacity",
      }}
    >
      {children}
      {inView && <div className="page-spine" aria-hidden style={{ left: 0 }} />}
    </div>
  );
}

/* ---------- Photo with a flip-to-back writing ---------- */
export function PhotoWithBack({
  src,
  front,
  back,
  rotate = -3,
  width = 140,
  height = 140,
  className = "",
  onFlip,
}: {
  src: string;
  front: string;
  back: string;
  rotate?: number;
  width?: number;
  height?: number;
  className?: string;
  onFlip?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`mag-target group [perspective:1200px] ${className}`}
      style={{ width, height: height + 34 }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 1.0, ease: [0.22, 0.7, 0.2, 1] }}
        style={{ rotate }}
        whileHover={{ rotate: flipped ? rotate : 0, scale: 1.05 }}
        onClick={() => {
          audio.photoPickup();
          onFlip?.();
          setFlipped((v) => !v);
        }}
      >
        {/* front */}
        <div
          className="absolute inset-0 [backface-visibility:hidden]"
          style={{
            background: "#e8dcc0",
            padding: 8,
            paddingBottom: 30,
            boxShadow: "3px 5px 12px rgba(0,0,0,0.6)",
          }}
        >
          { }
          <img
            src={src}
            alt={front}
            loading="lazy"
            className="photo-sharpen h-full w-full object-cover"
          />
          <div className="absolute bottom-1 left-0 right-0 px-2 text-center font-[family-name:var(--font-hand)] text-[12px] text-[var(--ink-soft)]">
            {front}
          </div>
          <div className="absolute right-1 top-1 font-typewriter text-[7px] uppercase tracking-[0.15em] text-[var(--ink-faded)] opacity-60">
            flip ↻
          </div>
        </div>
        {/* back */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{
            background: "#d8cdb0",
            padding: 14,
            boxShadow: "3px 5px 12px rgba(0,0,0,0.6)",
            filter: "sepia(0.15)",
          }}
        >
          <div className="font-[family-name:var(--font-hand)] text-[14px] leading-snug text-[var(--blood)]">
            {back}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Envelope that slides open ---------- */
export function Envelope({
  label,
  contents,
  top = "8%",
  right,
  left,
  rotate = 2,
  width = 180,
  className = "",
}: {
  label: string;
  contents: ReactNode;
  top?: string | number;
  right?: string | number;
  left?: string | number;
  rotate?: number;
  width?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`mag-target absolute z-20 ${className}`}
      style={{ top, right, left, width, transform: `rotate(${rotate}deg)` }}
    >
      <button
        onClick={() => {
          audio.paper();
          setOpen((v) => !v);
        }}
        className={`envelope group relative block w-full text-left ${open ? "open" : ""}`}
        style={{ filter: "sepia(0.18)" }}
      >
        {/* body */}
        <div
          className="relative bg-[#d4c8a0] p-3"
          style={{ boxShadow: "2px 4px 10px rgba(0,0,0,0.5)" }}
        >
          <div className="font-typewriter text-[8px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">
            {label}
          </div>
          {/* flap */}
          <div
            className="envelope-flap absolute left-0 right-0 top-0 z-10 h-1/2"
            style={{
              background: "linear-gradient(180deg,#c9bb88,#d4c8a0)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
          {/* contents revealed */}
          <motion.div
            className="mt-1 overflow-hidden font-[family-name:var(--font-hand)] text-[13px] leading-snug text-[var(--blood)]"
            initial={false}
            animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.9, ease: [0.22, 0.7, 0.2, 1] }}
          >
            <div className="pt-1">{contents}</div>
          </motion.div>
        </div>
      </button>
    </div>
  );
}

/* ---------- Slow, heavy Reveal (page-weight, not a fade) ---------- */
export function RevealHeavy({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotate: -0.6, filter: "blur(8px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 60, rotate: -0.6, filter: "blur(8px)" }
      }
      transition={{ duration: 1.8, delay, ease: [0.18, 0.7, 0.18, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Worn-paper imperfection cluster (random per session) ----------
 * Scatters a handful of small imperfections onto a paper surface. Pass a
 * stable `seedKey` so the same paper keeps its marks within a session but
 * reshuffles across visits. */
export function WearCluster({
  seedKey,
  count = 4,
  className = "",
}: {
  seedKey: string;
  count?: number;
  className?: string;
}) {
  const marks = Array.from({ length: count }).map((_, i) => {
    const k = `${seedKey}-${i}`;
    const kind = Math.floor(slotHash(k + "kind") * 4); // 0 smudge 1 fingerprint 2 stain 3 bent
    return {
      kind,
      top: `${8 + slotHash(k + "t") * 80}%`,
      left: `${6 + slotHash(k + "l") * 86}%`,
      size: 26 + slotHash(k + "s") * 50,
      rotate: (slotHash(k + "r") - 0.5) * 60,
      opacity: 0.4 + slotHash(k + "o") * 0.5,
    };
  });
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {marks.map((m, i) => {
        if (m.kind === 0)
          return <InkSmudge key={i} size={m.size} top={m.top} left={m.left} rotate={m.rotate} opacity={m.opacity} />;
        if (m.kind === 1) return <Fingerprint key={i} size={m.size * 0.7} top={m.top} left={m.left} rotate={m.rotate} />;
        if (m.kind === 2) return <CoffeeStain key={i} size={m.size} top={m.top} left={m.left} opacity={m.opacity * 0.8} />;
        return null;
      })}
    </div>
  );
}

/* ---------- Magnifier-reveal text (hidden until the lens passes over) ----------
 * Children stay invisible/blank until the magnifier hovers; then they fade in.
 * ~1 in 6 are "nothing" on purpose — to reward curiosity without over-promising. */
export function MagReveal({
  children,
  invisible = false,
  sometimesNothing = true,
  seedKey = "m",
  className = "",
}: {
  children: ReactNode;
  invisible?: boolean;
  sometimesNothing?: boolean;
  seedKey?: string;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  // deterministically decide if this slot reveals something or nothing
  const isNothing = sometimesNothing && slotHash(seedKey + "-none") < 0.18;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // listen for the global magnifier-focus event dispatched by the cursor
    const onOver = (e: Event) => {
      const t = e.target as Node;
      if (el.contains(t) || t === el) setRevealed(true);
    };
    const onOut = (e: Event) => {
      const t = e.target as Node;
      if (el.contains(t) || t === el) setRevealed(false);
    };
    document.addEventListener("mag-focus", onOver);
    document.addEventListener("mag-blur", onOut);
    return () => {
      document.removeEventListener("mag-focus", onOver);
      document.removeEventListener("mag-blur", onOut);
    };
  }, []);

  if (isNothing) {
    return <span ref={ref} className={`mag-target ${className}`}>&nbsp;</span>;
  }

  return (
    <span
      ref={ref}
      className={`mag-target ${invisible ? "invisible-ink" : "mag-reveal"} ${
        revealed ? "mag-revealed" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}

