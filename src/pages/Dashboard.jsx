import { CHALLENGES, KATEGORI, TINGKAT } from '../data/challenges.js';
import { getProgress, levelInfo, resetProgress } from '../lib/progress.js';
import { ProgressBar, CheckIcon, TingkatBadge } from '../components/ui.jsx';
import { nav } from '../lib/router.js';
import { useState } from 'react';

export default function Dashboard() {
  const progress = getProgress();
  const lvl = levelInfo(progress.xp);
  const total = CHALLENGES.length;
  const solved = Object.keys(progress.solved).length;
  const [confirmReset, setConfirmReset] = useState(false);

  const perTingkat = Object.keys(TINGKAT).map((t) => ({
    id: t,
    total: CHALLENGES.filter((c) => c.tingkat === t).length,
    done: CHALLENGES.filter((c) => c.tingkat === t && progress.solved[c.id]).length,
  }));

  const nextChallenge = CHALLENGES.find((c) => !progress.solved[c.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 text-white p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300 mb-2">Selamat datang</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Belajar SQL lewat praktik, <span className="text-brand-300">bukan teori.</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mb-5">
            {total} tantangan interaktif dari SELECT pertama sampai window function. Database TokoNusantara
            berjalan langsung di browser-mu — tulis query, submit, dapatkan feedback instan.
          </p>
          {nextChallenge ? (
            <button
              onClick={() => nav(`/soal/${nextChallenge.id}`)}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 font-semibold text-sm transition-colors"
            >
              {solved === 0 ? 'Mulai tantangan pertama →' : `Lanjutkan: ${nextChallenge.judul} →`}
            </button>
          ) : (
            <div className="text-brand-300 font-semibold text-sm">Semua tantangan selesai. Luar biasa!</div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {/* Progress */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Level {lvl.level}</div>
              <div className="font-bold text-lg">{lvl.nama}</div>
            </div>
            <div className="text-right">
              <div className="font-extrabold text-2xl text-brand-600">{progress.xp}</div>
              <div className="text-xs text-slate-400">XP</div>
            </div>
          </div>
          <ProgressBar value={solved / total} className="mb-2" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>
              {solved}/{total} soal selesai
            </span>
            <span>{lvl.next ? `${lvl.next.min - progress.xp} XP ke ${lvl.next.nama}` : 'Level maksimal'}</span>
          </div>
          <div className="flex gap-4 mt-4">
            {perTingkat.map((t) => (
              <div key={t.id} className="flex items-center gap-1.5 text-xs">
                <TingkatBadge tingkat={t.id} />
                <span className="text-slate-500">
                  {t.done}/{t.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend XP */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">XP per soal</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Mudah</span><span className="font-mono font-semibold text-emerald-600">+10 XP</span></div>
            <div className="flex justify-between"><span>Sedang</span><span className="font-mono font-semibold text-amber-600">+20 XP</span></div>
            <div className="flex justify-between"><span>Sulit</span><span className="font-mono font-semibold text-rose-600">+35 XP</span></div>
          </div>
          <button
            onClick={() => (confirmReset ? (resetProgress(), location.reload()) : setConfirmReset(true))}
            className="mt-5 text-xs text-slate-400 hover:text-rose-500 transition-colors"
          >
            {confirmReset ? 'Klik lagi untuk hapus semua progres' : 'Reset progres'}
          </button>
        </div>
      </div>

      {/* Kategori */}
      <h2 className="font-bold text-lg mb-3">Jalur Belajar</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KATEGORI.map((k, i) => {
          const list = CHALLENGES.filter((c) => c.kategori === k.id);
          const done = list.filter((c) => progress.solved[c.id]).length;
          return (
            <button
              key={k.id}
              onClick={() => nav(`/soal?k=${k.id}`)}
              className="text-left rounded-2xl bg-white border border-slate-200 p-5 hover:border-brand-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                {done === list.length ? (
                  <span className="text-brand-500"><CheckIcon className="w-5 h-5" /></span>
                ) : (
                  <span className="text-xs text-slate-400">{done}/{list.length}</span>
                )}
              </div>
              <div className="font-bold group-hover:text-brand-700 transition-colors">{k.nama}</div>
              <div className="text-xs text-slate-500 mt-1">{k.deskripsi}</div>
              <ProgressBar value={done / list.length} className="mt-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
