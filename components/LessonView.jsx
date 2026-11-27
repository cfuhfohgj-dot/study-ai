'use client';
import { useState, useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { Send, Check, Close } from './Icons';
import { updateLesson } from '@/lib/store';

function Quiz({ quiz, t }) {
  const [sel, setSel] = useState({});
  return (
    <div className="space-y-4">
      {quiz.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
          <p className="mb-2 font-semibold">{qi + 1}. {q.q}</p>
          <div className="grid gap-2">
            {q.options.map((o, oi) => {
              const picked = sel[qi] === oi; const done = sel[qi] !== undefined;
              const good = oi === q.answer;
              return (
                <button key={oi} onClick={() => !done && setSel({ ...sel, [qi]: oi })}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-start text-sm transition ${done && good ? 'border-emerald-400 bg-emerald-500/10' : picked ? 'border-rose-400 bg-rose-500/10' : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'}`}>
                  <span>{o}</span>{done && good && <Check size={16} className="text-emerald-500" />}{picked && !good && <Close size={16} className="text-rose-500" />}
                </button>
              );
            })}
          </div>
          {sel[qi] !== undefined && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{sel[qi] === q.answer ? t.correct : t.wrong}{q.why}</p>}
        </div>
      ))}
    </div>
  );
}

export default function LessonView({ row, lang, t }) {
  const lesson = row.data.lesson;
  const L = row.lang || lang;
  const [chat, setChat] = useState(row.data.chat || []);
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { setChat(row.data.chat || []); }, [row.id]);
  useEffect(() => { end.current && end.current.scrollIntoView({ block: 'nearest' }); }, [chat, busy]);

  async function send() {
    const m = msg.trim(); if (!m || busy) return;
    const next = [...chat, { role: 'user', text: m }]; setChat(next); setMsg(''); setBusy(true);
    let reply;
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: m, lesson, lang: L, history: chat }) });
      const j = await r.json(); reply = j.reply || t.err;
    } catch { reply = t.err; }
    const all = [...next, { role: 'ai', text: reply }]; setChat(all); setBusy(false);
    updateLesson(row.id, { ...row.data, chat: all });
  }

  return (
    <div className="space-y-4" dir={L === 'ar' ? 'rtl' : 'ltr'}>
      {lesson.demo && <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-700 dark:text-amber-200">{t.demo}</div>}
      <h2 className="text-2xl font-bold">{lesson.title}</h2>
      <VideoPlayer lesson={lesson} lang={L} t={t} />
      <section className="card p-4"><h3 className="mb-2 font-bold">{t.keyPoints}</h3>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{lesson.summary}</p>
        <ul className="space-y-2">{lesson.keyPoints.map((k, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-mint" />{k}</li>)}</ul>
      </section>
      <section className="card p-4"><h3 className="mb-3 font-bold">{t.explain}</h3>
        <ol className="space-y-3">{lesson.steps.map((s, i) => (
          <li key={i} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-iris/20 text-sm font-bold text-iris">{i + 1}</span>
            <div><p className="font-semibold">{s.title}</p><p className="text-sm text-slate-600 dark:text-slate-300">{s.body}</p></div></li>))}</ol>
        {lesson.examples?.length > 0 && <><h3 className="mb-2 mt-5 font-bold">{t.examples}</h3>
          {lesson.examples.map((e, i) => <div key={i} className="mb-2 rounded-xl bg-mint/10 p-3 text-sm"><b>{e.title}: </b>{e.body}</div>)}</>}
      </section>
      <section className="card p-4"><h3 className="mb-3 font-bold">{t.quiz}</h3><Quiz quiz={lesson.quiz} t={t} /></section>
      <section className="card p-4"><h3 className="mb-3 font-bold">{t.chat}</h3>
        <div className="mb-3 max-h-80 space-y-2 overflow-y-auto" data-testid="chat-log">
          {chat.map((c, i) => <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${c.role === 'user' ? 'bg-iris text-white ms-auto' : 'bg-slate-100 dark:bg-white/10'}`}>{c.text}</div>)}
          {busy && <div className="w-14 rounded-2xl bg-slate-100 px-3 py-2 text-sm dark:bg-white/10">...</div>}
          <div ref={end} />
        </div>
        <div className="flex gap-2">
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t.chatPh}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-iris dark:border-white/10 dark:bg-white/5" />
          <button onClick={send} disabled={busy} className="primary" aria-label={t.send}><Send size={18} /></button>
        </div>
      </section>
    </div>
  );
}
