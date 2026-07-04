"use client";

import { motion } from "framer-motion";
import {
  CoffeeStain,
  Envelope,
  InkSmudge,
  PaperClip,
  PaperButton,
  PhotoWithBack,
  Redact,
  Reveal,
  SectionLabel,
  Staple,
  StickyNote,
  TornTape,
  WearCluster,
} from "./primitives";
import { audio } from "@/lib/audio";
import { useInvestigation } from "@/lib/investigation-progress";

export default function CaseFile({ onContinue }: { onContinue?: () => void }) {
  const collect = useInvestigation((s) => s.collect);
  return (
    <section
      id="case-file"
      className="relative mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <Reveal>
        <SectionLabel index="FILE 01" title="Case Overview" />

        <div className="relative overflow-hidden">
          <div className="paper grain deckle relative p-6 sm:p-10">
            {/* header */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--ink-faded)]/40 pb-4">
              <div>
                <div className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-[var(--ink-faded)]">
                  Louisiana State Police — CID
                </div>
                <h2 className="font-serif-d text-[var(--ink)] text-2xl sm:text-3xl">
                  Case File
                </h2>
              </div>
              <div className="stamp text-[10px]">Open</div>
            </div>

            {/* metadata grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-typewriter text-[12px] text-[var(--ink-soft)] sm:grid-cols-4">
              <Field label="Case No.">LR-<Redact w="1995" />-07</Field>
              <Field label="Date opened">03 Jan 1995</Field>
              <Field label="Parish">Erath / Vermilion</Field>
              <Field label="Status">
                <span className="text-[var(--rust)]">Active — unsolved</span>
              </Field>
            </div>

            {/* victim line */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <div className="mb-2 font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faded)]">
                  Victim (verified)
                </div>
                <p className="font-typewriter text-[13px] leading-relaxed text-[var(--ink-soft)]">
                  Female. Approx. <Redact w="28–34" /> yrs. Found in
                  <span className="italic"> cane field</span>, kneeling position,
                  bound with <Redact w="____" />. Crown adorned with
                  <span className="italic"> antlers</span> and dried
                  <span className="italic"> twig</span> lattice.
                </p>
                <p className="mt-3 font-typewriter text-[13px] leading-relaxed text-[var(--ink-soft)]">
                  Marks consistent with prior victim(s) — pattern suggests
                  <span className="text-[var(--rust)]"> ritual</span>, not rage.
                </p>
              </div>
              <div>
                <div className="mb-2 font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faded)]">
                  Evidence collected
                </div>
                <ul className="space-y-1 font-typewriter text-[12px] text-[var(--ink-soft)]">
                  <li>— Sketch of lattice structure (see Symbols, p. 11)</li>
                  <li>— Soil sample: bayou silt + <Redact w="ash" /></li>
                  <li>— Witness stmt: <Redact w="two" /> children, unverified</li>
                  <li>— Photographs (4) — polaroids, water-damaged</li>
                  <li>— Tape recording, partial — see Interviews</li>
                </ul>
              </div>
            </div>

            {/* photographs row */}
            <div className="mt-8">
              <div className="mb-3 font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faded)]">
                Scene photographs
              </div>
              <div className="flex flex-wrap gap-6">
                <PhotoWithBack
                  src="/evidence/polaroid-field.png"
                  front="the field. no one saw."
                  back="the grass was flat in a circle. no tire tracks. something walked here, or was walked here."
                  rotate={-4}
                  width={140}
                  height={140}
                  onFlip={() => collect("case-photo-field")}
                />
                <PhotoWithBack
                  src="/evidence/polaroid-tree.png"
                  front="old tree. mile 7."
                  back="three nights, same tire marks. nobody reported a vehicle. who keeps coming back?"
                  rotate={3}
                  width={140}
                  height={140}
                  onFlip={() => collect("case-photo-tree")}
                />
                <PhotoWithBack
                  src="/evidence/polaroid-house.png"
                  front="??? — not on any map"
                  back="i checked the parish records back to the 60s. this house does not exist on paper. someone erased it."
                  rotate={-2}
                  width={140}
                  height={140}
                  onFlip={() => collect("case-photo-house")}
                />
              </div>
            </div>

            {/* newspaper clipping */}
            <div className="mt-8">
              <div className="mb-3 font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faded)]">
                Press clipping — acquired after the fact
              </div>
              <motion.div
                className="relative max-w-md bg-[#9c8c63] p-5 font-serif-d text-[var(--ink)]"
                style={{
                  filter: "sepia(0.35) contrast(0.92)",
                  boxShadow: "3px 5px 14px rgba(0,0,0,0.5)",
                  transform: "rotate(-1deg)",
                }}
                whileHover={{ rotate: 0, scale: 1.02 }}
              >
                <div className="border-y-2 border-[var(--ink)] py-1 text-center text-[10px] uppercase tracking-[0.2em]">
                  The Vermilion Register — Spring 1995
                </div>
                <h3 className="mt-2 text-center text-lg font-bold leading-tight">
                  BODY FOUND IN CANE FIELD; SHERIFF CITES “ANIMAL ACT”
                </h3>
                <p className="mt-2 text-[12px] leading-snug">
                  Authorities urge calm following the discovery off Route 27.
                  Sheriff’s office declined to confirm whether the scene bore
                  markings. “Nothing here for folks to worry on,” a spokesman
                  said. Residents disagree.
                </p>
                <div className="mt-2 text-right text-[10px] italic opacity-70">
                  [continued p. 4 — page missing]
                </div>
                <PaperClip top={-6} left={8} rotate={-8} />
              </motion.div>
            </div>

            {/* handwritten notes */}
            <div className="mt-8 border-t border-[var(--ink-faded)]/30 pt-5">
              <div className="mb-2 font-typewriter text-[10px] uppercase tracking-[0.25em] text-[var(--ink-faded)]">
                Margin notes — Cohle, R.
              </div>
              <p className="font-[family-name:var(--font-hand)] text-[18px] leading-relaxed text-[var(--blood)]">
                The sheriff knew the name before I said it. Watched his hand
                when he wrote it down — it didn’t shake. It should have.
              </p>
            </div>

            {/* sticky notes / clips */}
            <StickyNote top={2} right={6} rotate={5} width={130}>
              re-interview the father. he lied about the truck.
            </StickyNote>
            <StickyNote top="38%" right={2} rotate={-4} color="#c9b870" width={120}>
              check mile markers 6–9. same soil.
            </StickyNote>

            {/* hidden discoveries: a locked envelope + torn tape + invisible ink */}
            <Envelope
              top="62%"
              right="4%"
              rotate={3}
              width={150}
              label="do not open — evidence"
              contents={
                <>
                  he said he was fishing. the bait was still dry in the box. — r.c.
                </>
              }
            />
            <TornTape width={90} height={22} top="8%" left="44%" rotate={-8} />
            <Staple top="2%" left="18%" rotate={4} />
            <InkSmudge size={70} top="70%" left="40%" rotate={20} opacity={0.6} />

            {/* invisible ink — only the magnifier reveals it */}
            <div className="pointer-events-none absolute bottom-6 left-8 z-30 font-[family-name:var(--font-hand)] text-[15px]">
              <span className="invisible-ink mag-target">ask about the school. the one that closed.</span>
            </div>

            <PaperClip top={3} left={40} rotate={6} />
            <CoffeeStain size={130} top="78%" left="6%" opacity={0.5} />
            <WearCluster seedKey="case-file" count={5} />
          </div>

          <motion.div
            className="mt-10 flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <PaperButton onClick={onContinue}>
              Examine the board →
            </PaperButton>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--ink-faded)]">
        {label}
      </div>
      <div className="text-[var(--ink)]">{children}</div>
    </div>
  );
}

export function Polaroid({
  src,
  caption,
  rotate = 0,
  className = "",
}: {
  src: string;
  caption?: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <motion.figure
      className={`mag-target group relative ${className}`}
      style={{ rotate }}
      whileHover={{ rotate: 0, scale: 1.06, zIndex: 30 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      onHoverStart={() => audio.pencil()}
    >
      <div
        className="bg-[#e8dcc0] p-2 pb-9"
        style={{ boxShadow: "3px 5px 12px rgba(0,0,0,0.6)" }}
      >
        <div
          className="photo-sharpen relative overflow-hidden"
          style={{ width: 140, height: 140 }}
        >
          { }
          <img
            src={src}
            alt="scene photograph"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, transparent 40%, rgba(40,28,12,0.5) 100%)",
            }}
          />
        </div>
      </div>
      {caption && (
        <figcaption className="absolute bottom-1 left-0 right-0 px-3 text-center font-[family-name:var(--font-hand)] text-[13px] text-[var(--ink-soft)]">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}
