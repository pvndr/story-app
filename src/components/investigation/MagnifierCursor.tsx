"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Brass magnifying-glass cursor.
 * Desktop (hover+fine pointer) only. On touch devices the native cursor stays.
 * Follows the pointer with slight inertia. Over `.mag-target` elements the
 * glass brightens and the underlying element receives a focus class.
 */
export default function MagnifierCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [focused, setFocused] = useState(false);
  const [down, setDown] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!fine) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.body.classList.add("cursor-magnify");

    let lastRevealEl: Element | null = null;
    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isTarget = !!el?.closest(".mag-target");
      setFocused(isTarget);
      // dispatch focus/blur to the .mag-reveal element under the lens so
      // hidden annotations / invisible ink light up.
      const revealEl = el?.closest(".mag-reveal, .invisible-ink");
      if (revealEl !== lastRevealEl) {
        if (lastRevealEl) {
          lastRevealEl.dispatchEvent(new Event("mag-blur", { bubbles: true }));
        }
        if (revealEl) {
          revealEl.dispatchEvent(new Event("mag-focus", { bubbles: true }));
        }
        lastRevealEl = revealEl;
      }
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const loop = () => {
      cur.current.x += (pos.current.x - cur.current.x) * 0.22;
      cur.current.y += (pos.current.y - cur.current.y) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${
          cur.current.x - 26
        }px, ${cur.current.y - 26}px, 0)`;
      }
      if (lensRef.current) {
        lensRef.current.style.transform = `translate3d(${
          cur.current.x - 17
        }px, ${cur.current.y - 17}px, 0)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf.current);
      document.body.classList.remove("cursor-magnify");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* glass lens */}
      <div
        ref={lensRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-[34px] w-[34px] rounded-full transition-[background,box-shadow] duration-200"
        style={{
          background: focused
            ? "radial-gradient(circle at 40% 35%, rgba(231,183,102,0.18), rgba(231,183,102,0.04) 70%)"
            : "radial-gradient(circle at 40% 35%, rgba(205,191,156,0.10), rgba(0,0,0,0.04) 70%)",
          border: "1px solid rgba(231,183,102,0.35)",
          boxShadow: focused
            ? "0 0 14px rgba(231,183,102,0.35), inset 0 0 8px rgba(231,183,102,0.25)"
            : "0 2px 6px rgba(0,0,0,0.5), inset 0 0 6px rgba(0,0,0,0.3)",
        }}
      />
      {/* brass ring + handle */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] h-[52px] w-[52px]"
        style={{ willChange: "transform" }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          style={{
            transform: down ? "scale(0.92)" : "scale(1)",
            transition: "transform 0.12s ease",
          }}
        >
          <line
            x1="40"
            y1="40"
            x2="50"
            y2="50"
            stroke="#8a6a2e"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="40"
            y1="40"
            x2="50"
            y2="50"
            stroke="#c9953f"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="url(#brass)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth="1"
            fill="none"
          />
          <defs>
            <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e7b766" />
              <stop offset="0.5" stopColor="#9a6f2a" />
              <stop offset="1" stopColor="#d9a84a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}
