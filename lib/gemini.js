const KEY = () => process.env.GEMINI_API_KEY || '';
export const hasKey = () => !!KEY();
const MODEL = () => process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function gemini({ parts, system, json = false, history = [] }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL()}:generateContent`;
  const body = {
    contents: [...history, { role: 'user', parts }],
    generationConfig: json ? { responseMimeType: 'application/json', temperature: 0.6 } : { temperature: 0.7 }
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY() }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || 'Gemini error ' + r.status);
  const text = j?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  return text;
}

export function wavFromPcm(pcmB64, rate = 24000) {
  const pcm = Buffer.from(pcmB64, 'base64');
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
