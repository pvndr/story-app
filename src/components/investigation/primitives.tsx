"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { audio } from "@/lib/audio";

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
      className={`relative ${dark ? "paper-dark" : "paper"} ${
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
      className={`font-[family-name:var(--font-hand)] ${className}`}
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
  className = "",
}: {
  size?: number;
  top?: string | number;
  left?: string | number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`stain pointer-events-none ${className}`}
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
      className={`absolute z-20 font-[family-name:var(--font-hand)] shadow-lg ${className}`}
      style={{
        top,
        right,
        left,
        width,
        transform: `rotate(${rotate}deg)`,
        background: color,
        color: "#3a2f1c",
        padding: "10px 12px",
        fontSize: "15px",
        lineHeight: 1.25,
        boxShadow: "2px 4px 10px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </div>
  );
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
