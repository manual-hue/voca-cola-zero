import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_LANGS = new Map([
  ["en-US", { languageCode: "en-US", name: "en-US-Neural2-J" }],
  ["zh-CN", { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-A" }],
]);

const MAX_TEXT_LENGTH = 100;

let _client: TextToSpeechClient | undefined;

function getClient(): TextToSpeechClient {
  if (_client) return _client;

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 env var is not set");
  }

  const credentials = JSON.parse(
    Buffer.from(base64, "base64").toString("utf-8"),
  );

  _client = new TextToSpeechClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    projectId: credentials.project_id,
  });

  return _client;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const text = searchParams.get("text");
  const lang = searchParams.get("lang");

  if (!text || !lang) {
    return new Response("Missing text or lang parameter", { status: 400 });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return new Response(`Text exceeds ${MAX_TEXT_LENGTH} characters`, {
      status: 400,
    });
  }

  const voiceConfig = ALLOWED_LANGS.get(lang);
  if (!voiceConfig) {
    return new Response(`Unsupported language: ${lang}`, { status: 400 });
  }

  try {
    const client = getClient();
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: voiceConfig,
      audioConfig: { audioEncoding: "MP3" },
    });

    const content = response.audioContent as Uint8Array;
    return new Response(Buffer.from(content).buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("TTS error:", message);
    return new Response(`TTS synthesis failed: ${message}`, { status: 500 });
  }
}
