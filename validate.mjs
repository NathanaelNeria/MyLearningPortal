// Validasi: jalankan semua solusi tantangan di sql.js + cek konsistensi data.
import initSqlJs from 'sql.js';
import { buildSchemaSQL } from './src/data/schema.js';
import { CHALLENGES } from './src/data/challenges.js';
import { registerMySQLFunctions, translateMySQL } from './src/lib/dialect.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');

const SQL = await initSqlJs({ locateFile: () => wasmPath });
const db = new SQL.Database();
db.exec(buildSchemaSQL());
registerMySQLFunctions(db);

let fail = 0;
for (const c of CHALLENGES) {
  try {
    const res = db.exec(c.solusi);
    const rows = res.length ? res[0].values.length : 0;
    const cols = res.length ? res[0].columns.join(',') : '';
    console.log(`${rows === 0 ? '!!KOSONG' : 'ok'} | ${c.id} | ${rows} baris | ${cols}`);
    if (rows === 0) fail++;
  } catch (e) {
    console.log(`!!ERROR ${c.id}: ${e.message}`);
    fail++;
  }
}

// Solusi versi MySQL (kalau soal menyediakan) — harus lolos terjemahan + eksekusi.
for (const c of CHALLENGES) {
  if (!c.solusiMysql) continue;
  try {
    const res = db.exec(translateMySQL(c.solusiMysql));
    const rows = res.length ? res[res.length - 1].values.length : 0;
    console.log(`${rows === 0 ? '!!KOSONG' : 'ok'} | ${c.id} (mysql) | ${rows} baris`);
    if (rows === 0) fail++;
  } catch (e) {
    console.log(`!!ERROR ${c.id} (mysql): ${e.message}`);
    fail++;
  }
}

// Konsistensi pembayaran = total detail + ongkir (untuk pesanan yang punya pembayaran)
const mism = db.exec(`
  SELECT pb.pesanan_id, pb.jumlah,
         COALESCE((SELECT SUM(d.jumlah * d.harga_satuan) FROM detail_pesanan d WHERE d.pesanan_id = pb.pesanan_id),0) + ps.ongkir AS seharusnya
  FROM pembayaran pb JOIN pesanan ps ON ps.id = pb.pesanan_id
  WHERE pb.jumlah <> COALESCE((SELECT SUM(d.jumlah * d.harga_satuan) FROM detail_pesanan d WHERE d.pesanan_id = pb.pesanan_id),0) + ps.ongkir
`);
if (mism.length && mism[0].values.length) {
  console.log('\n!! Pembayaran tidak konsisten:', mism[0].values);
  fail += mism[0].values.length;
} else {
  console.log('\nok | semua pembayaran konsisten dengan detail + ongkir');
}

console.log(`\n${fail === 0 ? 'SEMUA VALID' : fail + ' masalah ditemukan'}`);
process.exit(fail ? 1 : 0);
