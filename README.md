# BelajarSQL

Web latihan SQL interaktif (terinspirasi ngulikdata.com/nguliksql) + persiapan technical test: **SQL Query**, **Flowchart**, dan **Math Logic**.

Database SQLite sungguhan (sql.js / WASM) berjalan di browser — tidak perlu backend atau instal apa pun.

## Fitur

- **77 Tantangan SQL** (12 jalur: Dasar → Filtering → String & Teks → Tanggal & Waktu → Agregasi → JOIN → CASE & Pivot → Subquery & CTE → Set & EXISTS → Window Functions → Analitik Lanjutan → Advanced) dengan auto-grading, petunjuk bertingkat, dan solusi.
- **Playground** — editor SQL bebas dengan dataset TokoNusantara; bisa dipakai sebagai tool SQL online saat tes.
- **Mode MySQL** — toggle SQLite/MySQL di toolbar editor; yang kamu tulis pakai syntax MySQL diterjemahkan otomatis ke SQLite (backtick, `LIMIT n,m`, `DESCRIBE`, `SHOW TABLES`, `INTERVAL`, `<=>`, `DIV`, dll) plus ~70 fungsi MySQL (`IF`, `CONCAT`, `NOW`, `DATEDIFF`, `DATE_FORMAT`, `DATE_ADD`...) sebagai UDF. Di Playground kamu bisa lihat SQL hasil terjemahannya.
- **Materi** — cheat-sheet per konsep dengan contoh query yang bisa langsung dijalankan.
- **Flowchart** — kamus simbol, quiz simbol, latihan membaca flowchart, dan latihan menggambar dengan contoh solusi.
- **Math Logic** — 18 soal deret/aritmetika/logika dengan pembahasan + mode simulasi 10 soal/15 menit.
- Progres, XP, dan draft jawaban tersimpan di `localStorage`.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
```

Build statis (bisa di-hosting di mana saja):

```bash
npm run build      # hasil di dist/
npm run preview    # cek hasil build
```

## Validasi bank soal

Menjalankan semua solusi tantangan di sql.js dan mengecek konsistensi data:

```bash
node validate.mjs
```

## Struktur

```
src/
  data/schema.js       skema + seed dataset TokoNusantara
  data/challenges.js   77 soal (judul, tugas, hints, solusi)
  data/materi.js       cheat-sheet per kategori
  data/flowchart.js    simbol, quiz, dan flowchart (node/edge berkoordinat)
  data/logika.js       bank soal math logic
  lib/db.js            init sql.js + helper query (read-only)
  lib/dialect.js       mode MySQL: terjemahan syntax + UDF MySQL
  lib/grader.js        pembanding hasil query vs solusi
  lib/progress.js      XP/level/selesai di localStorage
  pages/               Dashboard, ChallengeList, ChallengeDetail,
                       Playground, Materi, Flowchart, Logika
```

Dialek SQL: **SQLite** secara default. Aktifkan **Mode MySQL** di toolbar editor untuk menulis syntax MySQL — diterjemahkan otomatis + fungsi MySQL tersedia sebagai UDF (subset umum yang relevan untuk tes, bukan 100% MySQL). Detail pemetaan & batasannya ada di tab Materi → **Mode MySQL**.
