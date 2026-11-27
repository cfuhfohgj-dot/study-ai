'use client';
import { useEffect, useRef, useState } from 'react';
import { T } from '@/lib/i18n';
import { listLessons, getLesson, saveLesson } from '@/lib/store';
import LessonView from './LessonView';
import { Camera, File as FileIcon, Mic, Stop, Sun, Moon, Book, Spark, Back, Close, Plus } from './Icons';

const b64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(file); });

export default function App() {
  const [lang, setLang] = useState('ar'); const [dark, setDark] = useState(true);
  const [text, setText] = useState(''); const [att, setAtt] = useState(null); // {kind,name,mime,data}
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const [row, setRow] = useState(null); const [hist, setHist] = useState([]); const [open, setOpen] = useState(false); const [dbOk, setDbOk] = useState(true);
  const [recording, setRecording] = useState(false);
  const mr = useRef(null); const imgIn = useRef(null); const pdfIn = useRef(null);
  const t = T[lang];

  useEffect(() => {
    const l = localStorage.getItem('study_lang') || 'ar'; const th = localStorage.getItem('study_theme') || 'dark';
    setLang(l); setDark(th === 'dark'); refresh();
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark); document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('study_lang', lang); localStorage.setItem('study_theme', dark ? 'dark' : 'light'); } catch {}
  }, [lang, dark]);
  async function refresh() { const r = await listLessons(); setHist(r.items); setDbOk(r.db); }

  async function pick(e, kind) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 8 * 1024 * 1024) { setErr(lang === 'ar' ? 'الملف كبير (الحد 8 ميجا)' : 'File too large (8 MB max)'); return; }
    setAtt({ kind, name: f.name, mime: f.type || (kind === 'pdf' ? 'application/pdf' : 'image/jpeg'), data: await b64(f) }); setErr(''); e.target.value = '';
  }
  async function toggleRec() {
    if (recording) { mr.current?.stop(); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true }); const chunks = [];
      const m = new MediaRecorder(s); mr.current = m;
      m.ondataavailable = e => chunks.push(e.data);
      m.onstop = async () => { s.getTracks().forEach(x => x.stop()); const blob = new Blob(chunks, { type: m.mimeType || 'audio/webm' });
        setAtt({ kind: 'audio', name: lang === 'ar' ? 'سؤال صوتي' : 'Voice question', mime: (m.mimeType || 'audio/webm').split(';')[0], data: await b64(blob) }); setRecording(false); };
      m.start(); setRecording(true);
    } catch { setErr(t.micDenied); }
  }
  async function go() {
    if (busy || (!text.trim() && !att)) return;
    setBusy(true); setErr('');
    try {
      const body = { text: text.trim(), lang };
      if (att?.kind === 'image') body.image = { mime: att.mime, data: att.data };
      if (att?.kind === 'pdf') body.pdf = { data: att.data };
      if (att?.kind === 'audio') body.audio = { mime: att.mime, data: att.data };
      const r = await fetch('/api/explain', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json(); if (!r.ok || !j.lesson) throw new Error(j.error || 'fail');
      const saved = await saveLesson({ title: j.lesson.title, lang, data: { lesson: j.lesson, chat: [] } });
      setRow(saved); setText(''); setAtt(null); refresh(); window.scrollTo({ top: 0 });
    } catch (e) { setErr(t.err + (e.message ? ` (${e.message})` : '')); }
    setBusy(false);
  }
  async function openLesson(id) { const r = await getLesson(id); if (r) { setRow(r); setOpen(false); window.scrollTo({ top: 0 }); } }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <header className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between gap-2 bg-gradient-to-b from-slate-50/95 to-transparent px-4 py-3 backdrop-blur dark:from-[#0b1730]/95">
        <div className="flex items-center gap-2">
          {row && <button className="chip !px-3" onClick={() => setRow(null)} aria-label={t.back}><Back size={18} className={lang === 'ar' ? 'rotate-180' : ''} /></button>}
          <button onClick={() => setRow(null)} className="flex items-center gap-2 text-lg font-extrabold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-iris to-mint text-white"><Spark size={20} /></span>{t.app}</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="chip !px-3" onClick={() => { refresh(); setOpen(true); }} aria-label={t.history}><Book size={18} /><span className="hidden sm:inline">{t.history}</span></button>
          <button className="chip !px-3" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{t.lang}</button>
          <button className="chip !px-3" onClick={() => setDark(!dark)} aria-label="theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </header>

      {row ? <LessonView row={row} lang={lang} t={t} /> : (
        <main className="pt-6 sm:pt-12">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-extrabold leading-tight sm:text-4xl">{t.ask}</h1>
            <p className="text-slate-500 dark:text-slate-400">{t.tagline}</p>
          </div>
          <div className="card p-3 shadow-xl shadow-blue-500/5">
            <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder={t.ph} data-testid="input"
              className="w-full resize-none rounded-xl bg-transparent p-3 text-base outline-none placeholder:text-slate-400" />
            {att && <div className="mx-2 mb-2 flex items-center justify-between rounded-lg bg-iris/10 px-3 py-2 text-sm"><span>{t.attached}: {att.name}</span><button onClick={() => setAtt(null)} aria-label={t.remove}><Close size={16} /></button></div>}
            <div className="flex flex-wrap items-center gap-2 p-1">
              <button className="chip" onClick={() => imgIn.current.click()}><Camera size={18} />{t.image}</button>
              <button className="chip" onClick={() => pdfIn.current.click()}><FileIcon size={18} />{t.pdf}</button>
              <button className={`chip ${recording ? '!border-rose-400 !text-rose-500' : ''}`} onClick={toggleRec}>{recording ? <Stop size={18} /> : <Mic size={18} />}{recording ? t.recording : t.voice}</button>
              <input ref={imgIn} type="file" accept="image/*" className="hidden" onChange={e => pick(e, 'image')} />
              <input ref={pdfIn} type="file" accept="application/pdf" className="hidden" onChange={e => pick(e, 'pdf')} />
              <button className="primary ms-auto !px-6 !py-3 text-base" onClick={go} disabled={busy || (!text.trim() && !att)} data-testid="go">
                <Spark size={18} />{busy ? t.working : t.go}
              </button>
            </div>
          </div>
          {err && <p className="mt-3 text-center text-sm text-rose-500">{err}</p>}
          {hist.length > 0 && (
            <div className="mt-8"><h3 className="mb-2 font-bold">{t.history}</h3>
              <div className="grid gap-2">{hist.slice(0, 4).map(h => <button key={h.id} onClick={() => openLesson(h.id)} className="card flex items-center justify-between p-3 text-start text-sm hover:bg-white dark:hover:bg-white/10"><span className="font-semibold">{h.title}</span><span className="text-xs text-slate-400">{new Date(h.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span></button>)}</div>
            </div>)}
        </main>
      )}

      {open && (
        <div className="fixed inset-0 z-30 flex" onClick={() => setOpen(false)}>
          <div className="flex-1 bg-black/40" />
          <aside onClick={e => e.stopPropagation()} className="h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4 shadow-2xl dark:bg-[#0e1a38]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">{t.history}</h3><button onClick={() => setOpen(false)}><Close size={20} /></button></div>
            <button className="primary mb-3 w-full" onClick={() => { setRow(null); setOpen(false); }}><Plus size={18} />{t.newLesson}</button>
            {hist.length === 0 && <p className="text-sm text-slate-500">{t.empty}</p>}
            <div className="space-y-2">{hist.map(h => <button key={h.id} onClick={() => openLesson(h.id)} className="w-full rounded-xl border border-slate-200 p-3 text-start text-sm hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"><div className="font-semibold">{h.title}</div><div className="text-xs text-slate-400">{new Date(h.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</div></button>)}</div>
            {!dbOk && <p className="mt-3 text-xs text-amber-500">{lang === 'ar' ? 'محفوظ على الجهاز فقط' : 'Saved on this device only'}</p>}
          </aside>
        </div>
      )}
    </div>
  );
}
