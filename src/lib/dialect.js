// Mode dialek: 'sqlite' (default) atau 'mysql'.
// Mode MySQL = terjemahkan syntax MySQL yang umum ke SQLite + fungsi-fungsi
// MySQL yang diregister sebagai UDF. Bukan transpiler penuh — cakupannya
// sengaja dibatasi ke hal yang wajar keluar di tes basic SQL.

const KEY = 'belajarsql-dialek';
const EVENT = 'belajarsql-dialek-changed';

export function getDialect() {
  try {
    return localStorage.getItem(KEY) === 'mysql' ? 'mysql' : 'sqlite';
  } catch {
    return 'sqlite';
  }
}

export function setDialect(d) {
  try {
    localStorage.setItem(KEY, d);
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch { /* abaikan */ }
}

export function onDialectChange(cb) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

// ── Terjemahan syntax MySQL → SQLite ─────────────────────────
// Hanya menyentuh bagian kode — literal string ('...'), double-quoted ("..."),
// dan komentar (-- dan /* */) dilewati agar tidak rusak.
function mapCode(sql, fn) {
  let out = '';
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const ch = sql[i];
    if (ch === "'") {
      let j = i + 1;
      while (j < n && (sql[j] !== "'" || sql[j + 1] === "'")) j += sql[j] === "'" ? 2 : 1;
      out += sql.slice(i, j + 1);
      i = j + 1;
    } else if (ch === '"') {
      let j = i + 1;
      while (j < n && sql[j] !== '"') j++;
      out += sql.slice(i, j + 1);
      i = j + 1;
    } else if (ch === '-' && sql[i + 1] === '-') {
      const j = sql.indexOf('\n', i);
      out += sql.slice(i, j === -1 ? n : j);
      i = j === -1 ? n : j;
    } else if (ch === '/' && sql[i + 1] === '*') {
      const j = sql.indexOf('*/', i + 2);
      out += sql.slice(i, j === -1 ? n : j + 2);
      i = j === -1 ? n : j + 2;
    } else {
      let j = i;
      while (
        j < n &&
        sql[j] !== "'" &&
        sql[j] !== '"' &&
        !(sql[j] === '-' && sql[j + 1] === '-') &&
        !(sql[j] === '/' && sql[j + 1] === '*')
      ) j++;
      out += fn(sql.slice(i, j));
      i = j;
    }
  }
  return out;
}

const UNITS = {
  second: 'seconds', minute: 'minutes', hour: 'hours',
  day: 'days', week: 'weeks', month: 'months', year: 'years',
};

// INTERVAL n unit → marker string yang dibaca UDF date_add/date_sub/timestampdiff.
function intervalToMarker(m, num, unit) {
  const u = UNITS[unit.toLowerCase()];
  if (!u) return m; // biarkan error natural kalau unit aneh
  return `'interval:${num}:${u.slice(0, -1)}'`;
}

