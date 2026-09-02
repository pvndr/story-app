# Worklog — True Detective S1 Interactive Tribute

---
Task ID: 1
Agent: main
Task: Generate original atmospheric artwork (notebook cover, polaroids, charcoal sketches) in background

Work Log:
- Created /home/z/my-project/public/evidence folder
- Wrote /home/z/my-project/scripts/gen-images.sh with 9 image prompts (no actor likenesses, original Southern Gothic illustrations)
- Fixed cover size 1440x720 -> 1344x768 (API requires multiples of 32)
- Launched generation in background (nohup)

Stage Summary:
- 9 images being generated: notebook-cover, 5 polaroids (bayou/church/house/field/tree), 3 charcoal sketches (detective/partner/suspect)
- All artwork original / impressionistic to avoid copyright/likeness issues
- Images land in /home/z/my-project/public/evidence/

---
Task ID: 2-9
Agent: main
Task: Build + verify the full interactive True Detective S1 tribute experience

Work Log:
- Theme: added Special Elite (typewriter) + IM Fell English (distressed serif) + Shadows Into Light (handwriting accent) fonts; rewrote globals.css with Southern Gothic palette (charcoal/aged paper/rust/tungsten/faded green/beige), paper textures, grain, stains, lamp flicker, cassette spin, string paths
- Audio engine (lib/audio.ts): Web Audio API synthesis — ambient (wind, tape hum 60Hz, fluorescent 120Hz, insects, floor creaks, distant thunder) + interaction one-shots (paper, typewriter, shutter, cassette, stamp, drawer, pencil, strap). No autoplay; toggle-gated.
- MagnifierCursor: brass magnifying-glass cursor (desktop/fine-pointer only) with inertia + focus state over .mag-target elements
- SmoothScroll: Lenis (slow, weighted easing) with window.__lenis + scrollToId helper
- Intro: darkness (2.6s) -> lamp flicker + cassette click -> notebook cover fade-in -> typewriter title (3 lines, sequenced) -> confidential stamp -> leather strap with brass clasp -> click to unlock (3D open) -> enter
- Sections: FirstPage (handwritten opening), PhilosophyPage x3 (On the Circle / On the Witness / On the Door — original writing), CaseFile (metadata, polaroids, newspaper clipping, sticky notes, paper clips, redactions, coffee stains), EvidenceBoard (cork board, 7 pinned items, 7 SVG strings that glow on hover, hover reveals), Symbols (6 hand-drawn SVG: spiral, antlers, lattice, child's drawing, black sun, crow — hover reveals Rust's observations), LouisianaMap (hand-drawn SVG map, 5 pins opening detail dossiers with polaroid+note+log+weather), AudioInterviews (3 cassettes, spinning reels, typewriter transcripts with deliberate pauses), CharacterProfiles (3 dossiers incl. one Rust keeps on himself; expandable), Timeline (1995/96/98/2002/12 with string, burn marks, missing pages, symbols, torn), Ending (torn page -> aggressive flicker -> "THE CASE REMAINS OPEN" -> poetic lines -> "Inspired by...greatest detective stories. Watch True Detective — Season 1." -> notebook closes -> black -> "Time leaves marks. Some never fade.")
- Composed page.tsx: intro overlay -> SmoothScroll-wrapped notebook with vignette, confidential corner label, all sections, footer
- Fixed: Paper import (FirstPage), setState-in-effect (MagnifierCursor disable, TypewriterText refactored to keyed Transcript), unused eslint disables, EvidenceBoard mobile horizontal overflow (added overflow-x-auto wrapper + min-w)

