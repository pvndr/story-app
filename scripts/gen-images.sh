#!/bin/bash
# Original atmospheric artwork for the investigation notebook.
# No actor likenesses, no copyrighted material — all impressionistic/original.
set -u
cd /home/z/my-project/public/evidence
LOG=/home/z/my-project/scripts/gen-images.log
: > "$LOG"

gen() {
  local name="$1"; local size="$2"; local prompt="$3"
  if [ -f "$name" ]; then echo "[skip] $name exists" >> "$LOG"; return; fi
  echo "[gen] $name ($size)" >> "$LOG"
  z-ai image -p "$prompt" -o "./$name" -s "$size" >> "$LOG" 2>&1 && echo "[ok] $name" >> "$LOG" || echo "[FAIL] $name" >> "$LOG"
}

gen notebook-cover.png 1344x768 \
"Old worn dark leather detective notebook closed on a dark wooden desk, brass clasp and leather strap holding it shut, single warm tungsten desk lamp casting a small pool of golden light, dust particles floating in the light beam, deep charcoal black darkness surrounding, cinematic moody lighting, desaturated, heavy film grain, photographic, no text, no people, Southern Gothic atmosphere"

gen polaroid-bayou.png 1024x1024 \
"Aged faded damaged Polaroid photograph of a foggy Louisiana bayou at dusk, dead cypress trees draped in Spanish moss rising from still dark water, muted desaturated green and brown tones, heavy film grain, scratches and stains, eerie unsettling Southern Gothic mood, no people"

gen polaroid-church.png 1024x1024 \
"Aged faded damaged Polaroid photograph of an abandoned wooden chapel in an overgrown weed field, peeling white paint, crooked weathered cross, heavy overcast gray sky, desaturated, heavy grain, scratches and water stains, eerie Southern Gothic, no people"

gen polaroid-house.png 1024x1024 \
"Aged faded damaged Polaroid photograph of a dilapidated isolated rural Louisiana house at dusk, sagging porch, broken windows, tall weeds, dark and moody, desaturated muted tones, heavy grain, scratches, unsettling, no people"

gen polaroid-field.png 1024x1024 \
"Aged faded damaged Polaroid photograph of a vast empty field of tall dead brown grass under a heavy low gray sky, a single bare crooked dead tree, lonely and ominous, desaturated, heavy film grain, scratches, no people"

gen polaroid-tree.png 1024x1024 \
"Aged faded damaged Polaroid photograph of a massive bare dead tree with hanging gray moss silhouetted against a dusky foggy sky, a lonely dirt road, Southern Gothic, desaturated, heavy grain, scratches and stains, no people"

gen sketch-detective.png 864x1152 \
"Rough abstract charcoal sketch portrait on aged yellow paper of a gaunt brooding man wearing a flat cap, heavy dark shadows, loose impressionistic scribbled lines, smudges, noir detective mood, generic non-identifiable face NOT a likeness of any real person, Southern Gothic"

gen sketch-partner.png 864x1152 \
"Rough abstract charcoal sketch portrait on aged yellow paper of a tired mustached man with stubble and weary eyes, loose impressionistic strokes, heavy shadow, noir detective mood, generic non-identifiable face NOT a likeness of any real person"

gen sketch-suspect.png 864x1152 \
"Rough abstract charcoal sketch portrait on aged yellow paper of a weathered scarred old man with long unkempt hair, unsettling, half the face in deep shadow, loose charcoal strokes, smudges, noir, generic non-identifiable face NOT a likeness of any real person"

echo "[done] generation finished" >> "$LOG"
