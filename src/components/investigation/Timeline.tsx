"use client";

import { motion } from "framer-motion";
import { Reveal, SectionLabel, BurnMark } from "./primitives";

type Year = {
  year: string;
  status: string;
  note: string;
  artifact?: "burn" | "missing" | "symbol" | "torn";
};

const years: Year[] = [
  {
    year: "1995",
    status: "Case opened",
    note:
      "First body in the cane field. I believed in procedure then. I believed the answer was a matter of work. I was not yet wrong, only early.",
  },
  {
    year: "1996",
    status: "Pattern confirmed",
    note:
      "Two more. The geometry held. The parish did not want to see it. I was told to widen the suspect pool; I was told, in plainer words, to narrow my eyes.",
    artifact: "missing",
  },
  {
    year: "1998",
    status: "Field notes — disturbed",
    note:
      "I stopped sleeping the whole night through. The map on my wall changed and I had not redrawn it. A road that was not there before. I am not certain I am remembering this correctly.",
    artifact: "burn",
  },
  {
    year: "2002",
    status: "File — drawer, unsupervised",
    note:
      "I moved the file to a drawer no one opens. I told myself I was done. I opened it every week. I added nothing. I only read. Then I began to add.",
    artifact: "symbol",
  },
  {
    year: "2012",
    status: "Reopened",
    note:
      "They asked me to look again. I said I would think about it. I had never stopped. I knew I would say yes. I knew before they asked.",
    artifact: "torn",
  },
];

export default function Timeline() {
  return (
    <section
      id="timeline"
      className="relative mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 07" title="Chronology" />
        <p className="mb-10 max-w-2xl font-typewriter text-[12px] leading-relaxed text-[var(--beige)]/70">
          Years, on a string. The investigation did not end. It went quiet. Then
          it came back, the way water comes back.
        </p>
      </Reveal>

      <div className="relative pl-8 sm:pl-12">
        {/* the string */}
        <div
          className="absolute left-[11px] top-2 bottom-2 w-px sm:left-[15px]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, var(--rust) 0 6px, transparent 6px 12px)",
            opacity: 0.6,
          }}
        />

        <div className="space-y-8">
          {years.map((y, i) => (
            <Reveal key={y.year} delay={i * 0.05}>
              <div className="relative">
                {/* knot on the string */}
                <div
                  className="absolute -left-[22px] top-5 h-3 w-3 rounded-full sm:-left-[30px]"
                  style={{
                    background: "var(--rust)",
                    boxShadow: "0 0 0 2px var(--charcoal), 0 0 6px rgba(138,59,34,0.6)",
                  }}
                />

                <motion.div
                  className="paper grain deckle relative p-5 sm:p-6"
                  whileHover={{ y: -2 }}
                  style={{ boxShadow: "0 10px 24px rgba(0,0,0,0.5)" }}
                >
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--ink-faded)]/30 pb-2">
                    <span className="font-serif-d text-3xl text-[var(--ink)]">
                      {y.year}
                    </span>
                    <span className="font-typewriter text-[9px] uppercase tracking-[0.25em] text-[var(--rust)]">
                      {y.status}
                    </span>
                  </div>

                  <p className="font-[family-name:var(--font-hand)] text-[16px] leading-relaxed text-[var(--ink-soft)] sm:text-[17px]">
                    {y.note}
                  </p>

                  {y.artifact === "missing" && (
                    <div className="mt-3 font-typewriter text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">
                      ⟂ 2 pages removed — not by me
                    </div>
                  )}
                  {y.artifact === "burn" && <BurnMark size={70} top="55%" left="78%" />}
                  {y.artifact === "symbol" && (
                    <svg
                      className="absolute right-4 top-4 opacity-60"
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                    >
                      <path
                        d="M20 20 m0 -2 a2 2 0 1 1 0.1 0 m-0.1 0 q0 6 6 6 q9 0 9 -9 q0 -13 -13 -13 q-17 0 -17 17"
                        fill="none"
                        stroke="var(--ink)"
                        strokeWidth="1.4"
                      />
                    </svg>
                  )}
                  {y.artifact === "torn" && (
                    <div
                      className="pointer-events-none absolute bottom-0 right-0 h-12 w-24"
                      style={{
                        background:
                          "linear-gradient(135deg, transparent 50%, var(--charcoal) 50%)",
                      }}
                    />
                  )}
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
