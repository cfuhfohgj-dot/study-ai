const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grwgvbpgnjapgdqggkmv.supabase.co';
const KEY_ = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_a14jLFUaEP9juVL2VWwFKg_JIqiTuaT';
const H = { apikey: KEY_, Authorization: 'Bearer ' + KEY_, 'content-type': 'application/json' };

export function device() {
  try {
    let d = localStorage.getItem('study_device');
    if (!d) { d = 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); localStorage.setItem('study_device', d); }
    return d;
  } catch { return 's_anon'; }
}
const local = {
  all: () => { try { return JSON.parse(localStorage.getItem('study_lessons') || '[]'); } catch { return []; } },
  set: (a) => { try { localStorage.setItem('study_lessons', JSON.stringify(a)); } catch {} }
};

export async function listLessons() {
  try {
    const r = await fetch(`${URL_}/rest/v1/lessons?device_id=eq.${device()}&select=id,title,lang,created_at&order=created_at.desc&limit=50`, { headers: H });
    if (!r.ok) throw 0;
    return { items: await r.json(), db: true };
  } catch { return { items: local.all().map(({ id, title, lang, created_at }) => ({ id, title, lang, created_at })), db: false }; }
}
export async function getLesson(id) {
  try {
    const r = await fetch(`${URL_}/rest/v1/lessons?id=eq.${id}&select=*`, { headers: H });
    const j = await r.json();
    if (r.ok && j[0]) return j[0];
  } catch {}
  return local.all().find(l => l.id === id) || null;
}
export async function saveLesson({ title, lang, data }) {
  try {
    const r = await fetch(`${URL_}/rest/v1/lessons`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ device_id: device(), title, lang, data }) });
    const j = await r.json();
    if (r.ok && j[0]) return j[0];
  } catch {}
  const row = { id: 'l_' + Date.now().toString(36), title, lang, data, created_at: new Date().toISOString() };
  local.set([row, ...local.all()]);
  return row;
}
export async function updateLesson(id, data) {
  try {
    const r = await fetch(`${URL_}/rest/v1/lessons?id=eq.${id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ data }) });
    if (r.ok) return;
  } catch {}
  local.set(local.all().map(l => l.id === id ? { ...l, data } : l));
}
