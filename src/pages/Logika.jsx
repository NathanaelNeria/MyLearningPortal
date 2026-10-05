import { useEffect, useRef, useState } from 'react';
import { SOAL_LOGIKA, TIPE_SOAL, SOAL_SIMBOL_CAMPURAN } from '../data/logika.js';
import McqCard, { QuizRunner } from '../components/McqCard.jsx';

function ModeSimulasi() {
  const { durasiMenit, jumlah } = SOAL_SIMBOL_CAMPURAN;
  const [soal] = useState(() =>
    [...SOAL_LOGIKA].sort(() => Math.random() - 0.5).slice(0, jumlah),
  );
  const [idx, setIdx] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [sisa, setSisa] = useState(durasiMenit * 60);
  const [selesai, setSelesai] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setSisa((s) => {
        if (s <= 1) {
          clearInterval(timer.current);
          setSelesai(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, []);

  const skor = soal.filter((s) => jawaban[s.id] === s.jawaban).length;
  const mm = String(Math.floor(sisa / 60)).padStart(2, '0');
  const ss = String(sisa % 60).padStart(2, '0');
  const cur = soal[idx];

  if (selesai) {
    const persen = Math.round((skor / soal.length) * 100);
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Simulasi selesai</div>
        <div className={`text-4xl font-extrabold mb-1 ${persen >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>{persen}%</div>
        <div className="text-sm text-slate-500 mb-4">
          {skor} benar dari {soal.length} soal
        </div>
        <div className="text-left space-y-3 mb-4">
          {soal.map((s, i) => (
            <McqCard key={s.id} soal={s} nomor={i + 1} jawaban={jawaban[s.id]} revealed onJawab={() => {}} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 rounded-xl bg-ink-900 text-white px-4 py-2.5">
        <span className="text-sm font-semibold">
          Soal {idx + 1}/{soal.length} · <span className="text-slate-300">{TIPE_SOAL[cur.tipe]}</span>
        </span>
        <span className={`font-mono font-bold ${sisa < 60 ? 'text-rose-400' : ''}`}>{mm}:{ss}</span>
      </div>
      <McqCard soal={cur} jawaban={jawaban[cur.id]} revealed={false} onJawab={(v) => setJawaban((j) => ({ ...j, [cur.id]: v }))} />
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40 bg-white"
        >
          ← Sebelumnya
        </button>
        <div className="flex gap-1.5">
          {soal.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              className={`w-7 h-7 rounded-lg text-[11px] font-bold border transition-colors ${
                i === idx ? 'bg-ink-900 text-white border-ink-900' : jawaban[s.id] !== undefined ? 'bg-brand-100 border-brand-300 text-brand-700' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {idx === soal.length - 1 ? (
          <button
            onClick={() => { clearInterval(timer.current); setSelesai(true); }}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-500"
          >
            Selesai & Nilai
          </button>
        ) : (
          <button onClick={() => setIdx((i) => i + 1)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm bg-white">
            Berikutnya →
          </button>
        )}
      </div>
    </div>
  );
}

export default function Logika() {
  const [mode, setMode] = useState('latihan');
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-extrabold text-2xl mb-1">Math Logic</h1>
      <p className="text-sm text-slate-500 mb-5">
        Persiapan Math Logic Test — deret angka, aritmetika, perbandingan, dan penalaran logika.
      </p>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('latihan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mode === 'latihan' ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
        >
          Mode Latihan ({SOAL_LOGIKA.length} soal + pembahasan)
        </button>
        <button
          onClick={() => setMode('simulasi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mode === 'simulasi' ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
        >
          Mode Simulasi ({SOAL_SIMBOL_CAMPURAN.jumlah} soal · {SOAL_SIMBOL_CAMPURAN.durasiMenit} menit)
        </button>
      </div>
      {mode === 'latihan' ? <QuizRunner soalList={SOAL_LOGIKA} /> : <ModeSimulasi />}
    </div>
  );
}
