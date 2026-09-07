"use client";

import { Reveal } from "./primitives";
import NarrationPlayer from "./NarrationPlayer";
import { motion } from "framer-motion";

export default function PhilosophyPage({
  index,
  title,
  body,
  signature = "— R.C.",
}: {
  index: string;
  title: string;
  body: string;
  signature?: string;
}) {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <div className="relative">
          {/* torn page edges */}
          <div
            className="paper grain deckle relative px-6 py-12 sm:px-14 sm:py-16"
            style={{
              clipPath:
                "polygon(0 2%, 3% 0, 12% 3%, 24% 0, 40% 2%, 55% 0, 70% 3%, 85% 0, 96% 2%, 100% 0, 100% 98%, 95% 100%, 82% 97%, 66% 100%, 50% 98%, 35% 100%, 20% 97%, 8% 100%, 0 98%)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          >
            <div className="mb-6 flex items-center gap-3 font-typewriter text-[10px] uppercase tracking-[0.32em] text-[var(--ink-faded)]">
              <span className="text-[var(--rust)]">Margin {index}</span>
              <span className="h-px flex-1 bg-[var(--ink-faded)]/40" />
              <span>undated</span>
            </div>

            <motion.h3
              className="font-serif-d mb-6 text-center text-2xl text-[var(--ink)] sm:text-3xl"
              style={{ letterSpacing: "0.04em" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            >
              {title}
            </motion.h3>

            <p
              className="font-[family-name:var(--font-hand)] text-center text-[var(--ink)]"
              style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.45rem)", lineHeight: 1.9 }}
            >
              {body}
            </p>

            <div className="mt-6 flex justify-center">
              <NarrationPlayer
                id={`philosophy-${index}`}
                text={`${title}. ${body}`}
                playbackRate={0.6}
              />
            </div>

            <div
              className="mt-6 text-right font-[family-name:var(--font-hand)] text-[1.2rem] text-[var(--blood)]"
            >
              {signature}
            </div>

            {/* faint stain */}
            <div
              className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-full opacity-40"
              style={{
                background:
                  "radial-gradient(circle, rgba(74,44,22,0.3) 40%, transparent 70%)",
              }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
