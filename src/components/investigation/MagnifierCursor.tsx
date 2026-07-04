"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Brass magnifying-glass cursor that ACTUALLY magnifies.
 *
 * Desktop (hover + fine pointer) only. Over `.mag-target` elements the glass
 * shows a scaled-up clone of the element under the cursor, positioned so the
 * point beneath the lens maps to the lens centre — a real optical magnifier,
 * not a glowing ring. The clone is created on enter, reused while hovering,
 * and removed on leave, so it stays cheap.
 *
 * Also dispatches `mag-focus` / `mag-blur` events to `.mag-reveal` /
 * `.invisible-ink` elements so hidden annotations light up under the glass.
 */
const LENS_SIZE = 92; // px — the glass viewport
const RING_SIZE = 116; // px — the brass ring outer
const ZOOM = 1.8;

export default function MagnifierCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const lensContentRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [down, setDown] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  // tracking for the live clone
  const clonedTarget = useRef<HTMLElement | null>(null);
  const targetRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;
    if (!fine) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.body.classList.add("cursor-magnify");

    let lastRevealEl: Element | null = null;

    const buildClone = (target: HTMLElement) => {
      const lens = lensContentRef.current;
      if (!lens) return;
      lens.innerHTML = "";
      const r = target.getBoundingClientRect();
      const clone = target.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      clone.removeAttribute("id");
      // fix the clone to the target's pixel size so it doesn't collapse
      clone.style.position = "absolute";
      clone.style.top = "0px";
      clone.style.left = "0px";
      clone.style.width = `${r.width}px`;
      clone.style.height = `${r.height}px`;
      clone.style.margin = "0";
      clone.style.transformOrigin = "0 0";
      clone.style.transform = `scale(${ZOOM})`;
      clone.style.pointerEvents = "none";
      // carry over computed styles that affect text rendering (font-family)
      // — cloneNode keeps inline styles; computed font is inherited so the
      // clone already renders in the correct font.
      lens.appendChild(clone);
      clonedTarget.current = target;
      targetRect.current = r;
    };

    const clearClone = () => {
      if (lensContentRef.current) lensContentRef.current.innerHTML = "";
      clonedTarget.current = null;
      targetRect.current = null;
    };

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = (el?.closest(".mag-target") as HTMLElement | null) ?? null;

      // rebuild clone only when crossing into a different target
      if (target !== clonedTarget.current) {
        if (target) buildClone(target);
        else clearClone();
      }

      // reveal events for hidden annotations
      const revealEl = el?.closest(".mag-reveal, .invisible-ink") ?? null;
      if (revealEl !== lastRevealEl) {
        if (lastRevealEl)
          lastRevealEl.dispatchEvent(new Event("mag-blur", { bubbles: true }));
        if (revealEl)
          revealEl.dispatchEvent(new Event("mag-focus", { bubbles: true }));
        lastRevealEl = revealEl;
      }
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    // clear clone when leaving the window
    const onLeave = () => clearClone();
    document.addEventListener("mouseleave", onLeave);

    const loop = () => {
      cur.current.x += (pos.current.x - cur.current.x) * 0.22;
      cur.current.y += (pos.current.y - cur.current.y) * 0.22;

      // move the brass ring
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${
          cur.current.x - RING_SIZE / 2
        }px, ${cur.current.y - RING_SIZE / 2 + 18}px, 0)`;
      }
      // move the lens and position the cloned content so the cursor point
      // maps to the lens centre under ZOOM.
      if (lensRef.current) {
        lensRef.current.style.transform = `translate3d(${
          cur.current.x - LENS_SIZE / 2
        }px, ${cur.current.y - LENS_SIZE / 2 + 18}px, 0)`;
        const lens = lensContentRef.current;
        const rect = targetRect.current;
        if (lens && rect && clonedTarget.current) {
          // keep the rect fresh in case of scroll
          const r = clonedTarget.current.getBoundingClientRect();
          targetRect.current = r;
          // offset of the cursor within the target, in unscaled px
          const dx = pos.current.x - r.left;
          const dy = pos.current.y - r.top;
          // we want the point (dx,dy) of the clone to land at lens centre.
          // clone is scaled by ZOOM from origin 0,0, so its point (dx,dy)
          // sits at (dx*ZOOM, dy*ZOOM). To bring it to lens centre:
          const tx = LENS_SIZE / 2 - dx * ZOOM;
          const ty = LENS_SIZE / 2 - dy * ZOOM;
          const clone = lens.firstChild as HTMLElement | null;
          if (clone) {
            clone.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${ZOOM})`;
          }
        }
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
      clearClone();
      document.body.classList.remove("cursor-magnify");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* optical lens — shows a zoomed clone of the hovered mag-target */}
      <div
        ref={lensRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100]"
        style={{
          width: LENS_SIZE,
          height: LENS_SIZE,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid rgba(231,183,102,0.5)",
          boxShadow:
            "0 6px 18px rgba(0,0,0,0.7), inset 0 0 14px rgba(0,0,0,0.55), inset 0 0 4px rgba(231,183,102,0.3)",
          background:
            "radial-gradient(circle at 42% 38%, rgba(231,183,102,0.06), rgba(0,0,0,0.0) 60%)",
          // a subtle glass glare
          backgroundImage:
            "radial-gradient(circle at 38% 32%, rgba(255,250,235,0.22) 0%, rgba(255,250,235,0.05) 18%, transparent 40%)",
        }}
      >
        {/* the live clone is injected here */}
        <div ref={lensContentRef} className="absolute inset-0" />
        {/* chromatic edge — faint fringing like real glass */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(231,183,102,0.35), inset 0 0 6px rgba(94,29,18,0.25)",
          }}
        />
      </div>

      {/* brass ring + handle (sits over the lens edge) */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101]"
        style={{ width: RING_SIZE, height: RING_SIZE, willChange: "transform" }}
      >
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox="0 0 116 116"
          fill="none"
          style={{
            transform: down ? "scale(0.94)" : "scale(1)",
            transition: "transform 0.12s ease",
          }}
        >
          {/* handle */}
          <line
            x1="92"
            y1="92"
            x2="112"
            y2="112"
            stroke="#6b4d1e"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <line
            x1="92"
            y1="92"
            x2="112"
            y2="112"
            stroke="#c9953f"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* brass ring */}
          <circle
            cx="54"
            cy="54"
            r="50"
            stroke="url(#brass2)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="54"
            cy="54"
            r="50"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="1.5"
            fill="none"
          />
          <circle
            cx="54"
            cy="54"
            r="46"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth="1"
            fill="none"
          />
          <defs>
            <linearGradient id="brass2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f0c87a" />
              <stop offset="0.4" stopColor="#9a6f2a" />
              <stop offset="0.7" stopColor="#e7b766" />
              <stop offset="1" stopColor="#7a5820" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}
