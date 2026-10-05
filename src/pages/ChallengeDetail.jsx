import { useState } from 'react';
import { getChallenge, CHALLENGES, KATEGORI, TINGKAT } from '../data/challenges.js';
import { runQuery, isReadOnly } from '../lib/db.js';
import { compareResults } from '../lib/grader.js';
import { markSolved, getProgress } from '../lib/progress.js';
import { nav } from '../lib/router.js';
import SqlEditor from '../components/SqlEditor.jsx';
import ResultTable from '../components/ResultTable.jsx';
import SchemaBrowser from '../components/SchemaBrowser.jsx';
import { TingkatBadge, KategoriBadge, CheckIcon } from '../components/ui.jsx';

const draftKey = (id) => `belajarsql-draft-${id}`;

export default function ChallengeDetail({ id, db }) {
  const challenge = getChallenge(id);
  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem(draftKey(id)) ?? challenge?.starter ?? '';
    } catch {
      return challenge?.starter ?? '';
    }
  });
  const [result, setResult] = useState(null);
  const [expected, setExpected] = useState(null);
  const [feedback, setFeedback] = useState(null); // {type:'ok'|'err'|'info', msg}
  const [tab, setTab] = useState('hasil');
  const [hintIdx, setHintIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [running, setRunning] = useState(false);
  const [, force] = useState(0);

  const idx = CHALLENGES.findIndex((c) => c.id === id);
  const prev = CHALLENGES[idx - 1];
  const next = CHALLENGES[idx + 1];
  const kat = KATEGORI.find((k) => k.id === challenge?.kategori);
  const solved = challenge && getProgress().solved[challenge.id];

  if (!challenge) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">Soal tidak ditemukan.</p>
        <button onClick={() => nav('/soal')} className="text-brand-600 font-semibold">← Kembali ke daftar</button>
      </div>
    );
  }

  const persist = (v) => {
    setCode(v);
    try { localStorage.setItem(draftKey(id), v); } catch { /* abaikan */ }
  };

  const runUser = () => {
    if (!db) return;
    if (!isReadOnly(code)) {
      setFeedback({ type: 'err', msg: 'Hanya query SELECT/WITH yang diizinkan di sini.' });
      setResult(null);
      return;
    }
    try {
      const res = runQuery(db, code);
      setResult(res);
      setTab('hasil');
      setFeedback({ type: 'info', msg: `Query jalan — ${res.rows.length} baris hasil. Kalau sudah yakin, klik Submit Jawaban.` });
    } catch (e) {
      setFeedback({ type: 'err', msg: `Error SQL: ${e.message}` });
      setResult(null);
    }
  };

  const submit = () => {
    if (!db || running) return;
    setRunning(true);
    try {
      if (!isReadOnly(code)) {
        setFeedback({ type: 'err', msg: 'Hanya query SELECT/WITH yang diizinkan.' });
        return;
      }
      const exp = runQuery(db, challenge.solusi);
      setExpected(exp);
      const act = runQuery(db, code);
      setResult(act);
      const verdict = compareResults(exp, act, challenge.orderMatters);
      if (verdict.ok) {
        const { first, xp } = markSolved(challenge.id, challenge.tingkat);
        setFeedback({
          type: 'ok',
          msg: first
            ? `Benar! +${TINGKAT[challenge.tingkat].xp} XP (total ${xp} XP). Lanjut ke soal berikutnya?`
            : 'Benar! Soal ini sudah pernah kamu selesaikan sebelumnya.',
        });
        setTab('hasil');
        force((x) => x + 1);
      } else {
        setFeedback({ type: 'err', msg: verdict.message });
        setTab('bandingkan');
      }
    } catch (e) {
      setFeedback({ type: 'err', msg: `Error SQL: ${e.message}` });
    } finally {
      setRunning(false);
    }
  };

  const lintas = challenge.orderMatters ? ' + urutan baris' : '';

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-5">
      {/* header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={() => nav('/soal')} className="text-sm text-slate-500 hover:text-brand-600">
          ← Daftar
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-bold text-lg">{challenge.judul}</h1>
          <KategoriBadge nama={kat?.nama} />
          <TingkatBadge tingkat={challenge.tingkat} />
          {solved && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckIcon className="w-4 h-4" /> Selesai
            </span>
          )}
        </div>
        <div className="ml-auto flex gap-1.5">
          {prev && (
            <button onClick={() => nav(`/soal/${prev.id}`)} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:border-slate-400 bg-white">
              ← {prev.judul}
            </button>
          )}
          {next && (
            <button onClick={() => nav(`/soal/${next.id}`)} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:border-slate-400 bg-white">
              {next.judul} →
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* kiri: cerita + petunjuk + skema */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">{challenge.cerita}</p>
            <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-brand-700 mb-1">Tugas</div>
              <p
                className="text-sm font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: challenge.tugas.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code class="font-mono text-[12px] bg-white/70 px-1 rounded">$1</code>') }}
              />
              {challenge.orderMatters && (
                <p className="text-[11px] text-brand-600 mt-1.5">Urutan baris hasil juga dinilai.</p>
              )}
            </div>
            <div className="mt-3 text-[11px] font-mono text-slate-400">Konsep: {challenge.konsep} · Nilai: {TINGKAT[challenge.tingkat].xp} XP</div>
          </div>

          {/* hints */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Petunjuk</div>
              {hintIdx < challenge.hints.length && (
                <button
                  onClick={() => setHintIdx((i) => i + 1)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Tampilkan petunjuk {hintIdx + 1}/{challenge.hints.length}
                </button>
              )}
            </div>
            {hintIdx === 0 ? (
              <p className="text-sm text-slate-400">Stuck? Buka petunjuk satu per satu — lebih baik coba dulu sendiri.</p>
            ) : (
              <ol className="space-y-1.5">
                {challenge.hints.slice(0, hintIdx).map((h, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-brand-500 font-bold shrink-0">{i + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: h.replace(/`(.+?)`/g, '<code class="font-mono text-[12px] bg-slate-100 px-1 rounded">$1</code>') }} />
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* solusi */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Solusi</div>
              {!showSolution && (
                <button onClick={() => setShowSolution(true)} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                  Menyerah? Lihat solusi
                </button>
              )}
            </div>
            {showSolution ? (
              <>
                <pre className="rounded-xl bg-ink-900 text-emerald-200 text-[13px] font-mono p-4 overflow-x-auto scroll-thin whitespace-pre-wrap">
                  {challenge.solusi}
                </pre>
                <button
                  onClick={() => persist(challenge.solusi)}
                  className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Salin ke editor ↗
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-400">Solusi disembunyikan. Buka hanya kalau sudah benar-benar mentok.</p>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <SchemaBrowser db={db} />
          </div>
        </div>

        {/* kanan: editor + hasil */}
        <div className="space-y-3 lg:sticky lg:top-4">
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Editor SQL</span>
              <span className="text-[11px] text-slate-400">Ctrl+Enter = Jalankan</span>
            </div>
            <div className="h-56">
              <SqlEditor value={code} onChange={persist} onRun={runUser} height="224px" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={runUser}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold hover:border-slate-500 bg-white transition-colors"
              >
                ▶ Jalankan
              </button>
              <button
                onClick={submit}
                disabled={running}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-500 transition-colors disabled:opacity-50"
              >
                Submit Jawaban
              </button>
              <button
                onClick={() => persist(challenge.starter)}
                className="ml-auto text-xs text-slate-400 hover:text-slate-600"
              >
                Reset
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium border ${
                feedback.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : feedback.type === 'err'
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-sky-50 border-sky-200 text-sky-800'
              }`}
            >
              {feedback.msg}
              {feedback.type === 'ok' && next && (
                <button onClick={() => nav(`/soal/${next.id}`)} className="ml-2 underline font-bold">
                  Soal berikutnya →
                </button>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setTab('hasil')}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider ${tab === 'hasil' || tab === 'bandingkan' ? 'text-brand-700 border-b-2 border-brand-500' : 'text-slate-400'}`}
              >
                Hasil Kamu {result ? `(${result.rows.length})` : ''}
              </button>
              {expected && (
                <button
                  onClick={() => setTab('bandingkan')}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider ${tab === 'bandingkan' ? 'text-amber-700 border-b-2 border-amber-500' : 'text-slate-400'}`}
                >
                  Diharapkan ({expected.rows.length})
                </button>
              )}
            </div>
            <div className="h-72">
              {tab === 'bandingkan' && expected ? (
                <div className="grid grid-cols-2 h-full divide-x divide-slate-100">
                  <div className="overflow-hidden">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 bg-slate-50">Hasilmu</div>
                    <ResultTable result={result} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-amber-600 bg-amber-50">Diharapkan{lintas}</div>
                    <ResultTable result={expected} />
                  </div>
                </div>
              ) : (
                <ResultTable result={result} emptyText="Jalankan query untuk melihat hasil." />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
