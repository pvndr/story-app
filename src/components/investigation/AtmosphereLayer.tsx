"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { atmos, rndInt, slotHash } from "@/lib/investigation-random";
import { audio } from "@/lib/audio";

/**
 * Ambient environmental storytelling.
 *
 * Lives behind everything (z-0 / fixed) once the notebook is open. Slow,
 * subtle, never distracting. Every value is gentle and GPU-accelerated
 * (only transform / opacity).
 *
 * Layers:
 *  - floating dust drifting through the lamp light
 *  - gentle cigarette smoke curling across the desk
 *  - random lamp intensity changes every 20–40s
 *  - occasional tape recorder LED blink
 *  - slow shadow shift as the lamp "breathes"
 */
export default function AtmosphereLayer() {
  const dust = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => {
        const k = `dust-${i}`;
        return {
          left: 30 + slotHash(k + "l") * 45, // cluster in the lamp cone
          top: 10 + slotHash(k + "t") * 80,
          size: 1 + slotHash(k + "s") * 2.4,
          dur: 9 + slotHash(k + "d") * 10,
          delay: slotHash(k + "dl") * -12,
          drift: (slotHash(k + "dr") - 0.5) * 60,
          opacity: 0.25 + slotHash(k + "o") * 0.45,
        };
      }),
    []
  );

  // cigarette smoke — a couple of slow rising plumes
  const smoke = useMemo(
    () =>
      Array.from({ length: 2 }).map((_, i) => ({
        left: i === 0 ? 18 : 74,
        top: 78,
        dur: 14 + slotHash(`smoke-${i}`) * 8,
        delay: slotHash(`smoke-${i}-d`) * -16,
        drift: (slotHash(`smoke-${i}-x`) - 0.5) * 80,
        scale: 0.8 + slotHash(`smoke-${i}-s`) * 0.6,
      })),
    []
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      {/* lamp cone — soft volumetric light that breathes */}
      <LampCone />

      {/* dust */}
      {dust.map((d, i) => (
        <motion.span
          key={`d-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: "rgba(231,183,102,0.6)",
            boxShadow: "0 0 4px rgba(231,183,102,0.5)",
          }}
          animate={{
            y: [0, -140, -260],
            x: [0, d.drift, d.drift * 0.6],
            opacity: [0, d.opacity, 0],
          }}
          transition={{
            duration: d.dur,
            delay: d.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* cigarette smoke */}
      {smoke.map((s, i) => (
        <SmokePlume key={`s-${i}`} {...s} />
      ))}

      {/* tape recorder LED */}
      <TapeLed />
    </div>
  );
}

/* ---- lamp cone that breathes + randomly intensifies ---- */
function LampCone() {
  const [intensity, setIntensity] = useState(0.16);
  const breathRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    // gentle continuous breathing
    const breath = () => {
      if (!active) return;
      breathRef.current = requestAnimationFrame(breath);
    };
    breathRef.current = requestAnimationFrame(breath);

    // random intensity changes every 20–40s
    const schedule = () => {
      if (!active) return;
      const wait = rndInt(20000, 40000);
      setTimeout(() => {
        if (!active) return;
        // dip or swell slightly
        const target = 0.12 + Math.random() * 0.1;
        setIntensity(target);
        // very rarely, a subtle distant thunder accompanies a dip
        if (target < 0.135 && Math.random() > 0.6) {
          audio.thunder();
        }
        schedule();
      }, wait);
    };
    schedule();

    return () => {
      active = false;
      cancelAnimationFrame(breathRef.current);
    };
  }, []);

  return (
    <motion.div
      className="absolute left-1/2 top-[-12%] h-[120%] w-[60%] -translate-x-1/2"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(231,183,102,0.22) 0%, rgba(201,149,63,0.08) 35%, transparent 70%)",
        mixBlendMode: "screen",
      }}
      animate={{ opacity: [intensity * 0.85, intensity, intensity * 0.9] }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ---- smoke plume: rises, curls, fades ---- */
function SmokePlume({
  left,
  top,
  dur,
  delay,
  drift,
  scale,
}: {
  left: number;
  top: number;
  dur: number;
  delay: number;
  drift: number;
  scale: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${left}%`, top: `${top}%` }}
      initial={{ opacity: 0 }}
    >
      <motion.div
        style={{
          width: 50 * scale,
          height: 50 * scale,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(180,170,150,0.10) 0%, rgba(180,170,150,0.04) 50%, transparent 70%)",
          filter: "blur(6px)",
        }}
        animate={{
          y: [0, -160, -320],
          x: [0, drift * 0.4, drift],
          opacity: [0, 0.5, 0],
          scale: [0.6, 1.3, 1.8],
        }}
        transition={{
          duration: dur,
          delay,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
}

/* ---- tape recorder LED: blinks occasionally ---- */
function TapeLed() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let active = true;
    const blink = () => {
      if (!active) return;
      setOn((v) => !v);
      const next = on ? rndInt(1800, 4200) : rndInt(120, 360);
      setTimeout(blink, next);
    };
    const start = setTimeout(blink, rndInt(1500, 4000));
    return () => {
      active = false;
      clearTimeout(start);
    };
     
  }, []);
  return (
    <motion.div
      className="absolute"
      style={{
        right: "6%",
        bottom: "8%",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--rust)",
        boxShadow: on ? "0 0 8px var(--rust), 0 0 14px rgba(138,59,34,0.6)" : "none",
        opacity: on ? 1 : 0.15,
      }}
      animate={{ opacity: on ? 1 : 0.15 }}
      transition={{ duration: 0.18 }}
    />
  );
}
