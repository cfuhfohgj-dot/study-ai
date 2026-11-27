import { NextResponse } from 'next/server';
// Best-effort protection for a public URL with a free-tier key: same-origin only,
// per-IP rate limit, global daily cap, size caps. In-memory, so per serverless instance.
const hits = new Map();
let day = { d: '', n: 0 };
const DAILY_CAP = Number(process.env.DAILY_API_CAP || 300);

export function guard(req, { perMin = 6, maxBytes = 8_000_000 } = {}) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin) { try { if (new URL(origin).host !== host) return NextResponse.json({ error: 'forbidden' }, { status: 403 }); } catch { return NextResponse.json({ error: 'forbidden' }, { status: 403 }); } }
  const len = Number(req.headers.get('content-length') || 0);
  if (len > maxBytes) return NextResponse.json({ error: 'too_large' }, { status: 413 });
  const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0].trim();
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < 60_000);
  if (arr.length >= perMin) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  const today = new Date().toISOString().slice(0, 10);
  if (day.d !== today) day = { d: today, n: 0 };
  if (++day.n > DAILY_CAP) return NextResponse.json({ error: 'daily_cap' }, { status: 429 });
  return null;
}
export const clip = (s, n) => String(s ?? '').slice(0, n);
