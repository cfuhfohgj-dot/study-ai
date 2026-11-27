'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Download } from './Icons';

const W = 1280, H = 720;
const est = (t) => Math.max(4, (t.trim().split(/\s+/).length) * 0.42 + 1);

function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

export default function VideoPlayer({ lesson, lang, t }) {
  const scenes = lesson.scenes || [];
  const cv = useRef(null);
  const st = useRef({ idx: 0, t: 0, playing: false, ended: false, speaking: false, exporting: false });
  const audio = useRef({ ctx: null, bufs: [], src: null, dest: null, mode: 'pending' });
  const [ui, setUi] = useState({ idx: 0, playing: false, mode: 'pending', exporting: false, progress: 0 });
  const rec = useRef(null);
  const rtl = lang === 'ar';
  const speechLang = rtl ? 'ar-EG' : 'en-US';

  const durOf = (i) => audio.current.bufs[i] ? audio.current.bufs[i].duration + 0.6 : est(scenes[i].narration);

  // prefetch tts audio
  useEffect(() => {
    let dead = false;
    (async () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.current.ctx = new AC();
      const bufs = [];
      let mode = 'browser';
      for (let i = 0; i < scenes.length; i++) {
        try {
          const r = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: scenes[i].narration, lang }) });
          if ((r.headers.get('content-type') || '').startsWith('audio')) {
            bufs[i] = await audio.current.ctx.decodeAudioData(await r.arrayBuffer());
            mode = 'ai';
          } else break;
        } catch { break; }
        if (dead) return;
      }
      if (dead) return;
      audio.current.bufs = mode === 'ai' ? bufs : [];
      audio.current.mode = mode;
      setUi(u => ({ ...u, mode }));
    })();
    return () => { dead = true; try { audio.current.ctx && audio.current.ctx.close(); } catch {} window.speechSynthesis && window.speechSynthesis.cancel(); };
  }, [lesson]);

  const stopSound = () => {
    try { audio.current.src && audio.current.src.stop(); } catch {}
    audio.current.src = null;
    window.speechSynthesis && window.speechSynthesis.cancel();
    st.current.speaking = false;
  };

  const startScene = useCallback((i) => {
    stopSound();
    const s = st.current; s.idx = i; s.t = 0; s.ended = false;
    const a = audio.current;
    if (a.bufs[i] && a.ctx) {
      const src = a.ctx.createBufferSource(); src.buffer = a.bufs[i];
      if (s.exporting && a.dest) src.connect(a.dest); else src.connect(a.ctx.destination);
      src.start(); a.src = src;
    } else if (window.speechSynthesis && !s.exporting) {
      const u = new SpeechSynthesisUtterance(scenes[i].narration); u.lang = speechLang; u.rate = 0.95;
      const v = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith(speechLang.slice(0, 2)));
      if (v) u.voice = v;
      s.speaking = true; u.onend = u.onerror = () => { s.speaking = false; };
      window.speechSynthesis.speak(u);
    }
    setUi(u => ({ ...u, idx: i }));
  }, [lesson, lang]);

  const play = useCallback(async () => {
    const s = st.current, a = audio.current;
    if (a.ctx && a.ctx.state === 'suspended') await a.ctx.resume();
    if (s.ended) { startScene(0); }
    else if (!a.src && !s.speaking && s.t === 0) startScene(s.idx);
    else if (window.speechSynthesis && window.speechSynthesis.paused) window.speechSynthesis.resume();
    s.playing = true; setUi(u => ({ ...u, playing: true }));
  }, [startScene]);
  const pause = useCallback(async () => {
    const s = st.current; s.playing = false;
    if (audio.current.ctx && audio.current.ctx.state === 'running') await audio.current.ctx.suspend();
    window.speechSynthesis && window.speechSynthesis.pause();
    setUi(u => ({ ...u, playing: false }));
  }, []);

  // draw + clock loop
  useEffect(() => {
    const c = cv.current; const ctx = c.getContext('2d'); let raf, last = performance.now(); let dead = false;
    const loop = (now) => {
      if (dead) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const s = st.current;
      if (s.playing) {
        s.t += dt;
        const d = durOf(s.idx);
        const speechBusy = !audio.current.bufs[s.idx] && s.speaking && s.t < d * 1.8;
        if (s.t >= d && !speechBusy) {
          if (s.idx < scenes.length - 1) startScene(s.idx + 1);
          else { s.playing = false; s.ended = true; stopSound(); setUi(u => ({ ...u, playing: false })); if (s.exporting) finishExport(); }
        }
      }
      draw(ctx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); };
  }, [lesson, lang]);

  function draw(ctx) {
    const s = st.current; const sc = scenes[s.idx] || {};
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0b1730'); g.addColorStop(1, '#1b1f4d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(W * 0.85, H * 0.15, 20, W * 0.85, H * 0.15, 420); rg.addColorStop(0, 'rgba(139,124,246,0.35)'); rg.addColorStop(1, 'rgba(139,124,246,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    const rg2 = ctx.createRadialGradient(W * 0.1, H * 0.95, 20, W * 0.1, H * 0.95, 380); rg2.addColorStop(0, 'rgba(94,230,176,0.25)'); rg2.addColorStop(1, 'rgba(94,230,176,0)');
    ctx.fillStyle = rg2; ctx.fillRect(0, 0, W, H);
    ctx.direction = rtl ? 'rtl' : 'ltr'; ctx.textAlign = rtl ? 'right' : 'left'; ctx.textBaseline = 'alphabetic';
    const X = rtl ? W - 90 : 90; const maxW = W - 180;
    const fam = "'Segoe UI','Noto Sans Arabic',Tahoma,sans-serif";
    // tag
    ctx.fillStyle = '#5ee6b0'; ctx.font = `600 28px ${fam}`;
    ctx.fillText(`${t.scene} ${s.idx + 1} / ${scenes.length}`, X, 90);
    // title
    const fade = Math.min(1, s.t / 0.5);
    ctx.globalAlpha = fade; ctx.fillStyle = '#ffffff'; ctx.font = `700 64px ${fam}`;
    let y = 190; for (const l of wrap(ctx, sc.title || '', maxW)) { ctx.fillText(l, X, y); y += 78; }
    // bullets
    ctx.font = `500 40px ${fam}`; y += 20;
    (sc.bullets || []).forEach((b, i) => {
      const a = Math.max(0, Math.min(1, (s.t - 0.6 - i * 0.7) / 0.5)); ctx.globalAlpha = a;
      ctx.fillStyle = '#8b7cf6'; ctx.beginPath(); ctx.arc(rtl ? X + 0 - 10 : X + 10, y - 14, 8, 0, 7); ctx.fill();
      ctx.fillStyle = '#e6ebff';
      const bx = rtl ? X - 34 : X + 34;
      for (const l of wrap(ctx, b, maxW - 40)) { ctx.fillText(l, bx, y); y += 54; }
      y += 14;
    });
    ctx.globalAlpha = 1;
    // caption
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(60, H - 190, W - 120, 120);
    ctx.fillStyle = '#c7d2fe'; ctx.font = `400 28px ${fam}`;
    const cl = wrap(ctx, sc.narration || '', maxW - 40).slice(0, 3); let cy = H - 150;
    for (const l of cl) { ctx.fillText(l, X, cy); cy += 36; }
    // progress
    const total = scenes.reduce((a, _, i) => a + durOf(i), 0); let done = 0; for (let i = 0; i < s.idx; i++) done += durOf(i);
    const p = Math.min(1, (done + s.t) / total);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, H - 14, W, 14);
    ctx.fillStyle = '#5ee6b0'; if (rtl) ctx.fillRect(W - W * p, H - 14, W * p, 14); else ctx.fillRect(0, H - 14, W * p, 14);
  }

  function finishExport() {
    const r = rec.current; if (r && r.state !== 'inactive') r.stop();
  }
  async function exportVideo() {
    const a = audio.current, s = st.current;
    if (!window.MediaRecorder) { alert('Browser cannot record video'); return; }
    stopSound(); s.playing = false;
    if (a.ctx.state === 'suspended') await a.ctx.resume();
    s.exporting = true; setUi(u => ({ ...u, exporting: true }));
    const stream = cv.current.captureStream(30);
    if (a.ctx && a.bufs.length) { a.dest = a.ctx.createMediaStreamDestination(); a.dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr)); }
    const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mime = types.find(m => MediaRecorder.isTypeSupported(m)) || '';
    const chunks = [];
    const r = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2500000 } : undefined); rec.current = r;
    r.ondataavailable = e => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      const blob = new Blob(chunks, { type: r.mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob); const el = document.createElement('a');
      el.href = url; el.download = (lesson.title || 'lesson').replace(/[^\w\u0600-\u06FF]+/g, '_') + (blob.type.includes('mp4') ? '.mp4' : '.webm'); document.body.appendChild(el); el.click(); el.remove();
      s.exporting = false; a.dest = null; setUi(u => ({ ...u, exporting: false, blobUrl: url, blobSize: blob.size }));
    };
    r.start(500); startScene(0); s.playing = true; setUi(u => ({ ...u, playing: true }));
  }

  const totalDur = scenes.reduce((a, _, i) => a + durOf(i), 0);
  return (
    <div className="card overflow-hidden p-0">
      <div className="relative bg-black">
        <canvas ref={cv} width={W} height={H} className="block h-auto w-full" data-testid="video-canvas" />
        {!ui.playing && !ui.exporting && (
          <button onClick={play} aria-label={t.play} className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/15">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-ink shadow-xl"><Play size={34} /></span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button className="primary" onClick={ui.playing ? pause : play} disabled={ui.exporting}>
          {ui.playing ? <Pause size={18} /> : <Play size={18} />}{ui.playing ? t.pause : t.play}
        </button>
        <div className="flex flex-1 items-center gap-1.5" dir="ltr">
          {scenes.map((_, i) => (
            <button key={i} aria-label={`${t.scene} ${i + 1}`} disabled={ui.exporting} onClick={() => { startScene(i); st.current.playing = true; setUi(u => ({ ...u, playing: true })); audio.current.ctx && audio.current.ctx.resume(); }}
              className={`h-2 flex-1 rounded-full transition ${i === ui.idx ? 'bg-mint' : i < ui.idx ? 'bg-iris/60' : 'bg-slate-300 dark:bg-white/20'}`} />
          ))}
        </div>
        <button className="chip" onClick={exportVideo} disabled={ui.exporting}>
          <Download size={18} />{ui.exporting ? t.recordingVideo : t.download}
        </button>
      </div>
      <div className="px-3 pb-3 text-xs text-slate-500 dark:text-slate-400">
        {ui.mode === 'ai' ? (rtl ? 'تعليق صوتي بالذكاء الاصطناعي' : 'AI voice narration') : ui.mode === 'browser' ? (rtl ? 'تعليق صوتي من صوت الجهاز (التحميل بدون صوت)' : 'Device voice narration (downloaded file has no voice)') : (rtl ? 'جاري تجهيز الصوت...' : 'Preparing voice...')}
        {' · '}{Math.round(totalDur)}s
      </div>
    </div>
  );
}