Verification (Agent Browser + VLM):
- Intro: VLM confirms "dark cinematic mood, warm brown/gold palette, desk lamp glow, dust particles, leather notebook labeled RUST COHLE INVESTIGATION NOTEBOOK"
- First page: VLM confirms aged yellow paper two-page spread, handwritten opening note, coffee stains, red margin annotation "don't trust the dates — R.C."
- Case file: VLM confirms metadata, 3 polaroids, newspaper clipping, sticky notes, paper clip, redactions — no broken images
- Evidence board: VLM confirms cork board, pinned photos/notes/receipt, red/yellow strings — no issues
- Interactions verified: strap unlock, tape transcript typing, map pin detail modal, dossier expansion, audio toggle (no errors)
- Mobile (390px): no horizontal overflow across all 12 sections; ending sequence completes to "Time leaves marks"
- Desktop (1440px): no overflow; all sections render
- Lint: clean (0 errors, 0 warnings); dev log: 200 responses, no runtime/console errors

Stage Summary:
- Production-ready cinematic tribute at / (single route). All artwork original (9 AI-generated impressionistic images, no actor likenesses/copyrighted material). True Detective name revealed only in final ending page. No spoilers, no killer identity.
- 9 evidence images in public/evidence/. Audio fully synthesized (no asset loading). Fully responsive.

---
Task ID: P1-P5
Agent: main
Task: Polish foundation — randomness util, audio extensions, atmosphere layer, enhanced primitives, investigation tracker; wire into page + interactive components

Work Log:
- lib/investigation-random.ts: session-seeded xorshift32 PRNG (rnd/rndInt/rndPick/rndRange/rndChance/slot/slotHash/atmos) stored in sessionStorage -> controlled per-visit variation
- lib/audio.ts: added ambient layers (ceiling fan w/ LFO + tick, swamp bed + distant frog calls, tape hiss); added interaction sounds (photoPickup, notebookClose); slowed ambient fade-in to 4.5s @ 0.42 gain
- globals.css: added imperfection textures (.smudge, .fingerprint, .bent-corner, .staple, .torn-tape, .faded-ink, .pencil-correct), page-flip keyframe + .page-spine, .paper-flutter, .film-burn, .mag-reveal/.invisible-ink, .envelope-flap, prefers-reduced-motion guard
- components/investigation/AtmosphereLayer.tsx: global fixed layer — 26 dust motes drifting through lamp cone (GPU transform/opacity only), 2 cigarette-smoke plumes rising+curling, LampCone that breathes + randomly changes intensity every 20-40s (occasionally triggers distant thunder), tape-recorder LED that blinks
- components/investigation/primitives.tsx: added InkSmudge, Fingerprint, BentCorner, TornTape, Staple, FadedInk, PencilCorrect, HangingPaper (paper-flutter), PageFlip (realistic paper-turn w/ curl+thickness+shadow+rustle sound), PhotoWithBack (click-to-flip polaroid with handwritten back), Envelope (flap peels open), RevealHeavy (slow page-weight reveal), WearCluster (random per-session imperfections), MagReveal (text hidden until magnifier lens passes — ~1/6 reveal nothing on purpose)
- MagnifierCursor: now dispatches mag-focus/mag-blur events to .mag-reveal/.invisible-ink elements under the lens so hidden annotations/invisible ink light up
- lib/investigation-progress.ts: Zustand store, TOTAL_CLUES=27, sessionStorage-persisted Set of collected clue ids
- components/investigation/InvestigationTracker.tsx: sticky lower-left evidence tracker (■□ blocks, N/27 Clues, "new clue logged" pulse) — NOT a percentage bar
- page.tsx: wired AtmosphereLayer (z-1) + InvestigationTracker; trimmed 3 philosophy pages to shorter, more whitespace-heavy reflections
- Wired collect() into LouisianaMap pins (5), AudioInterviews tapes (3), CharacterProfiles dossiers (3), Symbols hover (6) = 17 so far; board(7)+casefile(3) to come via subagents/integration

Stage Summary:
- Foundation complete and lint-clean. Atmosphere is alive (dust/smoke/lamp-breathing/LED) without autoplay audio. Magnifier now reveals hidden content. Progress tracker fills as visitor explores.
- Next: delegate EvidenceBoard centerpiece (P6a) + Ending rework (P6b) to parallel subagents, then scatter hidden discoveries + verify.

