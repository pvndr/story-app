"use client";

import { useEffect, useState } from "react";
import SmoothScroll, { scrollToId } from "@/components/investigation/SmoothScroll";
import MagnifierCursor from "@/components/investigation/MagnifierCursor";
import AtmosphereLayer from "@/components/investigation/AtmosphereLayer";
import InvestigationTracker from "@/components/investigation/InvestigationTracker";
import AudioToggle from "@/components/investigation/AudioToggle";
import Intro from "@/components/investigation/Intro";
import FirstPage from "@/components/investigation/FirstPage";
import PhilosophyPage from "@/components/investigation/PhilosophyPage";
import CaseFile from "@/components/investigation/CaseFile";
import EvidenceBoard from "@/components/investigation/EvidenceBoard";
import Symbols from "@/components/investigation/Symbols";
import LouisianaMap from "@/components/investigation/LouisianaMap";
import AudioInterviews from "@/components/investigation/AudioInterviews";
import CharacterProfiles from "@/components/investigation/CharacterProfiles";
import Timeline from "@/components/investigation/Timeline";
import Ending from "@/components/investigation/Ending";

export default function Home() {
  const [entered, setEntered] = useState(false);

  // lock scroll during the intro
  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  return (
    <>
      <MagnifierCursor />

      <Intro onEnter={() => setEntered(true)} />

      {entered && (
        <SmoothScroll>
          {/* ambient environmental storytelling — dust, smoke, lamp breathing, LED */}
          <AtmosphereLayer />

          <main className="vignette relative z-10 flex min-h-screen flex-col">
            {/* persistent confidential corner label */}
            <div className="pointer-events-none fixed left-4 top-4 z-[60] font-typewriter text-[8px] uppercase tracking-[0.3em] text-[rgba(205,191,156,0.28)]">
              LSP · CID // Confidential
            </div>

            <FirstPage onContinue={() => scrollToId("case-file")} />

            <PhilosophyPage
              index="I"
              title="On the Circle"
              body="The past does not stay behind us. It arrives, wearing the same coat, asking the same question."
            />

            <CaseFile onContinue={() => scrollToId("evidence-board")} />

            <EvidenceBoard />

            <PhilosophyPage
              index="II"
              title="On the Witness"
              body="Memory is a story the mind tells itself to keep walking. Trust nothing it offers whole. The truth lives in what it stammers over."
            />

            <Symbols />

            <LouisianaMap />

            <PhilosophyPage
              index="III"
              title="On the Door"
              body="There is a door in every case. The honest detective knows it was left open for him — and that what waits behind it has been waiting longer than he has been looking."
            />

            <AudioInterviews />

            <CharacterProfiles />

            <Timeline />

            <Ending />

            {/* notebook back cover / footer */}
            <footer className="mt-auto border-t border-[rgba(205,191,156,0.12)] py-10 text-center">
              <div className="font-typewriter text-[9px] uppercase tracking-[0.35em] text-[rgba(205,191,156,0.4)]">
                — end of file —
              </div>
              <div className="mt-2 font-typewriter text-[8px] uppercase tracking-[0.3em] text-[rgba(205,191,156,0.25)]">
                Property of Louisiana State Police · Confidential · 1995–2012
              </div>
            </footer>
          </main>
        </SmoothScroll>
      )}

      <InvestigationTracker active={entered} />
      <AudioToggle />
    </>
  );
}
