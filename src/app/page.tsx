"use client";

import { useEffect, useState } from "react";
import SmoothScroll, { scrollToId } from "@/components/investigation/SmoothScroll";
import MagnifierCursor from "@/components/investigation/MagnifierCursor";
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
          <main className="vignette relative flex min-h-screen flex-col">
            {/* persistent confidential corner label */}
            <div className="pointer-events-none fixed left-4 top-4 z-[60] font-typewriter text-[8px] uppercase tracking-[0.3em] text-[rgba(205,191,156,0.28)]">
              LSP · CID // Confidential
            </div>

            <FirstPage onContinue={() => scrollToId("case-file")} />

            <PhilosophyPage
              index="I"
              title="On the Circle"
              body="We are taught that time moves forward — that the past is behind us and closed. I have worked enough of the dead to doubt it. The past arrives. It knocks. It wears the same coat it wore twenty years ago, and asks the same question, and we pretend we do not recognize its voice."
            />

            <CaseFile onContinue={() => scrollToId("evidence-board")} />

            <EvidenceBoard />

            <PhilosophyPage
              index="II"
              title="On the Witness"
              body="Memory is not a record. It is a story the mind tells itself to keep walking. Edit it once and it learns to edit itself. Trust nothing it offers whole. The truth lives in what it stammers over — in the pause before the easy answer."
            />

            <Symbols />

            <LouisianaMap />

            <PhilosophyPage
              index="III"
              title="On the Door"
              body="There is a door in every case. You feel it before you see it. The cheap detective opens it and is proud. The honest one knows the door was left open for him, and that what is behind it has been waiting longer than he has been looking."
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

      <AudioToggle />
    </>
  );
}
