"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionLabel, Redact } from "./primitives";
import { audio } from "@/lib/audio";

type Dossier = {
  id: string;
  designation: string;
  name: string;
  sketch: string;
  occupation: string;
  observations: string;
  behavior: string;
  psych: string;
  contradictions: string;
};

const dossiers: Dossier[] = [
  {
    id: "01",
    designation: "Subject 01 — Partner",
    name: "M. H.",
    sketch: "/evidence/sketch-partner.png",
    occupation: "LSP — Criminal Investigations. Family man. Church on Sunday.",
    observations:
      " competent, instinctive, reads a room before it knows it’s being read. Loyal to the job in public; less so in private. His anger is a tool he thinks he controls.",
    behavior:
      " Drinks more than he admits. Keeps two phones. Lies to his wife with the same fluency he uses to take a statement.",
    psych:
      " Believes in a clear line between right and wrong because he needs to. The line moves when he does. He has not noticed.",
    contradictions:
      " Speaks of family as foundation. Filed for separate residence twice — both withdrawn. Speaks of God. Has not prayed alone in years.",
  },
  {
    id: "02",
    designation: "Subject 02 — Person of Interest",
    name: "[ withheld ]",
    sketch: "/evidence/sketch-suspect.png",
    occupation: "Day labor. Seasonal. No fixed employer on record.",
    observations:
      " Present near three scenes by his own admission, then retracted. Knows parish roads by memory, including ones no longer maintained.",
    behavior:
      " Calm under questioning. Too calm. Smiles at the wrong intervals. Does not ask what he is accused of.",
    psych:
      " Either innocent of everything or certain he cannot be caught. I have not met a third kind of man like this.",
    contradictions:
      " Claims he was ‘nowhere near’ the field. His boots were. Claims he knows no one by the name <Redact>. He finished my sentence when I said it.",
  },
  {
    id: "03",
    designation: "Subject 03 — Investigator (self)",
    name: "R. Cohle",
    sketch: "/evidence/sketch-detective.png",
    occupation: "LSP — CID. Homicide. Transferred from Texas.",
    observations:
      " I keep this file because no one else will be honest about me. I do not sleep the way other men sleep. I do not think it is a flaw.",
    behavior:
      " I drink to slow the engine, not to stop it. I have not called anyone ‘friend’ in seven years and not meant it as a warning.",
    psych:
      " I do not believe in the forward motion of time. I believe it is a circle, and we are walked along it. The case will come round. It always does.",
    contradictions:
      " I tell them I want to solve it. What I want is to understand it. Those are not the same thing. I have not told anyone that.",
  },
];

export default function CharacterProfiles() {
  const [open, setOpen] = useState<string | null>("01");

  return (
    <section
      id="profiles"
      className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 06" title="Personnel & Subjects" />
        <p className="mb-8 max-w-2xl font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/70">
          Dossiers. I keep them on everyone — including myself. None of these
          confirm anything. Open a folder.
        </p>
      </Reveal>

      <div className="space-y-4">
        {dossiers.map((d) => {
          const isOpen = open === d.id;
          return (
            <Reveal key={d.id}>
              <div
                className="relative overflow-hidden border border-[rgba(205,191,156,0.18)] bg-[var(--charcoal-2)]"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
              >
                {/* folder tab */}
                <button
                  onClick={() => {
                    audio.drawer();
                    setOpen(isOpen ? null : d.id);
                  }}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--rust)]">
                      {d.designation}
                    </span>
                    <span className="font-serif-d text-lg text-[var(--paper)]">
                      {d.name}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    className="font-typewriter text-[var(--beige)]"
                  >
                    ▸
                  </motion.span>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[160px_1fr] sm:p-7">
                    {/* sketch */}
                    <div className="relative">
                      <div
                        className="bg-[#cdbf9c] p-2"
                        style={{
                          boxShadow: "3px 5px 12px rgba(0,0,0,0.6)",
                          filter: "sepia(0.2) contrast(0.95)",
                        }}
                      >
                        { }
                        <img
                          src={d.sketch}
                          alt="subject sketch"
                          loading="lazy"
                          className="mag-target h-48 w-full object-cover photo-sharpen"
                        />
                        <div className="mt-1 text-center font-typewriter text-[8px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                          sketch — from memory
                        </div>
                      </div>
                      <div className="stamp absolute -right-2 top-2 text-[9px]">
                        Watch
                      </div>
                    </div>

                    {/* fields */}
                    <div className="space-y-3 font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/85">
                      <Row label="Occupation">{d.occupation}</Row>
                      <Row label="Observations">{d.observations}</Row>
                      <Row label="Behavior">{d.behavior}</Row>
                      <Row label="Psychological notes" accent>
                        {d.psych}
                      </Row>
                      <Row label="Contradictions" accent>
                        {d.contradictions}
                      </Row>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="border-l-2 border-[var(--ink-faded)]/40 pl-3">
      <div className="mb-0.5 text-[9px] uppercase tracking-[0.22em] text-[var(--ink-faded)]">
        {label}
      </div>
      <p className={accent ? "text-[var(--tungsten)]/90" : ""}>{children}</p>
    </div>
  );
}
