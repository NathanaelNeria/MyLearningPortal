import { useState } from 'react';
import { CheckIcon } from './ui.jsx';

// Kartu soal pilihan ganda dengan pembahasan — dipakai quiz simbol, baca flowchart, dan math logic.
export default function McqCard({ soal, nomor, jawaban, onJawab, revealed }) {
  const dipilih = jawaban;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        {nomor != null && (
          <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">
            {nomor}
          </span>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed mb-3">{soal.soal}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {soal.pilihan.map((p, i) => {
              const benar = i === soal.jawaban;
              const isDipilih = dipilih === i;
              let cls = 'border-slate-200 hover:border-brand-400 hover:bg-brand-50';
              if (revealed && benar) cls = 'border-emerald-400 bg-emerald-50';
              else if (revealed && isDipilih && !benar) cls = 'border-rose-300 bg-rose-50';
              else if (isDipilih) cls = 'border-brand-500 bg-brand-50';
              return (
                <button
                  key={i}
                  onClick={() => !revealed && onJawab(i)}
                  disabled={revealed}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors flex items-center gap-2 ${cls}`}
                >
                  <span className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                    {revealed && benar ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : String.fromCharCode(65 + i)}
                  </span>
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
          {revealed && soal.pembahasan && (
            <div className={`mt-3 text-[13px] rounded-lg px-3 py-2 ${dipilih === soal.jawaban ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              <span className="font-semibold">{dipilih === soal.jawaban ? 'Benar! ' : 'Pembahasan: '}</span>
              {soal.pembahasan}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mode quiz sekali jalan: semua soal tampil, tombol "Periksa" di akhir.
export function QuizRunner({ soalList }) {
  const [jawaban, setJawaban] = useState({});
  const [checked, setChecked] = useState(false);
  const score = soalList.filter((s) => jawaban[s.id] === s.jawaban).length;
  const allAnswered = soalList.every((s) => jawaban[s.id] !== undefined);

  return (
    <div className="space-y-3">
      {soalList.map((s, i) => (
        <McqCard
          key={s.id}
          soal={s}
          nomor={i + 1}
          jawaban={jawaban[s.id]}
          revealed={checked}
          onJawab={(v) => setJawaban((j) => ({ ...j, [s.id]: v }))}
        />
      ))}
      <div className="flex items-center gap-4 pt-2">
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            disabled={!allAnswered}
            className="px-5 py-2.5 rounded-xl bg-ink-900 text-white text-sm font-semibold hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {allAnswered ? 'Periksa jawaban' : `Jawab semua dulu (${Object.keys(jawaban).length}/${soalList.length})`}
          </button>
        ) : (
          <>
            <div className={`font-bold text-lg ${score === soalList.length ? 'text-emerald-600' : 'text-slate-800'}`}>
              Skor: {score}/{soalList.length}
            </div>
            <button
              onClick={() => { setJawaban({}); setChecked(false); }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:border-slate-400 transition-colors"
            >
              Ulangi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
