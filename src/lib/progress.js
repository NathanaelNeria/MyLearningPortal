import { TINGKAT } from '../data/challenges.js';

const KEY = 'belajarsql-progress-v1';

// Cache di memori: parse localStorage sekali, kembalikan referensi yang sama
// sampai ada penulisan. Semua baca lewat load() jadi O(1) tanpa JSON.parse ulang.
let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache;
    }
  } catch {
    /* abaikan */
  }
  cache = { solved: {}, xp: 0 };
  return cache;
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    cache = state;
    window.dispatchEvent(new CustomEvent('belajarsql-progress'));
  } catch {
    /* abaikan */
  }
}

// Tab lain menulis KEY yang sama -> buang cache supaya baca berikutnya parse ulang.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY || e.key === null) cache = null;
  });
}

export function getProgress() {
  return load();
}

export function isSolved(id) {
  return !!load().solved[id];
}

export function markSolved(id, tingkat) {
  const cur = load();
  const first = !cur.solved[id];
  if (first) {
    // Salin dulu supaya cache tetap identik dengan isi localStorage kalau save() gagal.
    const state = { ...cur, solved: { ...cur.solved } };
    state.solved[id] = { at: Date.now() };
    state.xp += TINGKAT[tingkat]?.xp || 10;
    save(state);
    return { first, xp: state.xp };
  }
  return { first, xp: cur.xp };
}

export function solvedCount() {
  return Object.keys(load().solved).length;
}

export const LEVELS = [
  { nama: 'Pemula', min: 0 },
  { nama: 'Pelajar', min: 100 },
  { nama: 'Analis Junior', min: 250 },
  { nama: 'Analis', min: 450 },
  { nama: 'Analis Senior', min: 700 },
  { nama: 'Master SQL', min: 950 },
];

export function levelInfo(xp) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  return {
    nama: cur.nama,
    level: idx + 1,
    curMin: cur.min,
    next,
    progress: next ? (xp - cur.min) / (next.min - cur.min) : 1,
  };
}

export function resetProgress() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
}
