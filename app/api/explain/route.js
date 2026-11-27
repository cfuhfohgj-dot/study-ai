import { NextResponse } from 'next/server';
import { gemini, hasKey } from '@/lib/gemini';
import { demoLesson } from '@/lib/demo';
import { guard, clip } from '@/lib/guard';
export const maxDuration = 60;

const SCHEMA = `Return ONLY JSON with this exact shape:
{"title":string,"summary":string (2 sentences),"keyPoints":string[] (4-6),
"steps":[{"title":string,"body":string}] (3-6 simple step-by-step explanation),
"examples":[{"title":string,"body":string}] (1-2 worked examples),
"quiz":[{"q":string,"options":string[4],"answer":number (0-3),"why":string}] (3 questions),
"scenes":[{"title":string,"bullets":string[] (max 3 short),"narration":string (1-3 sentences spoken aloud, plain words, no symbols)}] (5-8 scenes, total narration about 150-260 words so the video lasts 1-2 minutes)}`;

export async function POST(req) {
  const bad = guard(req, { perMin: 5, maxBytes: 8_000_000 }); if (bad) return bad;
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }); }
  b.text = clip(b.text, 6000);
  const okMime = (m, re) => re.test(String(m || ''));
  if ((b.image && (!okMime(b.image.mime, /^image\//) || String(b.image.data || '').length > 6_000_000)) || (b.pdf && String(b.pdf.data || '').length > 7_000_000) || (b.audio && (!okMime(b.audio.mime, /^audio\//) || String(b.audio.data || '').length > 6_000_000))) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  const lang = b.lang === 'en' ? 'en' : 'ar';
  if (!hasKey()) return NextResponse.json({ lesson: demoLesson(lang, b.text), mode: 'demo' });
  try {
    const parts = [];
    const langRule = lang === 'ar' ? 'Write everything in simple Egyptian-friendly Arabic (Modern Standard with easy words), keep formulas and terms readable.' : 'Write everything in simple English.';
    parts.push({ text: `Student's request/text: ${b.text || '(see attached material)'}\n\n${langRule}\n${SCHEMA}` });
    if (b.image) parts.push({ inline_data: { mime_type: b.image.mime, data: b.image.data } });
    if (b.pdf) parts.push({ inline_data: { mime_type: 'application/pdf', data: b.pdf.data } });
    if (b.audio) parts.push({ inline_data: { mime_type: b.audio.mime, data: b.audio.data } });
    const out = await gemini({
      parts, json: true,
      system: 'You are an expert, patient school tutor for secondary-school students. Explain the hard part of the material step by step like a great teacher, with worked examples and quick check questions.'
    });
    const lesson = JSON.parse(out.replace(/^```json\s*|```$/g, ''));
    return NextResponse.json({ lesson, mode: 'live' });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
