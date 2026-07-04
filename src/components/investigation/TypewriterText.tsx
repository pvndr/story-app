"use client";

import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio";

/**
 * Types text out letter-by-letter like a typewriter.
 * Plays a keystroke sound per character when audio is enabled.
 * Calls onDone when finished.
 */
export default function TypewriterText({
  text,
  speed = 70,
  startDelay = 0,
  className = "",
  sound = true,
  bellAtEnd = false,
  onDone,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  sound?: boolean;
  bellAtEnd?: boolean;
  onDone?: () => void;
}) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  const doneCb = useRef(onDone);
  useEffect(() => {
    doneCb.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(() => {
      const step = () => {
        idx.current += 1;
        setOut(text.slice(0, idx.current));
        if (sound && Math.random() > 0.12) audio.typewriter();
        if (idx.current < text.length) {
          const jitter = Math.random() * 40;
          const ch = text[idx.current - 1];
          const pause = ch === " " ? 30 : ch === "." || ch === "," ? 220 : 0;
          timer = setTimeout(step, speed + jitter + pause);
        } else {
          setDone(true);
          if (bellAtEnd) audio.typewriterBell();
          doneCb.current?.();
        }
      };
      step();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay, sound, bellAtEnd]);

  return (
    <span className={`${className} ${!done ? "caret" : ""}`}>{out}</span>
  );
}
