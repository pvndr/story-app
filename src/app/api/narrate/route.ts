import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Narration TTS endpoint (ElevenLabs).
 *
 * POST /api/narrate  { text: string }
 * -> audio/mpeg
 *
 * Uses ElevenLabs API for high-quality TTS.
 * Results are cached in-memory by a hash of the text to save credits.
 */

const MAX_LEN = 5000; // ElevenLabs free tier limit per request is 5000.

const cache = new Map<
  string,
  { buf: ArrayBuffer; ts: number }
>();

function key(text: string) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

async function synthesize(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is missing.");
  }

  // "Brian" is a slightly higher, more conversational American male voice that takes gravel effects perfectly
  const voiceId = "nPczCjzI2devNBz1zQrb"; 
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  return await response.arrayBuffer();
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
    
    // Safety crop for ElevenLabs free tier
    const safeText = text.slice(0, MAX_LEN);

    const k = key(safeText);
    const cached = cache.get(k);
    if (cached) {
      return new NextResponse(cached.buf, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(cached.buf.byteLength),
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const buf = await synthesize(safeText);
    cache.set(k, { buf, ts: Date.now() });
    
    // keep cache bounded
    if (cache.size > 50) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
      if (oldest) cache.delete(oldest[0]);
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buf.byteLength),
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
