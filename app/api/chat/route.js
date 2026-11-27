import { NextResponse } from 'next/server';
import { gemini, hasKey } from '@/lib/gemini';
import { demoChat } from '@/lib/demo';
export const maxDuration = 60;

export async function POST(req) {
  const b = await req.json();
  const lang = b.lang === 'en' ? 'en' : 'ar';
  if (!hasKey()) return NextResponse.json({ reply: demoChat(lang), mode: 'demo' });
  try {
    const l = b.lesson || {};
    const ctx = `Lesson title: ${l.title}\nKey points: ${(l.keyPoints || []).join('; ')}\nSteps: ${(l.steps || []).map(s => s.title + ': ' + s.body).join(' | ')}\nExamples: ${(l.examples || []).map(s => s.body).join(' | ')}`;
    const history = (b.history || []).slice(-8).map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
    const reply = await gemini({
      history,
      parts: [{ text: b.message }],
      system: `You are a friendly expert tutor answering follow-up questions about this lesson. Answer in ${lang === 'ar' ? 'simple Arabic' : 'simple English'}, short and clear, with a tiny example if useful.\n${ctx}`
    });
    return NextResponse.json({ reply, mode: 'live' });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