---
Task ID: P6b
Agent: full-stack-developer
Task: Ending sequence rework

Work Log:
- Read worklog.md (main + foundation history) and confirmed available APIs: audio.cassette, audio.notebookClose, audio.click; primitives Reveal / SectionLabel; framer-motion motion / useInView; existing .hard-flicker / .lamp-flicker CSS; z-[95] convention for fixed full-viewport overlays.
- Read current Ending.tsx and primitives.tsx to preserve the torn-page markup, the "Unresolved" stamp, the FILE 08 / Final Page header, and the Southern Gothic palette/typography.
- Rewrote /home/z/my-project/src/components/investigation/Ending.tsx as a single phase state machine (page → cassetteStop → silence → closing → darkening → lampOnly → lampOff → black → reveal) driven by a setTimeout chain inside the existing useInView-gated useEffect, with all timers cleaned up on unmount. No setState in the effect body — every transition is inside a setTimeout callback (matches the existing lint-clean pattern).
- Sequence (from inView at t=0): t=0 torn page visible + aggressive .hard-flicker overlay (z-30); t=1.4s audio.cassette() marks the tape stopping; t=2.8s SILENCE begins (flicker switches to softer .lamp-flicker, opacity 0.7) and holds for 3.5s; t=6.3s notebook closes via 3D rotateX 0→-92deg over 1.8s (transformOrigin center bottom, perspective 1400px on parent) with a darkening linear-gradient shadow falling across the page, audio.notebookClose() fires; t=8.1s fixed full-viewport black overlay (z-95) fades 0→0.97 over 1.6s (room goes dark); t=9.7s tungsten radial-gradient lamp glow (z-96) fades in over 1.8s; t=11.5s glow fades to 0 over 0.9s while the black overlay completes to opacity 1; t=12.4s pure black, 2.5s pause; t=14.9s reveal begins.
- Reveal is a fixed z-[97] overlay, centered, with all five lines always mounted (opacity gated by a revealedCount counter) so the layout never shifts as lines appear. Each line fades in over 1.6s with ease [0.18,0.7,0.18,1]; cadence: L1 "Inspired by one of television's greatest detective stories." @ 0, L2 "TRUE DETECTIVE" (font-serif-d, tungsten, 0.2em tracking, blurred-in) @ +3.0s (pause), L3 "Season One" (font-typewriter, beige, 0.42em) @ +4.4s (1.4s after L2, no pause), L4 "Some stories never leave you." (handwriting, paper/85) @ +7.4s (pause), L5 "[ Watch the Series ]" (PaperButton-styled <a> → max.com/shows/true-detective, border + uppercase tracking + hover rust sweep, audio.click on click, tabIndex/pointerEvents gated until revealed) @ +10.4s (pause). Terminal — no auto-advance, no loop.
- Kept the existing Reveal + SectionLabel ("FILE 08" / "Final Page") header and the torn-page body verbatim (redaction bars, "[page torn]" rust annotations, clip-path deckle edge, Unresolved stamp). Removed the old "THE CASE REMAINS OPEN", poetic lines, and "Time leaves marks. Some never fade." per the new spec.
- Ran `bun run lint` → 0 errors, 0 warnings. Confirmed dev server still returns 200 (tail of dev.log shows healthy GET / 200 responses).

Stage Summary:
- Ending.tsx is now a ~27s slow-burn coda: torn page → flicker → cassette stops → 3.5s silence → 3D notebook close (rotateX -92deg, 1.8s) → room darkens → lone tungsten glow → lamp dies → full black + 2.5s pause → line-by-line tribute ending on a styled "[ Watch the Series ]" affordance linking to HBO Max. Every transition 0.9–1.8s with ease [0.18,0.7,0.18,1]; silences preserved at full length. Audio gated by the existing engine (no-ops if disabled — the silence is the point). Only Ending.tsx was touched; lint clean, dev server healthy.

