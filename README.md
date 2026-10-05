# BelajarSQL

Web latihan SQL interaktif (terinspirasi ngulikdata.com/nguliksql) + persiapan technical test: **SQL Query**, **Flowchart**, dan **Math Logic**.

Database SQLite sungguhan (sql.js / WASM) berjalan di browser — tidak perlu backend atau instal apa pun.

## Fitur

- **50 Tantangan SQL** (7 jalur: Dasar → Filtering → Agregasi → JOIN → Subquery & CTE → Window Functions → Advanced) dengan auto-grading, petunjuk bertingkat, dan solusi.
- **Playground** — editor SQL bebas dengan dataset TokoNusantara; bisa dipakai sebagai tool SQL online saat tes.
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
  data/challenges.js   50 soal (judul, tugas, hints, solusi)
  data/materi.js       cheat-sheet per kategori
  data/flowchart.js    simbol, quiz, dan flowchart (node/edge berkoordinat)
  data/logika.js       bank soal math logic
  lib/db.js            init sql.js + helper query (read-only)
  lib/grader.js        pembanding hasil query vs solusi
  lib/progress.js      XP/level/selesai di localStorage
  pages/               Dashboard, ChallengeList, ChallengeDetail,
                       Playground, Materi, Flowchart, Logika
```

Dialek SQL: **SQLite** (perbedaan kecil dengan MySQL: `strftime` untuk tanggal, `||` untuk gabung string, tanpa `IF()` — pakai `CASE WHEN`).
