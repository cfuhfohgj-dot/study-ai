// Lessons live only in this browser (localStorage). Nothing is sent to a shared database,
// so another device or stranger can never read or edit them.
const KEY = 'study_lessons';
const all = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const set = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 50))); } catch {} };

export function device() { return 'local'; }
export async function listLessons() {
  return { items: all().map(({ id, title, lang, created_at }) => ({ id, title, lang, created_at })), db: false };
}
export async function getLesson(id) { return all().find(l => l.id === id) || null; }
export async function saveLesson({ title, lang, data }) {
  const row = { id: 'l_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title, lang, data, created_at: new Date().toISOString() };
  set([row, ...all()]);
  return row;
}
export async function updateLesson(id, data) { set(all().map(l => l.id === id ? { ...l, data } : l)); }