export function translateMySQL(sql) {
  return mapCode(sql, (seg) => {
    let s = seg;
    s = s.replace(/`([^`]*)`/g, '"$1"'); // identifier backtick → "..."
    s = s.replace(/\bINTERVAL\s+(-?\d+)\s+(\w+)\b/gi, intervalToMarker);
    s = s.replace(/\bEXTRACT\s*\(\s*(\w+)\s+FROM\s+/gi, (_m, f) => `${f.toUpperCase()}(`);
    s = s.replace(/\bDIV\b/gi, '/');
    s = s.replace(/\bGREATEST\s*\(/gi, 'max('); // max/min scalar SQLite sudah variadik
    s = s.replace(/\bLEAST\s*\(/gi, 'min(');
    s = s.replace(/<=>/g, ' IS ');
    s = s.replace(/\bLIMIT\s+(\d+)\s*,\s*(\d+)/gi, 'LIMIT $2 OFFSET $1');
    s = s.replace(/\bSTRAIGHT_JOIN\b/gi, 'JOIN');
    // TIMESTAMPDIFF(MONTH, a, b): unit MySQL tanpa kutip → kutip supaya jadi string argumen.
    s = s.replace(/\b(TIMESTAMPDIFF|TIMESTAMPADD)\s*\(\s*(YEAR|QUARTER|MONTH|WEEK|DAY|HOUR|MINUTE|SECOND|FRAC_SECOND)\b/gi, (_m, fn, u) => `${fn.toUpperCase()}('${u.toUpperCase()}'`);
    // ISNULL(x) — 'isnull' keyword SQLite, tak bisa jadi nama fungsi → m_isnull UDF.
    s = s.replace(/\bISNULL\s*\(/gi, 'm_isnull(');
    s = s.replace(/^\s*SHOW\s+TABLES\s*;?/i, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
    s = s.replace(/^\s*(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+(\w+)\s*;?/i, 'PRAGMA table_info($1);');
    // # komentar ala MySQL → komentar SQL standar (hanya kalau di awal baris)
    s = s.replace(/^([ \t]*)#/gm, '$1--');
    // NOW()/CURDATE()/CURTIME() dsb ditangani lewat UDF di bawah.
    return s;
  });
}

// Eksekusi query user dengan dialek terpilih. Lempar Error apa adanya.
export function execUserSql(db, sql) {
  const final = getDialect() === 'mysql' ? translateMySQL(sql) : sql;
  const results = db.exec(final);
  if (!results.length) return { columns: [], rows: [] };
  const last = results[results.length - 1];
  return { columns: last.columns, rows: last.values };
}

export function translatedPreview(sql) {
  return translateMySQL(sql);
}

// ── Fungsi-fungsi MySQL sebagai SQLite UDF ───────────────────
// Dipanggil SEKALI saat db dibuat. Semuanya scalar function biasa —
// SQLite mengizinkan nama fungsi custom (IF, NOW, dll) karena tidak
// bentrok dengan keyword.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseDate(v) {
  if (v == null) return null;
  let s = String(v).replace(' ', 'T');
  if (s.length === 10) s += 'T00:00:00';
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += 'Z'; // tanggal naif = UTC, konsisten dengan formatter getUTC*
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
const pad = (n, l = 2) => String(n).padStart(l, '0');
const fmtDate = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const fmtDateTime = (d) => `${fmtDate(d)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;

// DATE_FORMAT: subset specifier yang umum (%Y %m %d %H %i %s %M %W %e %c %y)
function dateFormat(v, fmt) {
  const d = parseDate(v);
  if (!d || fmt == null) return null;
  const map = {
    Y: String(d.getUTCFullYear()), y: String(d.getUTCFullYear()).slice(-2),
    m: pad(d.getUTCMonth() + 1), c: String(d.getUTCMonth() + 1), M: MONTHS[d.getUTCMonth()], b: MONTHS[d.getUTCMonth()].slice(0, 3),
    d: pad(d.getUTCDate()), e: String(d.getUTCDate()),
    H: pad(d.getUTCHours()), h: pad(((d.getUTCHours() + 11) % 12) + 1),
    i: pad(d.getUTCMinutes()), s: pad(d.getUTCSeconds()), S: pad(d.getUTCSeconds()),
    p: d.getUTCHours() < 12 ? 'AM' : 'PM',
    W: DAYS[d.getUTCDay()], a: DAYS[d.getUTCDay()].slice(0, 3),
    w: String(d.getUTCDay()), j: String(dayOfYear(d)),
  };
  return String(fmt).replace(/%(.)/g, (m, c) => map[c] ?? m);
}
function dayOfYear(d) {
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400000);
}

function intervalParts(marker) {
  const m = /^interval:(-?\d+):(\w+)$/.exec(String(marker));
  if (!m) return null;
  return { n: parseInt(m[1], 10), unit: m[2] };
}

function shiftDate(v, n, unit, sign) {
  const d = parseDate(v);
  if (!d) return null;
  const s = sign * n;
  const r = new Date(d.getTime());
  switch (unit) {
    case 'year': r.setUTCFullYear(r.getUTCFullYear() + s); break;
    case 'month': r.setUTCMonth(r.getUTCMonth() + s); break;
    case 'week': r.setUTCDate(r.getUTCDate() + 7 * s); break;
    case 'day': r.setUTCDate(r.getUTCDate() + s); break;
    case 'hour': r.setUTCHours(r.getUTCHours() + s); break;
    case 'minute': r.setUTCMinutes(r.getUTCMinutes() + s); break;
    case 'second': r.setUTCSeconds(r.getUTCSeconds() + s); break;
    default: return null;
  }
  return String(v).length > 10 ? fmtDateTime(r) : fmtDate(r);
}

export function registerMySQLFunctions(db) {
  const fns = {
    // logika
    if: (c, a, b) => (c ? a : b),
    ifnull: (a, b) => (a == null ? b : a), // SQLite sudah punya — override aman
    // string
    concat: (...xs) => xs.map((x) => (x == null ? '' : String(x))).join(''),
    concat_ws: (sep, ...xs) => xs.filter((x) => x != null).map(String).join(sep),
    left: (s, n) => String(s ?? '').slice(0, n),
    right: (s, n) => String(s ?? '').slice(-n),
    substring_index: (s, delim, count) => {
      const parts = String(s ?? '').split(String(delim));
      return count >= 0 ? parts.slice(0, count).join(String(delim)) : parts.slice(count).join(String(delim));
    },
    lpad: (s, len, padStr) => String(s ?? '').padStart(len, String(padStr)).slice(0, len),
    rpad: (s, len, padStr) => String(s ?? '').padEnd(len, String(padStr)).slice(0, len),
    repeat: (s, n) => String(s ?? '').repeat(Math.max(0, n)),
    reverse: (s) => [...String(s ?? '')].reverse().join(''),
    ucase: (s) => String(s ?? '').toUpperCase(),
    lcase: (s) => String(s ?? '').toLowerCase(),
    space: (n) => ' '.repeat(Math.max(0, n)),
    ascii: (s) => (s == null ? 0 : String(s).codePointAt(0) ?? 0),
    strcmp: (a, b) => (String(a) === String(b) ? 0 : String(a) < String(b) ? -1 : 1),
    char_length: (s) => String(s ?? '').length,
    character_length: (s) => String(s ?? '').length,
    // numerik
    ceil: Math.ceil,
    floor: Math.floor,
    mod: (a, b) => a % b,
    pow: Math.pow,
    power: Math.pow,
    sqrt: Math.sqrt,
    exp: Math.exp,
    ln: Math.log,
    log2: Math.log2,
    log10: Math.log10,
    pi: () => Math.PI,
    sign: (x) => Math.sign(x),
    abs: Math.abs,
    truncate: (x, d) => { const k = 10 ** d; return Math.trunc(x * k) / k; },
    conv: (n, from, to) => parseInt(String(n), from).toString(to),
    // tanggal & waktu
    now: () => fmtDateTime(new Date()),
    sysdate: () => fmtDateTime(new Date()),
    curdate: () => fmtDate(new Date()),
    current_date: () => fmtDate(new Date()),
    curtime: () => new Date().toISOString().slice(11, 19),
    current_time: () => new Date().toISOString().slice(11, 19),
    current_timestamp: () => fmtDateTime(new Date()),
    utc_date: () => fmtDate(new Date()),
    utc_time: () => new Date().toISOString().slice(11, 19),
    utc_timestamp: () => fmtDateTime(new Date()),
    year: (v) => parseDate(v)?.getUTCFullYear() ?? null,
    month: (v) => (parseDate(v) ? parseDate(v).getUTCMonth() + 1 : null),
    monthname: (v) => (parseDate(v) ? MONTHS[parseDate(v).getUTCMonth()] : null),
    day: (v) => parseDate(v)?.getUTCDate() ?? null,
    dayofmonth: (v) => parseDate(v)?.getUTCDate() ?? null,
    dayofweek: (v) => (parseDate(v) ? parseDate(v).getUTCDay() + 1 : null), // MySQL: 1=Minggu
    dayofyear: (v) => (parseDate(v) ? dayOfYear(parseDate(v)) : null),
    dayname: (v) => (parseDate(v) ? DAYS[parseDate(v).getUTCDay()] : null),
    weekday: (v) => { const d = parseDate(v); return d ? (d.getUTCDay() + 6) % 7 : null; }, // MySQL: 0=Senin
    weekofyear: (v) => { const d = parseDate(v); return d ? Math.ceil(dayOfYear(d) / 7) : null; },
    hour: (v) => { const m = /(\d{1,2}):(\d{2})/.exec(String(v ?? '')); return m ? +m[1] : (parseDate(v)?.getUTCHours() ?? null); },
    minute: (v) => { const m = /\d{1,2}:(\d{2})/.exec(String(v ?? '')); return m ? +m[1] : (parseDate(v)?.getUTCMinutes() ?? null); },
    second: (v) => { const m = /\d{2}:(\d{2})$/.exec(String(v ?? '')); return m ? +m[1] : (parseDate(v)?.getUTCSeconds() ?? null); },
    quarter: (v) => (parseDate(v) ? Math.floor(parseDate(v).getUTCMonth() / 3) + 1 : null),
    last_day: (v) => { const d = parseDate(v); if (!d) return null; return fmtDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))); },
    date: (v) => { const d = parseDate(v); return d ? fmtDate(d) : null; },
    time: (v) => { const m = /(\d{2}:\d{2}:\d{2})/.exec(String(v ?? '')); return m ? m[1] : null; },
    datediff: (a, b) => {
      const da = parseDate(a); const db2 = parseDate(b);
      if (!da || !db2) return null;
      return Math.round((Date.UTC(da.getUTCFullYear(), da.getUTCMonth(), da.getUTCDate()) - Date.UTC(db2.getUTCFullYear(), db2.getUTCMonth(), db2.getUTCDate())) / 86400000);
    },
    timediff: (a, b) => {
      const da = parseDate(a); const db2 = parseDate(b);
      if (!da || !db2) return null;
      const s = Math.round((da - db2) / 1000);
      const sign = s < 0 ? '-' : '';
      const abs = Math.abs(s);
      return `${sign}${pad(Math.floor(abs / 3600))}:${pad(Math.floor(abs / 60) % 60)}:${pad(abs % 60)}`;
    },
    timestampadd: (unit, n, v) => shiftDate(v, n, String(unit).toLowerCase(), +1),
    timestampdiff: (unit, a, b) => {
      const da = parseDate(a); const db2 = parseDate(b);
      if (!da || !db2) return null;
      const u = String(unit).toLowerCase();
      const ms = db2 - da;
      if (u === 'second') return Math.trunc(ms / 1000);
      if (u === 'minute') return Math.trunc(ms / 60000);
      if (u === 'hour') return Math.trunc(ms / 3600000);
      if (u === 'day') return Math.trunc(ms / 86400000);
      if (u === 'week') return Math.trunc(ms / 604800000);
      if (u === 'month') return (db2.getUTCFullYear() - da.getUTCFullYear()) * 12 + (db2.getUTCMonth() - da.getUTCMonth());
      if (u === 'year') return db2.getUTCFullYear() - da.getUTCFullYear();
      return null;
    },
    date_format: dateFormat,
    str_to_date: (v, _fmt) => v, // data kita sudah ISO — pass-through
    date_add: (v, marker) => {
      const p = intervalParts(marker);
      return p ? shiftDate(v, p.n, p.unit, +1) : null;
    },
    date_sub: (v, marker) => {
      const p = intervalParts(marker);
      return p ? shiftDate(v, p.n, p.unit, -1) : null;
    },
    adddate: (v, marker) => {
      const p = intervalParts(marker);
      return p ? shiftDate(v, p.n, p.unit, +1) : null;
    },
    subdate: (v, marker) => {
      const p = intervalParts(marker);
      return p ? shiftDate(v, p.n, p.unit, -1) : null;
    },
    makedate: (y, doy) => fmtDate(new Date(Date.UTC(y, 0, doy))),
    maketime: (h, m, s) => `${pad(h)}:${pad(m)}:${pad(s)}`,
    time_to_sec: (t) => { const m = /(-?)(\d+):(\d+):(\d+)/.exec(String(t ?? '')); return m ? (+m[2] * 3600 + +m[3] * 60 + +m[4]) * (m[1] ? -1 : 1) : null; },
    sec_to_time: (s) => { const a = Math.abs(Math.trunc(s ?? 0)); return `${s < 0 ? '-' : ''}${pad(Math.floor(a / 3600))}:${pad(Math.floor(a / 60) % 60)}:${pad(a % 60)}`; },
    // agregat-ish & lainnya
    regexp: (pattern, value) => {
      try { return new RegExp(String(pattern)).test(String(value)) ? 1 : 0; } catch { return 0; }
    },
    m_isnull: (v) => (v == null ? 1 : 0), // hasil terjemahan ISNULL(...) — 'isnull' keyword SQLite
    md5: (s) => { // bukan kriptografi kuat — hanya agar query jalan saat latihan
      let h = 0x811c9dc5;
      for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193); }
      return (h >>> 0).toString(16).padStart(8, '0');
    },
    version: () => 'sqlite-js (mode kompatibilitas MySQL)',
    database: () => 'tokonusantara',
    row_count: () => 0,
    found_rows: () => 0,
  };
  for (const [name, fn] of Object.entries(fns)) {
    try {
      db.create_function(name, fn);
    } catch { /* nama bentrok atau tidak didukung — lanjut */ }
  }

  // Fungsi variadik / argumen opsional: sql.js mengunci arity dari fn.length,
  // jadi tiap jumlah argumen wajar didaftarkan eksplisit via defineProperty.
  const V = (impl, n) => Object.defineProperty((...args) => impl(...args), 'length', { value: n });
  const varFns = [
    ['elt', [1, 2, 3, 4, 5, 6, 7, 8], (n, ...xs) => { const i = Math.trunc(n); return i >= 1 && i <= xs.length ? xs[i - 1] : null; }],
    ['field', [2, 3, 4, 5, 6, 7, 8], (v, ...xs) => xs.findIndex((x) => String(x) === String(v)) + 1],
    ['char', [1, 2, 3, 4, 5], (...a) => String.fromCodePoint(...a.map(Number))],
    ['mid', [2, 3], (s, p, l) => String(s ?? '').substr(p - 1, l ?? undefined)],
    ['locate', [2, 3], (sub, s, pos = 1) => String(s ?? '').indexOf(String(sub), pos - 1) + 1],
    ['log', [1, 2], (a, b) => (b === undefined ? Math.log(a) : Math.log(b) / Math.log(a))],
    ['round', [1, 2], (x, d = 0) => { const k = 10 ** d; return Math.round((x + Number.EPSILON) * k) / k; }],
    ['rand', [0, 1], () => Math.random()],
    ['format', [2, 3], (x, d) => Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })],
    ['week', [1, 2], (v) => { const d = parseDate(v); return d ? Math.ceil(dayOfYear(d) / 7) : null; }],
    ['find_in_set', [2], (v, csv) => String(csv ?? '').split(',').findIndex((x) => String(x) === String(v)) + 1],
    ['unix_timestamp', [0, 1], (v) => { if (v === undefined) return Math.floor(Date.now() / 1000); const d = parseDate(v); return d ? Math.floor(d / 1000) : null; }],
    ['from_unixtime', [1, 2], (s, fmt) => (fmt === undefined ? fmtDateTime(new Date(Number(s) * 1000)) : dateFormat(new Date(Number(s) * 1000), fmt))],
    ['time_format', [2], (v, fmt) => dateFormat(v, fmt)],
  ];
  for (const [name, arities, impl] of varFns) {
    for (const n of arities) {
      try {
        db.create_function(name, V(impl, n));
      } catch { /* abaikan */ }
    }
  }
}
