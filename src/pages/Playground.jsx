import { useState } from 'react';
import { runQuery, isReadOnly } from '../lib/db.js';
import { translateMySQL } from '../lib/dialect.js';
import SqlEditor from '../components/SqlEditor.jsx';
import ResultTable from '../components/ResultTable.jsx';
import SchemaBrowser from '../components/SchemaBrowser.jsx';
import { DialectToggle } from '../components/ui.jsx';
import { useDialect } from '../lib/useDialect.js';

const STARTER = `-- Playground bebas — coba query apa pun di database TokoNusantara
-- Contoh:
SELECT pl.nama, COUNT(ps.id) AS pesanan
FROM pelanggan pl
JOIN pesanan ps ON ps.pelanggan_id = pl.id
GROUP BY pl.id
ORDER BY pesanan DESC
LIMIT 5;
`;

export default function Playground({ db }) {
  const [code, setCode] = useState(STARTER);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState(null);
  const [translated, setTranslated] = useState(null);
  const dialek = useDialect();

  const run = () => {
    if (!db) return;
    const sql = dialek === 'mysql' ? translateMySQL(code) : code;
    if (!isReadOnly(sql)) {
      setMsg({ type: 'err', text: 'Hanya query SELECT/WITH yang diizinkan.' });
      setTranslated(null);
      return;
    }
    try {
      const res = runQuery(db, sql);
      setResult(res);
      setTranslated(sql !== code ? sql : null);
      setMsg({ type: 'ok', text: `${res.rows.length} baris hasil.` });
    } catch (e) {
      setMsg({ type: 'err', text: `Error SQL: ${e.message}` });
      setTranslated(sql !== code ? sql : null);
      setResult(null);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="font-extrabold text-2xl">Playground</h1>
        <p className="text-sm text-slate-500 mt-1">
          Eksperimen bebas — database SQLite TokoNusantara siap dipakai. Cocok juga sebagai tool saat latihan tes.
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-3">
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Editor SQL{dialek === 'mysql' ? ' · MySQL → SQLite' : ''}
              </span>
              <span className="flex items-center gap-2">
                <DialectToggle />
                <span className="text-[11px] text-slate-400">Ctrl+Enter = Jalankan</span>
              </span>
            </div>
            <div className="h-72">
              <SqlEditor value={code} onChange={setCode} onRun={run} height="288px" />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={run}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-500 transition-colors"
              >
                ▶ Jalankan
              </button>
              <button onClick={() => setCode(STARTER)} className="text-xs text-slate-400 hover:text-slate-600">
                Reset
              </button>
            </div>
          </div>
          {msg && (
            <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${msg.type === 'err' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {msg.text}
            </div>
          )}
          {translated && (
            <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <summary className="text-xs font-semibold text-slate-500 cursor-pointer">
                Query-mu dijalankan sebagai SQLite — lihat terjemahan
              </summary>
              <pre className="mt-2 text-[12px] font-mono text-slate-600 whitespace-pre-wrap">{translated}</pre>
            </details>
          )}
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hasil {result ? `— ${result.rows.length} baris` : ''}
            </div>
            <div className="h-80">
              <ResultTable result={result} emptyText="Jalankan query untuk melihat hasil." />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 lg:sticky lg:top-4">
          <SchemaBrowser db={db} />
        </div>
      </div>
    </div>
  );
}
