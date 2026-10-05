import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { buildSchemaSQL } from '../data/schema.js';

let dbPromise = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = initSqlJs({ locateFile: () => wasmUrl }).then((SQL) => {
      const db = new SQL.Database();
      db.exec(buildSchemaSQL());
      return db;
    });
  }
  return dbPromise;
}

// Jalankan query SELECT. Return { columns: [...], rows: [[...], ...] } atau lempar Error.
export function runQuery(db, sql) {
  const results = db.exec(sql);
  if (!results.length) return { columns: [], rows: [] };
  const last = results[results.length - 1];
  return { columns: last.columns, rows: last.values };
}

// Hanya boleh pernyataan baca — playground & soal memang untuk SELECT.
export function isReadOnly(sql) {
  const cleaned = sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .trim()
    .toLowerCase();
  if (!cleaned) return false;
  const forbidden = /\b(insert|update|delete|drop|alter|create|replace|attach|detach|pragma|vacuum|reindex|truncate)\b/;
  return /^(select|with|explain)\b/.test(cleaned) && !forbidden.test(cleaned);
}
