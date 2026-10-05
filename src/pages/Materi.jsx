import { useState } from 'react';
import { MATERI } from '../data/materi.js';
import { KATEGORI } from '../data/challenges.js';
import { runQuery } from '../lib/db.js';
import { translateMySQL } from '../lib/dialect.js';
import ResultTable from '../components/ResultTable.jsx';
import { useDialect } from '../lib/useDialect.js';
import { nav } from '../lib/router.js';

function ContohBlock({ sql, db, mysql }) {
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const dialek = useDialect();
  const jalankan = () => {
    try {
      // Contoh bertanda mysql selalu diterjemahkan; contoh lain ikut dialek aktif.
      const final = mysql || dialek === 'mysql' ? translateMySQL(sql) : sql;
      setRes(runQuery(db, final));
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };
  return (
    <div className="mt-2">
      <pre className="rounded-lg bg-ink-900 text-emerald-200 text-[12.5px] font-mono px-3 py-2.5 overflow-x-auto scroll-thin whitespace-pre-wrap">
        {sql}
      </pre>
      <div className="flex items-center gap-2 mt-1.5">
        <button onClick={jalankan} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
          ▶ Jalankan contoh
        </button>
        {res && <span className="text-[11px] text-slate-400">{res.rows.length} baris</span>}
      </div>
      {err && <div className="mt-1.5 text-xs text-rose-600 font-medium">Error: {err}</div>}
      {res && (
        <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden max-h-52">
          <ResultTable result={res} />
        </div>
      )}
    </div>
  );
}

export default function Materi({ db }) {
  const [aktif, setAktif] = useState('dasar');
  const materi = MATERI.find((m) => m.kategori === aktif);
  const kat = KATEGORI.find((k) => k.id === aktif);
  // Tab = 7 jalur soal + materi ekstra di luar jalur (mis. Mode MySQL).
  const tabs = [
    ...KATEGORI.map((k) => ({ id: k.id, nama: k.nama })),
    ...MATERI.filter((m) => !KATEGORI.some((k) => k.id === m.kategori)).map((m) => ({ id: m.kategori, nama: m.judul })),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-extrabold text-2xl mb-1">Materi & Cheat Sheet</h1>
      <p className="text-sm text-slate-500 mb-5">Ringkasan konsep per jalur — semua contoh bisa langsung dijalankan.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((k) => (
          <button
            key={k.id}
            onClick={() => setAktif(k.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              aktif === k.id ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {k.nama}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {materi.sections.map((s, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5">
            <h3 className="font-bold text-[15px] mb-1.5">{s.judul}</h3>
            <p
              className="text-sm text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: s.isi.replace(/`(.+?)`/g, '<code class="font-mono text-[12px] bg-slate-100 px-1 rounded">$1</code>') }}
            />
            <ContohBlock sql={s.contoh} db={db} mysql={s.mysql} />
          </div>
        ))}
      </div>

      {kat && (
        <div className="mt-6 text-center">
          <button onClick={() => nav(`/soal?k=${aktif}`)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Latihan soal {kat.nama} →
          </button>
        </div>
      )}
    </div>
  );
}
