import { useMemo, useState } from 'react';
import { CHALLENGES, KATEGORI } from '../data/challenges.js';
import { getProgress } from '../lib/progress.js';
import { TingkatBadge, CheckIcon } from '../components/ui.jsx';
import { nav } from '../lib/router.js';

const FILTERS_TINGKAT = ['semua', 'mudah', 'sedang', 'sulit'];
const KATEGORI_NAMA = new Map(KATEGORI.map((k) => [k.id, k.nama]));

export default function ChallengeList({ initialKategori = 'semua' }) {
  const progress = getProgress();
  const [kategori, setKategori] = useState(initialKategori);
  const [tingkat, setTingkat] = useState('semua');
  const [status, setStatus] = useState('semua');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    return CHALLENGES.filter((c) => {
      if (kategori !== 'semua' && c.kategori !== kategori) return false;
      if (tingkat !== 'semua' && c.tingkat !== tingkat) return false;
      const done = !!progress.solved[c.id];
      if (status === 'selesai' && !done) return false;
      if (status === 'belum' && done) return false;
      if (q && !c.judul.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [kategori, tingkat, status, q, progress]);

  const katNama = (id) => KATEGORI_NAMA.get(id) || id;
  const chip = (active) =>
    `px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
      active
        ? 'bg-ink-900 text-white border-ink-900'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-extrabold text-2xl">Tantangan</h1>
          <p className="text-sm text-slate-500 mt-1">
            {Object.keys(progress.solved).length}/{CHALLENGES.length} selesai · klik soal untuk mulai
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari soal..."
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <button className={chip(kategori === 'semua')} onClick={() => setKategori('semua')}>
          Semua kategori
        </button>
        {KATEGORI.map((k) => (
          <button key={k.id} className={chip(kategori === k.id)} onClick={() => setKategori(k.id)}>
            {k.nama}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS_TINGKAT.map((t) => (
          <button key={t} className={chip(tingkat === t)} onClick={() => setTingkat(t)}>
            {t === 'semua' ? 'Semua tingkat' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span className="w-px bg-slate-200 mx-1" />
        {['semua', 'belum', 'selesai'].map((s) => (
          <button key={s} className={chip(status === s)} onClick={() => setStatus(s)}>
            {s === 'semua' ? 'Semua status' : s === 'belum' ? 'Belum selesai' : 'Selesai'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {list.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-400">Tidak ada soal yang cocok.</div>}
        {list.map((c, i) => {
          const done = !!progress.solved[c.id];
          return (
            <button
              key={c.id}
              onClick={() => nav(`/soal/${c.id}`)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-brand-50 transition-colors ${
                i !== list.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  done ? 'bg-brand-500 text-white' : 'border-2 border-slate-200 text-transparent'
                }`}
              >
                <CheckIcon className="w-3.5 h-3.5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className={`font-semibold text-sm block truncate ${done ? 'text-slate-400' : 'text-slate-800'}`}>
                  {c.judul}
                </span>
                <span className="text-xs text-slate-400 font-mono">{c.konsep}</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:block">{katNama(c.kategori)}</span>
              <TingkatBadge tingkat={c.tingkat} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
