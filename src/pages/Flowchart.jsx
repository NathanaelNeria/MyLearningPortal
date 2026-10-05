import { useState } from 'react';
import { SIMBOL, QUIZ_SIMBOL, BACA_FLOWCHART, LATIHAN_FLOWCHART } from '../data/flowchart.js';
import FlowchartView, { SimbolShape } from '../components/FlowchartView.jsx';
import { QuizRunner } from '../components/McqCard.jsx';

const TABS = [
  { id: 'simbol', nama: 'Kenali Simbol' },
  { id: 'quiz', nama: 'Quiz Simbol' },
  { id: 'baca', nama: 'Membaca Flowchart' },
  { id: 'latihan', nama: 'Latihan Membuat' },
];

function TabSimbol() {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Simbol standar flowchart yang paling sering keluar di tes. Hafalkan bentuk dan fungsinya.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {SIMBOL.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white border border-slate-200 p-4 flex gap-4">
            <div className="w-24 shrink-0 flex items-center justify-center">
              <SimbolShape bentuk={s.bentuk} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm">{s.nama}</div>
              <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">{s.arti}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">contoh: {s.contoh}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabBaca() {
  const [aktif, setAktif] = useState(0);
  const fc = BACA_FLOWCHART[aktif];
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {BACA_FLOWCHART.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setAktif(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              aktif === i ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {f.judul.split('—')[0].trim()}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <div>
          <div className="font-bold text-sm mb-1">{fc.judul}</div>
          <p className="text-sm text-slate-500 mb-3">{fc.deskripsi}</p>
          <FlowchartView nodes={fc.nodes} edges={fc.edges} lebar={fc.lebar} tinggi={fc.tinggi} />
        </div>
        <QuizRunner key={fc.id} soalList={fc.soal} />
      </div>
    </div>
  );
}

function TabLatihan() {
  const [show, setShow] = useState({});
  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Gambar flowchart-mu di kertas atau{' '}
        <a href="https://app.diagrams.net/" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold underline">
          draw.io (alternatif Visio, gratis)
        </a>
        , lalu bandingkan dengan contoh solusi di bawah.
      </p>
      <div className="space-y-4">
        {LATIHAN_FLOWCHART.map((l) => (
          <div key={l.id} className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold">{l.judul}</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500">{l.tingkat}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">{l.prompt}</p>
            <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
              💡 {l.tips}
            </p>
            <button
              onClick={() => setShow((s) => ({ ...s, [l.id]: !s[l.id] }))}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {show[l.id] ? 'Sembunyikan solusi ▴' : 'Lihat contoh solusi ▾'}
            </button>
            {show[l.id] && (
              <div className="mt-3 max-w-md">
                <FlowchartView nodes={l.solusi.nodes} edges={l.solusi.edges} lebar={l.solusi.lebar} tinggi={l.solusi.tinggi} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Flowchart() {
  const [tab, setTab] = useState('simbol');
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-extrabold text-2xl mb-1">Flowchart</h1>
      <p className="text-sm text-slate-500 mb-5">
        Persiapan Flowchart Test — kenali simbol, latihan membaca alur, dan latihan menggambar.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              tab === t.id ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {t.nama}
          </button>
        ))}
      </div>
      {tab === 'simbol' && <TabSimbol />}
      {tab === 'quiz' && (
        <div>
          <p className="text-sm text-slate-500 mb-4">Jawab semua soal, lalu periksa jawabanmu.</p>
          <QuizRunner soalList={QUIZ_SIMBOL} />
        </div>
      )}
      {tab === 'baca' && <TabBaca />}
      {tab === 'latihan' && <TabLatihan />}
    </div>
  );
}
