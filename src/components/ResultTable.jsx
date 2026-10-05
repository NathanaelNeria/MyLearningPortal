import { formatVal } from '../lib/format.js';

const MAX_ROWS = 300;

export default function ResultTable({ result, emptyText = 'Tidak ada baris.' }) {
  if (!result || !result.columns?.length) {
    return <div className="px-4 py-6 text-sm text-slate-400 italic">{emptyText}</div>;
  }
  const { columns, rows } = result;
  const shown = rows.slice(0, MAX_ROWS);
  return (
    <div className="overflow-auto scroll-thin h-full">
      <table className="w-full text-[13px] border-collapse">
        <thead className="sticky top-0 z-10">
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className="bg-slate-100 text-slate-600 font-semibold text-left px-3 py-2 border-b border-slate-200 whitespace-nowrap font-mono text-xs"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, ri) => (
            <tr key={ri} className={ri % 2 ? 'bg-slate-50' : 'bg-white'}>
              {row.map((v, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-1.5 border-b border-slate-100 whitespace-nowrap font-mono ${
                    v === null ? 'text-slate-400 italic' : typeof v === 'number' ? 'text-right text-slate-800' : 'text-slate-800'
                  }`}
                >
                  {formatVal(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > MAX_ROWS && (
        <div className="px-4 py-2 text-xs text-slate-400">+{rows.length - MAX_ROWS} baris lainnya tidak ditampilkan</div>
      )}
      {rows.length === 0 && <div className="px-4 py-6 text-sm text-slate-400 italic">Query berhasil, 0 baris.</div>}
    </div>
  );
}
