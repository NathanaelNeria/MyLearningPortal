import { TINGKAT } from '../data/challenges.js';

const KEY = 'belajarsql-progress-v1';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* abaikan */
  }
  return { solved: {}, xp: 0 };
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('belajarsql-progress'));
  } catch {
    /* abaikan */
  }
}

export function getProgress() {
  return load();
}

export function isSolved(id) {
  return !!load().solved[id];
}

export function markSolved(id, tingkat) {
  const state = load();
  const first = !state.solved[id];
  if (first) {
    state.solved[id] = { at: Date.now() };
    state.xp += TINGKAT[tingkat]?.xp || 10;
    save(state);
  }
  return { first, xp: state.xp };
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
  localStorage.removeItem(KEY);
}