---
Task ID: P6a
Agent: full-stack-developer
Task: EvidenceBoard centerpiece upgrade

Work Log:
- Read worklog + existing EvidenceBoard.tsx + primitives.tsx + audio.ts + investigation-progress.ts + investigation-random.ts to understand prior foundation (P1-P5) and available APIs.
- Rewrote ONLY src/components/investigation/EvidenceBoard.tsx into a committed-click "examine" centerpiece while preserving the 7 items, positions, 7 links, 7 reveals, cork palette, mobile overflow wrapper, and hover-preview behavior.
- Added per-item `unfoldNote` (Rust's analytical marginalia, unsettling, never names the killer, never quotes the show) to all 7 items and `backText` (handwritten verso) to the 5 photo items.
- State machine: `hovered` (subtle preview) + `selected` (committed examine). Clicking a clue commits it (audio.paper + collect(`board-${id}`) via useInvestigation selector), clicking the same clue again or clicking empty board space deselects (audio.click). Board onClick uses `e.target === e.currentTarget` so item clicks never bubble to deselect.
- When committed: non-connected items dim to opacity 0.32 + saturate(0.4) brightness(0.78); selected + directly-connected items gain a tungsten radial-gradient halo + stronger box-shadow glow.
- Strings: kept the `.string-path` dashed base layer (strokeDasharray 4 3, drop-shadow) for the hand-drawn feel; added a per-link `motion.line` overlay that draws itself via framer-motion `pathLength` 0→1 (0.9s, ease [0.22,0.7,0.2,1]) in tungsten with a 6px glow. Inactive overlays sit at pathLength 0 (invisible); switching clues un-draws the old and draws the new simultaneously.
- Handwritten arrowheads: small inline-SVG chevrons at each active string midpoint, positioned via a separate HTML layer (z-6) so CSS rotation stays reliable. Fade in after a 0.7s delay (after the string draws), fade out immediately on deselect. Angle computed from pixel deltas (board measured via ResizeObserver, deferred setState via setTimeout to satisfy the strict react-hooks rule).
- Hidden marginalia note: an `AnimatePresence`-wrapped `motion.div` near the committed clue animates height 0→auto + opacity + slight y, revealing `unfoldNote` in the handwriting font on a paper-dark card with a per-session `atmos.rotate` jitter. Swaps cleanly when switching clues (keyed by selected id).
- Photo flip: each photo gains a "↻ back / ↻ front" `mag-target` affordance (top-right, visible only when committed) that calls `stopPropagation` + `audio.photoPickup()` and flips the polaroid via `rotateY` 0↔180 over 1.0s with `[transform-style:preserve-3d]` + `[backface-visibility:hidden]`, revealing the handwritten `backText` on the verso. Flip auto-resets 520ms after deselection (deferred setState).
- Audio: `audio.pencil()` on hover (suppressed while a clue is committed), `audio.paper()` on commit (unfold), `audio.photoPickup()` on flip, `audio.click()` on deselect.
- Integration: `useInvestigation((s) => s.collect)` selector (stable, no re-renders) — each committed clue logs `board-${id}`, contributing 7 of the 27 total clues.
- Atmosphere: `atmos.jitter`/`atmos.rotate` give every pinned item + the unfold note a tiny per-session offset so each visit sits slightly differently. Added a CoffeeStain + InkSmudge sparingly on the cork.
- Performance: only transform/opacity/pathLength animated; `will-change` set on BoardItem outer/inner, photo flip, unfold note, and draw overlays; `loading="lazy"` kept on images; base lines use CSS opacity transition only.
- Lint: `bun run lint` → 0 errors, 0 warnings. Dev server: 200 responses, no runtime/console errors after recompile.

Stage Summary:
- EvidenceBoard is now the conspiracy-solving centerpiece: click-to-commit replaces hover-only. Committed clue dims the rest of the board, draws red tungsten strings along its connections (pathLength self-draw), drops handwritten arrowheads at the midpoints, unfolds a hidden marginalia note nearby, and (for photos) offers a physical flip to a handwritten verso.
- Hover behavior preserved as a subtle preview; click is the committed "examine" action. Deselect via second click on the same clue or clicking empty board space.
- All 7 clues wired into the 27-clue investigation tracker. Existing atmosphere (cork palette, dashed hand-drawn strings, pin/mag-target, mobile overflow) preserved. No other files touched.

---
Task ID: P7-P10
Agent: main
Task: Cursor reveals, hidden discoveries, slowdown, final wiring + verification

Work Log:
- MagnifierCursor: dispatches mag-focus/mag-blur events to .mag-reveal/.invisible-ink elements under the lens (hidden annotations + invisible ink light up); ~1/6 MagReveal slots intentionally reveal nothing
- CaseFile: replaced 3 Polaroids with PhotoWithBack (flip-to-read handwriting on back, onFlip->collect case-photo-*); added Envelope ("do not open — evidence"), TornTape, Staple, InkSmudge, WearCluster (random per-session wear), and an invisible-ink hidden note ("ask about the school. the one that closed.")
- FirstPage: added invisible-ink hidden discovery ("the names repeat. every generation.") revealed only by the magnifier
- PhotoWithBack: added onFlip callback for clue collection
- SmoothScroll (Lenis): slowed to duration 2.0, wheelMultiplier 0.7 (deliberate, weighted scroll)
- page.tsx: trimmed 3 philosophy pages to shorter, more whitespace-heavy reflections (On the Circle / On the Witness / On the Door)
- Wired collect() into CaseFile photo flips (3) -> total clue sources: board(7) + map(5) + tapes(3) + dossiers(3) + symbols(6) + case-photos(3) = 27 = TOTAL_CLUES
- Subagent P6a rewrote EvidenceBoard.tsx: click-to-examine centerpiece (dim rest, glow connected, self-drawing strings via pathLength, handwritten arrowheads, unfolding marginalia, photo flip-to-back, deselect on second click/empty board, atmos jitter, board-${id} clue logging)
- Subagent P6b rewrote Ending.tsx: slow silence-driven coda (torn page -> hard flicker -> cassette stops -> 3.5s silence -> notebook closes rotateX 1.8s + notebookClose sound -> room darkens 1.6s -> lamp-only glow 1.8s -> lamp off 0.9s -> 2.5s pure black -> line-by-line reveal: "Inspired by..." / TRUE DETECTIVE (serif tungsten) / Season One / "Some stories never leave you." / [ Watch the Series ] -> max.com link, terminal hold)

Verification (Agent Browser + VLM):
- Desktop: intro strap -> enter; 12 sections mounted; AtmosphereLayer active; InvestigationTracker shows "INVESTIGATION STATUS / EVIDENCE COLLECTED / 0 / 27 / CLUES"
- EvidenceBoard centerpiece: clicking a clue -> tracker 0->1/27, unfold-note appears ("Recovery 04:52..."), no errors; VLM confirms "selected clue dims others, glowing yellow strings with arrowheads, unfold-note at bottom, no broken images"
- CaseFile: photo flip -> back writing visible ("BACK-SHOWN"), tracker increments; Envelope opens ("bait was still dry")
- Ending: full sequence completes to terminal hold; final state shows "TRUE DETECTIVE" (gold serif) + "Season One" + "Some stories never leave you." + "[ WATCH THE SERIES ]" link -> max.com; VLM confirms mood/typography; no console/runtime errors
- Mobile (390px): no horizontal overflow across all 8 scroll steps; intro + sections render
- Lint: clean (0 errors, 0 warnings); dev log: 200 responses

Stage Summary:
- Polish pass complete. Existing layout/navigation/typography/palette/notebook concept fully preserved.
- Environment is now alive (dust, smoke, lamp-breathing 20-40s, tape LED) without autoplay audio.
- Interactions are physical (page-flip with curl+thickness, photo lift+flip, envelope peel, folder resistance, sticky-note flutter, slow weighted scroll).
- Evidence board is a conspiracy-solving centerpiece (click-to-examine, self-drawing strings, unfolding notes, photo-back writing).
- Magnifier reveals hidden annotations + invisible ink (sometimes nothing).
- Hidden discoveries scattered (envelopes, invisible ink, photo backs, random per-session wear).
- Investigation tracker (27 clues) rewards exploration and revisits.
- Ending is a slow, silence-driven coda ending on the True Detective reveal + [Watch the Series].
- No new sections added; no redesign. Every existing interaction elevated.

---
Task ID: CRIT
Agent: main
Task: Critic pass — identify 10 weakest illusion-breaking moments and fix only those (no layout/section changes)

Work Log:
Critique method: reviewed live site through Agent Browser + VLM acting as HBO title designer / Awwwards judge; cross-referenced with code reading of globals.css, MagnifierCursor, primitives, EvidenceBoard, Intro.

The 10 weakest illusion-breaking moments + fixes:
1. Magnifier didn't magnify (just a glowing ring) -> REWROTE MagnifierCursor: circular lens with overflow:hidden now contains a live clone (cloneNode) of the hovered .mag-target, fixed to the target's pixel size, scaled 1.8x, positioned each frame so the cursor point maps to lens centre. VLM confirms "zoomed-in view of the paper/photo beneath".
2. Evidence-board strings were straight <line>s -> converted base + active-draw layers to <path> with a quadratic-bezier sagPath (control point below midpoint by min(46, span*0.18)px = gravity catenary); arrowhead midpoint offset to sit on the curve (y = my + sag/2).
3. Pins cast no shadow -> .pin now has directional box-shadow (contact + long cast from the lamp) + a ::after needle; position:relative added.
4. Redaction bars were solid flat rectangles -> .redact now uses a repeating-linear-gradient brush stripe (86deg, 2/4/6px) + a dry-brush noise ::before (SVG turbulence, screen blend) + slight skew + irregular border-radius. VLM confirms "brush/marker texture".
5. Sticky notes had no shadow/curl -> StickyNote now has directional layered drop-shadow, a clipPath peeling bottom-right corner, a tonal gradient, and a lifted-corner shadow span. VLM confirms "peeling/lifted corner and shadow".
6. Coffee stains were flat single rings -> .stain now has multi-ring radial gradient (5 stops) + irregular border-radius + multiply blend; added .stain.old darker aged variant + CoffeeStain `old` prop.
7. Stamp was too clean/perfect -> .stamp now double-border, radial ink-pooling background, contrast filter, and a ::after SVG-turbulence distress mask (screen blend) for uneven impression.
8. Handwritten ink was too crisp/uniform -> .ink-hand class (text-shadow bleed + 0.15px blur + contrast/saturate) auto-applied globally to every handwriting element via [class*="font-hand"],[style*="--font-hand"] selectors; Handwritten primitive + StickyNote use it.
9. Notebook cover title floated flat, leather lacked depth -> Intro title text-shadow upgraded to a deboss (dark press-shadow below + bright top-edge highlight); cover gets a pebbled-leather SVG-noise overlay (overlay blend) + lamp-hotspot radial vignette + deeper inset shadows. VLM confirms "Debossed" + "fine pebbled grain".
10. Paper edges clean, no age spots -> added .foxing::before (6 brown age-spots via radial gradients, multiply blend) applied to every Paper; deckle edge gets an outer highlight line.

Verification:
- Magnifier: VLM confirms zoomed content visible inside the lens (Fix 1 done)
- Board: path data confirmed sagging (Q control point y=120.4 vs endpoint 62/87); pin computed box-shadow confirmed directional (Fix 2+3 done)
- Case file: VLM confirms sticky-note peeling+shadow ✓, foxing+multi-ring stains ✓, redaction brush texture ✓ (Fix 4,5,6 done)
- Intro: VLM confirms debossed title ✓ + pebbled leather grain ✓ (Fix 9 done)
- Mobile (390px): no horizontal overflow across 8 scroll steps; no runtime/console errors
- Desktop: board items still clickable, magnifier clones on hover, no console errors
- Lint: clean (0 errors, 0 warnings)

Stage Summary:
- 10 surgical fixes applied; no layout changes, no new sections.
- The magnifier is now a real optical instrument; strings sag under gravity; pins cast lamp-shadows; redactions read as marker; sticky notes peel; stains absorb in rings; stamps are unevenly inked; handwriting bleeds; the cover title is debossed into pebbled leather; paper shows foxing.
- All existing interactions, audio, tracker, atmosphere, and the ending preserved.

---
Task ID: NARR
Agent: main
Task: Add interactive narrated storytelling — male voice narration (TTS) triggered on scroll

Work Log:
- Verified TTS skill: `jam` voice (English gentleman) works with wav format (mp3 unsupported by API). Tested via CLI.
- src/app/api/narrate/route.ts: POST endpoint, server-side z-ai-web-dev-sdk TTS, voice="jam", speed configurable. In-memory cache (Map, sha1 key of text+voice+speed, max 50 entries LRU). Splits text >1024 chars into sentence-aware chunks. Returns audio/wav. dynamic=force-dynamic.
- src/lib/narration.ts: Zustand store — voiceoverOn (localStorage-persisted), current (playing passage id), loading. narrationAllowed() helper. No autoplay: narration requires BOTH ambient-audio-enabled AND voiceoverOn.
- src/components/investigation/NarrationPlayer.tsx: triggers on useInView (once), fetches /api/narrate, creates blob URL Audio, plays once per mount. REC dot + progress bar + replay button. Shows "voice…" (loading) / "narrating" (playing) / "replay ▸" (idle). Stops if voiceover toggled off. Only one narration at a time (store.current).
- src/components/investigation/AudioToggle.tsx: added a second toggle (Voiceover On/Off) that appears below the main audio toggle once ambient audio is enabled. Enabling voiceover implicitly enables ambient audio (single gesture).
- Wired NarrationPlayer into: FirstPage (opening note, ~5 sentences), PhilosophyPage x3 (title + body, speed 0.8), Ending ("Some stories never leave you. Time leaves marks. Some never fade." speed 0.78).
- Voice direction: `jam` (low, measured English male), speed 0.78–0.85 for slow, deliberate cadence matching the Southern Gothic atmosphere.

Verification:
- API route: curl POST returns HTTP 200, audio/wav, valid RIFF WAVE 16-bit mono 24kHz (113KB for short, 1.9MB for first-page passage)
- Browser flow: enter notebook -> enable audio -> enable voiceover -> narration players appear ("replay narration" buttons) -> click -> console confirms "[narration] playing OK" -> button shows "NARRATING" during playback -> progress bar fills
- Caching confirmed: subsequent /api/narrate POSTs return in ~16ms (cache hit)
- Mobile (390px): no horizontal overflow across 8 scroll steps; no runtime/console errors
- Lint: clean (0 errors, 0 warnings); dev log: 200 responses + POST /api/narrate 200

Stage Summary:
- Interactive narrated storytelling is live. A low, measured male voice (TTS "jam") narrates Rust Cohle's opening note, the three philosophy reflections, and the final ending line — triggered as each section scrolls into view, gated behind an explicit voiceover toggle so nothing autoplays.
- Each passage synthesizes once and is cached server-side. Visitors can replay any passage via its in-page "replay ▸" affordance.
- No layout changes, no new sections. All existing interactions, atmosphere, tracker, and the ending preserved.
