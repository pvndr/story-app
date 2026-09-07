"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionLabel } from "./primitives";
import { audio } from "@/lib/audio";
import { useInvestigation } from "@/lib/investigation-progress";

type Tape = {
  id: string;
  label: string;
  date: string;
  side: string;
  transcript: string[];
};

const tapes: Tape[] = [
  {
    id: "A",
    label: "Interview — Witness I",
    date: "14 Jan 1995",
    side: "Side A",
    transcript: [
      "DET:  State your name for the record.",
      "WIT:  ...I don’t want my name on anything.",
      "DET:  That’s fine. Tell me what you saw.",
      "WIT:  We were by the trees. Me and my brother.",
      "WIT:  There was a man. He had a — a kind of mask. No.",
      "WIT:  He had a face, but it wasn’t a face.",
      "DET:  Take your time.",
      "WIT:  He waved at us. Like he knew us.",
      "WIT:  And then he wasn’t there. And the light was wrong.",
      "DET:  Wrong how?",
      "WIT:  ...The sun had moved. But it hadn’t been long enough.",
      "[ tape ends ]",
    ],
  },
  {
    id: "B",
    label: "Interview — Suspect (preliminary)",
    date: "02 Feb 1995",
    side: "Side A",
    transcript: [
      "DET:  You were seen near the field.",
      "SUS:  I’m near a lot of fields. It’s a parish. There’s fields.",
      "DET:  You drive a truck. Brown. No plates that night.",
      "SUS:  Lots of trucks. Lots of nights.",
      "DET:  You know a man named — ",
      "SUS:  I don’t know that name.",
      "DET:  I didn’t say it yet.",
      "SUS:  ...",
      "SUS:  You all keep digging out here, you’re gonna find things.",
      "SUS:  Not on me. On the ground. The ground’s older than your questions.",
      "[ static — 9 seconds — tape resumes ]",
      "SUS:  You should ask the ones who pray out by the water.",
      "[ tape ends ]",
    ],
  },
  {
    id: "C",
    label: "Field recording — Chapel",
    date: "?? Mar 1995",
    side: "Side B",
    transcript: [
      "[ interior — oiled door, distant wind ]",
      "[ low hum — source unknown ]",
      "RC:   ...It’s clean. Swept. Someone comes here.",
      "RC:   Candle wax at the altar. Fresh. Within the week.",
      "RC:   The cross leans east. It didn’t fall. It was moved.",
      "[ 14 seconds of silence ]",
      "RC:   There’s a drawing scratched into the floor.",
      "RC:   ...It’s the same one. The spiral.",
      "RC:   I’m turning it off now.",
      "[ recorder click ]",
      "[ tape ends ]",
    ],
  },
];

export default function AudioInterviews() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = tapes.find((t) => t.id === activeId) ?? null;
  const collect = useInvestigation((s) => s.collect);

  const play = (t: Tape) => {
    audio.cassette();
    collect(`tape-${t.id}`);
    setActiveId(t.id);
  };

  return (
    <section
      id="interviews"
      className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 05" title="Recorded Interviews" />
        <p className="mb-8 max-w-2xl font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/70">
          Three tapes survived the years. The others were lost — or taken. Pick
          one. Read slowly.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {tapes.map((t) => (
          <Reveal key={t.id}>
            <button
              onClick={() => play(t)}
              className={`mag-target group relative w-full overflow-hidden border p-5 text-left transition ${
                activeId === t.id
                  ? "border-[var(--tungsten)] bg-[var(--charcoal-3)]"
                  : "border-[rgba(205,191,156,0.15)] bg-[var(--charcoal-2)] hover:border-[var(--rust)]"
              }`}
            >
              <Cassette spinning={activeId === t.id} />
              <div className="mt-4 font-typewriter text-[11px] uppercase tracking-[0.15em] text-[var(--beige)]">
                Tape {t.id} — {t.side}
              </div>
              <div className="mt-1 font-typewriter text-[10px] text-[var(--beige)]/60">
                {t.label} · {t.date}
              </div>
              <div className="mt-2 font-typewriter text-[9px] uppercase tracking-[0.2em] text-[var(--rust)]">
                {activeId === t.id ? "▶ now playing" : "▶ play"}
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {/* transcript — keyed so it remounts fresh per tape */}
      {active && (
        <Reveal delay={0.1}>
          <Transcript key={active.id} tape={active} />
        </Reveal>
      )}
    </section>
  );
}

function Transcript({ tape }: { tape: Tape }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lineIdx >= tape.transcript.length) return;
    const line = tape.transcript[lineIdx];
    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(
        tape.transcript.slice(0, lineIdx).join("\n") + "\n" + line.slice(0, i)
      );
      if (Math.random() > 0.3) audio.typewriter();
      if (i < line.length) {
        timer.current = setTimeout(tick, 28 + Math.random() * 50);
      } else {
        const isPause = line.startsWith("[");
        const pause = isPause ? 2200 : 700 + Math.random() * 600;
        timer.current = setTimeout(() => setLineIdx((x) => x + 1), pause);
      }
    };
    tick();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [tape, lineIdx]);

  return (
    <div className="paper grain deckle relative mt-8 min-h-[280px] p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between border-b border-[var(--ink-faded)]/40 pb-2">
        <div className="font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faded)]">
          Transcript — Tape {tape.id}
        </div>
        <div className="flex items-center gap-2 font-typewriter text-[9px] uppercase tracking-[0.2em] text-[var(--rust)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--rust)]" />
          rec
        </div>
      </div>
      <pre
        className="whitespace-pre-wrap font-typewriter text-[13px] leading-relaxed text-[var(--ink)]"
        style={{ fontFamily: "var(--font-typewriter), monospace" }}
      >
        {typed}
        <span className="caret" />
      </pre>
    </div>
  );
}

function Cassette({ spinning }: { spinning: boolean }) {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 150,
        height: 96,
        background: "linear-gradient(180deg,#2a2418,#1a160f)",
        borderRadius: 4,
        boxShadow: "0 4px 10px rgba(0,0,0,0.6)",
      }}
    >
      <div
        className="absolute left-1/2 top-2 h-7 w-[80%] -translate-x-1/2 bg-[#c9b870]"
        style={{ filter: "sepia(0.3)" }}
      />
      <div className="absolute bottom-3 left-3 flex gap-2">
        <Reel spinning={spinning} />
        <Reel spinning={spinning} />
      </div>
      <div className="absolute bottom-2 right-3 h-4 w-8 border border-[rgba(205,191,156,0.3)]" />
    </div>
  );
}

function Reel({ spinning }: { spinning: boolean }) {
  return (
    <div
      className={spinning ? "cassette-spin" : ""}
      style={{ width: 26, height: 26 }}
    >
      <svg width="26" height="26" viewBox="0 0 26 26">
        <circle
          cx="13"
          cy="13"
          r="11"
          fill="#0a0805"
          stroke="#5a4a2a"
          strokeWidth="1"
        />
        <circle cx="13" cy="13" r="3" fill="#5a4a2a" />
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={13 + Math.cos(a) * 7}
              cy={13 + Math.sin(a) * 7}
              r="1.4"
              fill="#1a160f"
            />
          );
        })}
      </svg>
    </div>
  );
}
