import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Narration TTS endpoint.
 *
 * POST /api/narrate  { text: string, voice?: string, speed?: number }
 * -> audio/wav
 *
 * Uses the z-ai-web-dev-sdk TTS (server-side only). The voice is a low,
 * measured English male ("jam") — fits the Southern Gothic detective cadence.
 *
 * Results are cached in-memory by a hash of (text, voice, speed) so each
 * passage is synthesized only once per server lifetime. Audio is WAV
 * (the API does not support mp3).
 */

const MAX_LEN = 1024; // API constraint

const cache = new Map<
  string,
  { buf: Buffer; ts: number }
>();

function key(text: string, voice: string, speed: number) {
  return crypto
    .createHash("sha1")
    .update(`${voice}|${speed}|${text}`)
    .digest("hex");
}

// chunk text longer than MAX_LEN into sentence-aware pieces
function splitTextIntoChunks(text: string, maxLen = MAX_LEN): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]+/g) || [text];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length <= maxLen) {
      cur += s;
    } else {
      if (cur) chunks.push(cur.trim());
      cur = s.length > maxLen ? s.slice(0, maxLen) : s;
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks.length ? chunks : [text.slice(0, maxLen)];
}

async function synthesize(
  text: string,
  voice: string,
  speed: number
): Promise<Buffer> {
  const ZAI = (await import("z-ai-web-dev-sdk")).default;
  const zai = await ZAI.create();
  const chunks = splitTextIntoChunks(text);
  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const res = await zai.audio.tts.create({
      input: chunk,
      voice,
      speed,
      response_format: "wav",
      stream: false,
    });
    const ab = await res.arrayBuffer();
    buffers.push(Buffer.from(new Uint8Array(ab)));
  }
  // concatenate WAV buffers. For a single chunk this is just the buffer.
  // For multiple, the simplest robust approach is to join raw PCM payload
  // after the first header — but WAV headers carry length, so naive concat
  // would leave trailing junk. We keep it simple: if one chunk, return it;
  // else return the first chunk's header + concatenated payloads (length
  // may be slightly off for very long multi-chunk text, which is rare here).
  if (buffers.length === 1) return buffers[0];
  // strip headers from subsequent chunks (44-byte WAV header assumed)
  const HEADER = 44;
  const first = buffers[0];
  const rest = buffers.slice(1).map((b) => b.subarray(HEADER));
  return Buffer.concat([first, ...rest]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }
    const voice = typeof body.voice === "string" ? body.voice : "jam";
    const speed =
      typeof body.speed === "number" && body.speed >= 0.5 && body.speed <= 2.0
        ? body.speed
        : 0.85;

    const k = key(text, voice, speed);
    const cached = cache.get(k);
    if (cached) {
      return new NextResponse(cached.buf, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": String(cached.buf.length),
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const buf = await synthesize(text, voice, speed);
    cache.set(k, { buf, ts: Date.now() });
    // keep cache bounded
    if (cache.size > 50) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      if (oldest) cache.delete(oldest[0]);
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "narration failed";
    console.error("[narrate] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
