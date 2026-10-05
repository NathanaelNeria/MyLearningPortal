import { useEffect, useMemo, useState } from 'react';
import { useHashRoute, nav } from './lib/router.js';
import { getDb } from './lib/db.js';
import { getProgress, levelInfo } from './lib/progress.js';
import Dashboard from './pages/Dashboard.jsx';
import ChallengeList from './pages/ChallengeList.jsx';
import ChallengeDetail from './pages/ChallengeDetail.jsx';
import Playground from './pages/Playground.jsx';
import Materi from './pages/Materi.jsx';
import Flowchart from './pages/Flowchart.jsx';
import Logika from './pages/Logika.jsx';

const NAV = [
  { to: '/soal', nama: 'Tantangan SQL' },
  { to: '/materi', nama: 'Materi' },
  { to: '/playground', nama: 'Playground' },
  { to: '/flowchart', nama: 'Flowchart' },
  { to: '/logika', nama: 'Math Logic' },
];

export default function App() {
  const route = useHashRoute();
  const [db, setDb] = useState(null);
  const [err, setErr] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('belajarsql-progress', bump);
    return () => window.removeEventListener('belajarsql-progress', bump);
  }, []);
  const progress = useMemo(() => getProgress(), [tick, route]);
  const lvl = levelInfo(progress.xp);

  useEffect(() => {
    getDb().then(setDb).catch((e) => setErr(e.message || String(e)));
  }, []);

  let page = null;
  const [path, qs] = route.split('?');
  if (path === '/' || path === '') page = <Dashboard />;
  else if (path === '/soal') {
    const k = new URLSearchParams(qs || '').get('k') || 'semua';
    page = <ChallengeList initialKategori={k} />;
  } else if (path.startsWith('/soal/')) {
    const id = path.slice(6);
    page = <ChallengeDetail key={id} id={id} db={db} />;
  }
  else if (path === '/playground') page = <Playground db={db} />;
  else if (path === '/materi') page = <Materi db={db} />;
  else if (path === '/flowchart') page = <Flowchart />;
  else if (path === '/logika') page = <Logika />;
  else page = <Dashboard />;

  const isSql = path.startsWith('/soal') || path === '/playground' || path === '/materi';

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => nav('/')} className="flex items-center gap-2 font-extrabold text-[17px] tracking-tight">
            <span className="w-7 h-7 rounded-lg bg-ink-900 text-white flex items-center justify-center text-[11px] font-mono font-bold">
              {'{}'}
            </span>
            Belajar<span className="text-brand-600">SQL</span>
          </button>
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            {NAV.map((n) => (
              <button
                key={n.to}
                onClick={() => nav(n.to)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  path === n.to || (n.to === '/soal' && path.startsWith('/soal'))
                    ? 'bg-ink-900 text-white'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {n.nama}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {db === null && !err && isSql && (
              <span className="text-[11px] text-amber-600 font-medium animate-pulse">memuat database…</span>
            )}
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-100 text-[11px] font-bold text-brand-700">
              Lv {lvl.level} · {lvl.nama}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-ink-900 text-white text-[11px] font-bold font-mono">
              {progress.xp} XP
            </span>
          </div>
        </div>
        {/* nav mobile */}
        <nav className="sm:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.to}
              onClick={() => nav(n.to)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                path === n.to || (n.to === '/soal' && path.startsWith('/soal'))
                  ? 'bg-ink-900 text-white'
                  : 'text-slate-500'
              }`}
            >
              {n.nama}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {err && (
          <div className="max-w-3xl mx-auto mt-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 text-sm">
            Gagal memuat database SQL (sql.js/WASM): {err}
          </div>
        )}
        {page}
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-[11px] text-slate-400">
        BelajarSQL — database TokoNusantara berjalan di browser-mu (SQLite/WASM) · progres tersimpan lokal
      </footer>
    </div>
  );
}
