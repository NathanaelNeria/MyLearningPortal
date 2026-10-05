import { useState } from 'react';
import { TABLES } from '../data/schema.js';

export default function SchemaBrowser({ db }) {
  const [open, setOpen] = useState(null);
  const [preview, setPreview] = useState({});

  const toggle = async (name) => {
    setOpen(open === name ? null : name);
    if (db && !preview[name]) {
      try {
        const res = db.exec(`SELECT * FROM ${name} LIMIT 3`);
        if (res.length) setPreview((p) => ({ ...p, [name]: res[0] }));
      } catch {
        /* abaikan */
      }
    }
  };

  return (
    <div className="text-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">Skema Database</div>
      <div className="space-y-1">
        {TABLES.map((t) => (
          <div key={t.name} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => toggle(t.name)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-left"
            >
              <span className="font-mono font-semibold text-[13px] text-brand-700">{t.name}</span>
              <span className="text-xs text-slate-400">
                {t.rows.length} baris {open === t.name ? '▾' : '▸'}
              </span>
            </button>
            {open === t.name && (
              <div className="border-t border-slate-100 px-3 py-2">
                <table className="w-full text-[12px]">
                  <tbody>
                    {t.columns.map(([col, type, desc]) => (
                      <tr key={col}>
                        <td className="py-0.5 font-mono text-slate-800 pr-2 align-top whitespace-nowrap">{col}</td>
                        <td className="py-0.5 text-brand-600 font-mono pr-2 align-top">{type}</td>
                        <td className="py-0.5 text-slate-400 align-top">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview[t.name] && (
                  <div className="mt-2 overflow-x-auto scroll-thin">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Contoh data</div>
                    <table className="text-[11px] font-mono border-collapse">
                      <tbody>
                        {preview[t.name].values.map((row, i) => (
                          <tr key={i}>
                            {row.map((v, j) => (
                              <td key={j} className="pr-3 text-slate-500 whitespace-nowrap">
                                {v === null ? 'NULL' : String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
