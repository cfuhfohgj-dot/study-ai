import { NextResponse } from 'next/server';
import { wavFromPcm } from '@/lib/gemini';
import { guard, clip } from '@/lib/guard';
export const maxDuration = 60;

// TTS adapter seam: gemini | elevenlabs | browser (client falls back to speechSynthesis)
export async function POST(req) {
  const bad = guard(req, { perMin: 20, maxBytes: 50_000 }); if (bad) return bad;
  let body; try { body = await req.json(); } catch { return NextResponse.json({ fallback: 'browser' }); }
  const text = clip(body.text, 1200);
  const provider = process.env.TTS_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'browser');
  try {
    if (provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
      const voice = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' })
      });
      if (!r.ok) throw new Error('ElevenLabs ' + r.status);
      return new NextResponse(Buffer.from(await r.arrayBuffer()), { headers: { 'content-type': 'audio/mpeg' } });
    }
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
        })
      });
      const j = await r.json();
      const data = j?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!r.ok || !data) throw new Error(j?.error?.message || 'Gemini TTS failed');
      return new NextResponse(wavFromPcm(data), { headers: { 'content-type': 'audio/wav' } });
    }
  } catch (e) {
    return NextResponse.json({ fallback: 'browser', error: String(e.message || e) }, { status: 200 });
  }
  return NextResponse.json({ fallback: 'browser' }, { status: 200 });
}
