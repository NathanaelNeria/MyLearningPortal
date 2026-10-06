// Materi ringkas per kategori — cheat-sheet dengan contoh yang bisa dijalankan.
export const MATERI = [
  {
    kategori: 'dasar',
    judul: 'SQL Dasar',
    sections: [
      {
        judul: 'SELECT & FROM — mengambil data',
        isi: '`SELECT` menentukan kolom apa yang diambil, `FROM` menentukan dari tabel mana. `SELECT *` mengambil semua kolom.',
        contoh: 'SELECT nama, kota FROM pelanggan;',
      },
      {
        judul: 'WHERE — memfilter baris',
        isi: 'Hanya baris yang memenuhi kondisi yang ditampilkan. Teks pakai kutip tunggal, angka tanpa kutip.',
        contoh: "SELECT nama, harga FROM produk WHERE harga > 100000;",
      },
      {
        judul: 'ORDER BY — mengurutkan',
        isi: '`ASC` naik (default, A→Z / kecil→besar), `DESC` turun. Bisa urutkan beberapa kolom sekaligus.',
        contoh: 'SELECT nama, harga FROM produk ORDER BY harga DESC;',
      },
      {
        judul: 'LIMIT — membatasi jumlah baris',
        isi: 'Ambil N baris teratas. Kombinasi ORDER BY + LIMIT = pola "top-N".',
        contoh: 'SELECT nama, harga FROM produk ORDER BY harga DESC LIMIT 3;',
      },
      {
        judul: 'DISTINCT — nilai unik',
        isi: 'Menghilangkan duplikat pada hasil.',
        contoh: 'SELECT DISTINCT kota FROM pelanggan;',
      },
    ],
  },
  {
    kategori: 'filtering',
    judul: 'Filtering Lanjutan',
    sections: [
      {
        judul: 'LIKE — pencocokan pola teks',
        isi: '`%` = teks apa pun (0+ karakter), `_` = tepat 1 karakter. `LIKE \'%abc\'` berakhiran abc, `\'abc%\'` diawali abc, `\'%abc%\'` mengandung abc.',
        contoh: "SELECT nama, email FROM pelanggan WHERE email LIKE '%@gmail.com';",
      },
      {
        judul: 'IN — salah satu dari daftar',
        isi: 'Ringkas pengganti rangkaian `OR` untuk kolom yang sama.',
        contoh: "SELECT nama, kota FROM pelanggan WHERE kota IN ('Jakarta', 'Bandung');",
      },
      {
        judul: 'BETWEEN — rentang nilai',
        isi: '`BETWEEN a AND b` inklusif kedua ujung. Sama dengan `>= a AND <= b`.',
        contoh: 'SELECT nama, harga FROM produk WHERE harga BETWEEN 50000 AND 150000;',
      },
      {
        judul: 'NULL — nilai kosong',
        isi: '`NULL` berarti "tidak ada nilai". Tidak bisa dibandingkan dengan `=` — pakai `IS NULL` / `IS NOT NULL`.',
        contoh: 'SELECT nama FROM pelanggan WHERE no_telepon IS NULL;',
      },
      {
        judul: 'AND, OR, NOT — menggabungkan kondisi',
        isi: '`AND` semua harus benar, `OR` salah satu cukup. `AND` lebih kuat dari `OR` — pakai kurung kalau ragu.',
        contoh: "SELECT nama, harga FROM produk WHERE kategori_id = 2 AND harga < 200000;",
      },
    ],
  },
  {
    kategori: 'agregasi',
    judul: 'Agregasi',
    sections: [
      {
        judul: 'Fungsi agregat — COUNT, SUM, AVG, MIN, MAX',
        isi: 'Merangkum banyak baris jadi satu nilai. `COUNT(*)` hitung baris, `COUNT(kolom)` hitung yang tidak NULL.',
        contoh: 'SELECT COUNT(*) AS total, AVG(harga) AS rata2, MAX(harga) AS termahal FROM produk;',
      },
      {
        judul: 'GROUP BY — agregasi per kelompok',
        isi: 'Mengelompokkan baris yang nilainya sama, lalu agregat dihitung per kelompok. Kolom non-agregat di SELECT harus ada di GROUP BY.',
        contoh: 'SELECT kategori_id, COUNT(*) AS jumlah FROM produk GROUP BY kategori_id;',
      },
      {
        judul: 'HAVING — filter setelah grouping',
        isi: '`WHERE` memfilter baris sebelum digrup; `HAVING` memfilter hasil grup. Urutan: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
        contoh: 'SELECT kota, COUNT(*) AS jumlah FROM pelanggan GROUP BY kota HAVING COUNT(*) >= 2;',
      },
      {
        judul: 'ROUND — pembulatan',
        isi: '`ROUND(x)` ke bilangan bulat, `ROUND(x, n)` ke n desimal.',
        contoh: 'SELECT ROUND(AVG(harga), 0) AS rata2_harga FROM produk;',
      },
    ],
  },
  {
    kategori: 'join',
    judul: 'JOIN',
    sections: [
      {
        judul: 'INNER JOIN — irisan dua tabel',
        isi: 'Menggabungkan baris yang cocok lewat kolom relasi (biasanya foreign key). Baris tanpa pasangan dibuang.',
        contoh: 'SELECT p.nama, k.nama AS kategori FROM produk p JOIN kategori k ON k.id = p.kategori_id;',
      },
      {
        judul: 'LEFT JOIN — semua dari tabel kiri',
        isi: 'Semua baris kiri tetap ada; yang tidak berpasangan berisi NULL di kolom kanan. Pola `WHERE kanan.id IS NULL` = "yang tidak punya pasangan".',
        contoh: 'SELECT p.nama FROM produk p LEFT JOIN detail_pesanan d ON d.produk_id = p.id WHERE d.id IS NULL;',
      },
      {
        judul: 'Multi-JOIN — merantai tabel',
        isi: 'JOIN bisa dirangkai: `detail_pesanan` → `pesanan` → `pelanggan` → `produk` → `kategori`. Pakai alias pendek biar rapi.',
        contoh: "SELECT pl.nama, SUM(d.jumlah * d.harga_satuan) AS total FROM detail_pesanan d JOIN pesanan ps ON ps.id = d.pesanan_id JOIN pelanggan pl ON pl.id = ps.pelanggan_id WHERE ps.status = 'selesai' GROUP BY pl.id;",
      },
    ],
  },
  {
    kategori: 'subquery',
    judul: 'Subquery & CTE',
    sections: [
      {
        judul: 'Subquery di WHERE',
        isi: 'Query di dalam query — hasilnya dipakai sebagai nilai filter. `(SELECT AVG(harga) FROM produk)` menghasilkan satu angka.',
        contoh: 'SELECT nama, harga FROM produk WHERE harga > (SELECT AVG(harga) FROM produk);',
      },
      {
        judul: 'IN / NOT IN (SELECT ...)',
        isi: 'Cek keanggotaan terhadap hasil query lain. `NOT IN` = "yang tidak ada di daftar itu".',
        contoh: 'SELECT nama FROM pelanggan WHERE id NOT IN (SELECT pelanggan_id FROM pesanan);',
      },
      {
        judul: 'Correlated subquery',
        isi: 'Subquery yang mereferensikan baris query luar — dievaluasi per baris. Cocok untuk "maks/min per grup".',
        contoh: 'SELECT nama, harga FROM produk p WHERE harga = (SELECT MAX(harga) FROM produk p2 WHERE p2.kategori_id = p.kategori_id);',
      },
      {
        judul: 'WITH / CTE — query bernama',
        isi: '`WITH nama AS (SELECT ...) SELECT ...` membuat hasil sementara yang bisa dipakai seperti tabel. Lebih mudah dibaca daripada subquery bertingkat, dan bisa dirantai.',
        contoh: "WITH bulanan AS (SELECT strftime('%Y-%m', tanggal) AS bulan FROM pesanan) SELECT bulan, COUNT(*) FROM bulanan GROUP BY bulan;",
      },
    ],
  },
  {
    kategori: 'window',
    judul: 'Window Functions',
    sections: [
      {
        judul: 'Konsep OVER()',
        isi: 'Window function menghitung sesuatu **untuk tiap baris** atas "jendela" baris lain — tanpa menggabungkan baris seperti GROUP BY. `PARTITION BY` membagi jendela per grup.',
        contoh: 'SELECT nama, harga, AVG(harga) OVER () AS rata_semua FROM produk;',
      },
      {
        judul: 'ROW_NUMBER, RANK, DENSE_RANK',
        isi: '`ROW_NUMBER` = nomor unik 1,2,3... `RANK` = nilai sama berbagi peringkat lalu lompat (1,1,3). `DENSE_RANK` = berbagi tanpa lompat (1,1,2).',
        contoh: 'SELECT nama, harga, ROW_NUMBER() OVER (PARTITION BY kategori_id ORDER BY harga DESC) AS ranking FROM produk;',
      },
      {
        judul: 'Running total — SUM() OVER (ORDER BY)',
        isi: 'Dengan `ORDER BY` di dalam OVER, agregat dihitung kumulatif sampai baris saat ini.',
        contoh: "SELECT tanggal, SUM(jumlah) OVER (ORDER BY tanggal) AS kumulatif FROM pesanan p JOIN detail_pesanan d ON d.pesanan_id = p.id;",
      },
      {
        judul: 'LAG / LEAD — baris sebelum & sesudah',
        isi: '`LAG(kolom)` = nilai baris sebelumnya, `LEAD` = sesudahnya, dalam partisi terurut. Umum untuk selisih antar periode.',
        contoh: 'SELECT tanggal, total, total - LAG(total) OVER (ORDER BY tanggal) AS selisih FROM (SELECT ps.tanggal, SUM(d.jumlah * d.harga_satuan) AS total FROM pesanan ps JOIN detail_pesanan d ON d.pesanan_id = ps.id GROUP BY ps.tanggal);',
      },
      {
        judul: 'Top-N per grup (pola interview)',
        isi: 'Window tidak bisa difilter langsung di WHERE — bungkus dengan CTE, lalu filter nomornya.',
        contoh: 'WITH r AS (SELECT nama, ROW_NUMBER() OVER (PARTITION BY kategori_id ORDER BY harga DESC) AS rn FROM produk) SELECT * FROM r WHERE rn <= 3;',
      },
    ],
  },
  {
    kategori: 'advanced',
    judul: 'Pol-pola Advanced',
    sections: [
      {
        judul: 'CASE WHEN — logika if/else',
        isi: 'Menghasilkan nilai berbeda per kondisi, atau menghitung selektif di agregat.',
        contoh: "SELECT status, COUNT(*) AS n, SUM(CASE WHEN ongkir > 20000 THEN 1 ELSE 0 END) AS ongkir_mahal FROM pesanan GROUP BY status;",
      },
      {
        judul: 'Self JOIN — tabel join ke dirinya',
        isi: 'Berguna untuk pasangan dalam satu grup (mis. dua item dalam pesanan yang sama). Beri dua alias berbeda.',
        contoh: 'SELECT d1.produk_id, d2.produk_id FROM detail_pesanan d1 JOIN detail_pesanan d2 ON d1.pesanan_id = d2.pesanan_id AND d1.produk_id < d2.produk_id LIMIT 10;',
      },
      {
        judul: 'strftime — bekerja dengan tanggal',
        isi: "SQLite menyimpan tanggal sebagai TEXT. `strftime('%Y-%m', kolom)` ambil tahun-bulan, `date(kolom)` ambil tanggalnya, `julianday` untuk selisih hari.",
        contoh: "SELECT strftime('%Y-%m', tanggal) AS bulan, COUNT(*) AS pesanan FROM pesanan GROUP BY bulan;",
      },
      {
        judul: 'Strategi query kompleks',
        isi: 'Pecah masalah jadi CTE berlapis: (1) siapkan data per entitas, (2) hitung agregat/window, (3) filter & format. Baca dari dalam ke luar saat debugging.',
        contoh: "WITH item AS (SELECT pesanan_id, SUM(jumlah * harga_satuan) AS total FROM detail_pesanan GROUP BY pesanan_id) SELECT COUNT(*) AS pesanan, ROUND(AVG(total)) AS rata2 FROM item;",
      },
    ],
  },
  {
    kategori: 'string',
    judul: 'String & Teks',
    sections: [
      {
        judul: 'Menggabungkan teks',
        isi: "SQLite: operator `||` — `'Halo ' || nama`. MySQL: fungsi `CONCAT(a, b, ...)` yang bisa banyak argumen. Beda konsep penting: `||` adalah operator (2 sisi), `CONCAT` adalah fungsi (N argumen). NULL ikut `||` → NULL; `CONCAT` juga begitu — pakai `COALESCE` kalau perlu.",
        contoh: "SELECT nama || ' (' || kota || ')' AS label FROM pelanggan LIMIT 5;",
      },
      {
        judul: 'Memotong & mencari posisi',
        isi: "`SUBSTR(teks, awal, panjang)` memotong (indeks mulai 1!). `INSTR(teks, 'cari')` mengembalikan posisi pertama ditemukan (0 kalau tidak ada). MySQL: `SUBSTRING`/`LEFT`/`RIGHT`/`MID`, `LOCATE(cari, teks)`, dan `SUBSTRING_INDEX(teks, '@', -1)` untuk ambil teks setelah pemisah terakhir — sangat praktis untuk domain email.",
        contoh: "SELECT nama, SUBSTR(email, INSTR(email, '@') + 1) AS domain FROM pelanggan WHERE email IS NOT NULL LIMIT 5;",
      },
      {
        judul: 'Panjang, casing, trim, ganti',
        isi: "`LENGTH(t)` jumlah karakter. `UPPER`/`LOWER` ubah huruf. `TRIM` buang spasi di dua ujung (`LTRIM`/`RTRIM` satu sisi). `REPLACE(t, dari, ke)` ganti substring. MySQL menambah `LPAD`/`RPAD` untuk padding dan `REVERSE`/`REPEAT`.",
        contoh: "SELECT nama, UPPER(SUBSTR(nama, 1, 3)) AS kode, LENGTH(nama) AS panjang FROM produk ORDER BY panjang LIMIT 5;",
      },
    ],
  },
  {
    kategori: 'tanggal',
    judul: 'Tanggal & Waktu',
    sections: [
      {
        judul: 'Format & potong tanggal',
        isi: "SQLite simpan tanggal sebagai TEXT 'YYYY-MM-DD', jadi bisa dipotong/diformat dengan `strftime('%Y-%m', kolom)` (tahun-bulan), `strftime('%d-%m-%Y')` (DD-MM-YYYY). MySQL: `DATE_FORMAT(kolom, '%Y-%m')` — specifier % sama! Ini alasan soal-soal tanggal di sini punya dua versi solusi.",
        contoh: "SELECT strftime('%d-%m-%Y', tanggal) AS tanggal_indo, status FROM pesanan LIMIT 5;",
      },
      {
        judul: 'Ekstrak bagian tanggal',
        isi: "`strftime('%w', t)` = hari minggu ('0' Minggu, '6' Sabtu), `'%m'` = bulan, `'%j'` = hari ke-n dalam setahun. MySQL: `DAYOFWEEK(t)` (1=Minggu), `MONTH(t)`, `QUARTER(t)`, `WEEKDAY(t)` (0=Senin). Pilih yang mudah dibaca — `QUARTER(t) = 1` lebih jelas daripada `IN ('01','02','03')`.",
        contoh: "SELECT tanggal, strftime('%w', tanggal) AS kode_hari, strftime('%m', tanggal) AS bulan FROM pesanan ORDER BY tanggal LIMIT 5;",
      },
      {
        judul: 'Aritmetika & selisih tanggal',
        isi: "SQLite: `date(t, '-7 days')`/`'+1 month'` untuk geser tanggal; `CAST(julianday(a) - julianday(b) AS INTEGER)` untuk selisih hari (julianday = hari sejak epoch Julian). MySQL lebih mudah: `DATE_ADD(t, INTERVAL 7 DAY)`, `DATE_SUB`, `DATEDIFF(a, b)`, `TIMESTAMPDIFF(MONTH, a, b)`. Ini beda terbesar dua dialek — kuasai dua-duanya.",
        contoh: "SELECT tanggal, date(tanggal, '+7 days') AS plus_minggu, CAST(julianday('2024-09-30') - julianday(tanggal) AS INTEGER) AS selisih FROM pesanan LIMIT 5;",
      },
    ],
  },
  {
    kategori: 'kondisional',
    judul: 'CASE & Pivot',
    sections: [
      {
        judul: 'CASE WHEN — if/then di dalam SELECT',
        isi: "`CASE WHEN kondisi THEN nilai WHEN ... ELSE nilai END` dievaluasi berurutan — kondisi pertama yang cocok menang. Ingat: `NULL` tidak memenuhi perbandingan apa pun, jadi cek `IS NULL` lebih dulu kalau datanya bisa NULL. Bisa dipakai di SELECT, WHERE, ORDER BY, sampai GROUP BY. Sintaks identik di MySQL.",
        contoh: "SELECT nama, harga, CASE WHEN harga < 50000 THEN 'murah' WHEN harga < 200000 THEN 'menengah' ELSE 'mahal' END AS segmen FROM produk LIMIT 5;",
      },
      {
        judul: 'COALESCE & NULLIF',
        isi: "`COALESCE(a, b, c)` = nilai pertama yang bukan NULL — untuk kolom 'fallback' (email → telepon → 'tidak ada'). `NULLIF(a, b)` = NULL kalau `a = b`, a kalau tidak — berguna menghindari bagi-nol: `total / NULLIF(nol, 0)` → NULL, bukan error.",
        contoh: "SELECT nama, COALESCE(email, no_telepon, 'tidak ada') AS kontak FROM pelanggan LIMIT 8;",
      },
      {
        judul: 'Agregasi kondisional = pivot',
        isi: "`COUNT(CASE WHEN status='selesai' THEN 1 END)` menghitung hanya baris cocok; `SUM(CASE WHEN ... THEN nilai END)` menjumlahkan kondisional. Ulangi per kategori → kolom pivot. Inilah pengganti `PIVOT` operator (yang tidak ada di SQLite/MySQL biasa) — pola yang paling sering ditanya di interview SQL.",
        contoh: "SELECT kota, COUNT(*) AS total, COUNT(CASE WHEN status_member = 'platinum' THEN 1 END) AS platinum FROM pelanggan GROUP BY kota ORDER BY total DESC LIMIT 5;",
      },
    ],
  },
  {
    kategori: 'set',
    judul: 'Set & EXISTS',
    sections: [
      {
        judul: 'UNION vs UNION ALL',
        isi: '`UNION` menggabungkan hasil dua SELECT dan membuang duplikat; `UNION ALL` mempertahankan semuanya (lebih cepat — tanpa dedup). Syarat: jumlah kolom sama & tipe cocok. ORDER BY di akhir berlaku untuk hasil gabungan.',
        contoh: "SELECT pelanggan_id FROM pesanan UNION SELECT pelanggan_id FROM ulasan ORDER BY pelanggan_id LIMIT 10;",
      },
      {
        judul: 'INTERSECT & EXCEPT',
        isi: "`INTERSECT` = irisan (ada di dua-duanya), `EXCEPT` = selisih (di kiri tapi tidak di kanan). Keduanya dedup. MySQL 5.7 tidak punya keduanya — ekuivalennya `IN`/`NOT IN` subquery atau `EXISTS`/`NOT EXISTS` terskorelasi.",
        contoh: "SELECT kota FROM pelanggan EXCEPT SELECT kota FROM pelanggan WHERE status_member = 'platinum';",
      },
      {
        judul: 'EXISTS vs IN vs JOIN',
        isi: "`WHERE EXISTS (SELECT 1 FROM t WHERE t.fk = outer.id)` berhenti di baris pertama cocok — cepat untuk tabel besar. `IN (subquery)` juga oke tapi hati-hati: `NOT IN` gagal total kalau subquery menghasilkan satu saja NULL — `NOT EXISTS` aman. JOIN + DISTINCT juga bisa untuk 'yang punya', tapi menggandakan baris dulu.",
        contoh: "SELECT nama FROM pelanggan pl WHERE EXISTS (SELECT 1 FROM ulasan u WHERE u.pelanggan_id = pl.id) LIMIT 8;",
      },
    ],
  },
  {
    kategori: 'analitik',
    judul: 'Analitik Lanjutan',
    sections: [
      {
        judul: 'LEAD & FIRST_VALUE',
        isi: '`LEAD(kolom) OVER (PARTITION BY g ORDER BY k)` = nilai kolom di baris SETELAHNYA dalam partisi — untuk hitung jeda ke event berikutnya (kebalikan `LAG`). `FIRST_VALUE(kolom) OVER (PARTITION BY g ORDER BY ...)` = nilai di baris pertama partisi — patokan seperti "produk termurah di kategorinya".',
        contoh: "SELECT nama, tanggal, LEAD(tanggal) OVER (PARTITION BY pelanggan_id ORDER BY tanggal) AS berikutnya FROM pesanan LIMIT 8;",
      },
      {
        judul: 'Window frame: ROWS BETWEEN',
        isi: '`AVG(x) OVER (ORDER BY t ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` menghitung hanya jendela 3 baris terakhir → moving average. Frame lain: `UNBOUNDED PRECEDING` (dari awal → running total), `RANGE BETWEEN` (berdasar nilai, bukan posisi). Tanpa frame, default-nya `RANGE UNBOUNDED PRECEDING` — sering bikin hasil tak terduga untuk nilai seri, jadi tulis frame eksplisit.',
        contoh: "WITH b AS (SELECT strftime('%Y-%m', tanggal) AS bulan, COUNT(*) AS n FROM pesanan GROUP BY bulan) SELECT bulan, n, AVG(n) OVER (ORDER BY bulan ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS ma2 FROM b;",
      },
      {
        judul: 'NTILE — bagi rata jadi N kelompok',
        isi: '`NTILE(4) OVER (ORDER BY total DESC)` membagi hasil jadi 4 kelompok sama besar berurutan → kuartil. Beda dengan `RANK` yang memberi peringkat unik per baris; NTILE memberi nomor ke-lipatan. Dipakai untuk segmentasi (spender top 25%, dst).',
        contoh: "SELECT nama, harga, NTILE(4) OVER (ORDER BY harga DESC) AS kuartil_harga FROM produk LIMIT 10;",
      },
      {
        judul: 'WITH RECURSIVE — bikin data yang tidak ada',
        isi: "`WITH RECURSIVE t(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM t WHERE x < 10)` menghasilkan 1..10: bagian awal + langkah yang merujuk dirinya + kondisi berhenti. Dipakai untuk generate kalender/deret angka lalu LEFT JOIN data nyata — supaya hari kosong tetap muncul dengan 0. MySQL 8 juga mendukung sintaks yang sama.",
        contoh: "WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 10) SELECT x FROM n;",
      },
    ],
  },
  {
    kategori: 'mysql',
    judul: 'Mode MySQL',
    sections: [
      {
        judul: 'Cara kerja mode MySQL',
        isi: "Aktifkan toggle `MySQL` di toolbar editor (soal & playground). Yang kamu tulis diterjemahkan otomatis ke SQLite sebelum jalan: backtick `&#96;nama&#96;` → `\"nama\"`, `LIMIT 5,10` → `LIMIT 10 OFFSET 5`, `DESCRIBE t` → `PRAGMA table_info(t)`, `SHOW TABLES` → query `sqlite_master`, komentar `#` di awal baris → `--`.",
        contoh: 'SHOW TABLES;',
        mysql: true,
      },
      {
        judul: 'Fungsi MySQL yang tersedia',
        isi: '`IF()`, `IFNULL()`, `CONCAT()` variadic, `LEFT()/RIGHT()/MID()`, `LPAD()/RPAD()`, `LOCATE()`, `SUBSTRING_INDEX()`, `ELT()`, `FIELD()`, plus matematika `POW()`, `TRUNCATE()`, `GREATEST()/LEAST()`, `FORMAT()`, `CONV()`. Contoh lain: `DESCRIBE produk` dan backtick identifier.',
        contoh: "SELECT `nama`, IF(harga > 500000, 'premium', 'reguler') AS kelas, CONCAT('Rp ', FORMAT(harga, 0)) AS label FROM `produk` ORDER BY harga DESC LIMIT 5;",
        mysql: true,
      },
      {
        judul: 'Tanggal ala MySQL',
        isi: "`strftime('%Y-%m', t)` ↔ `DATE_FORMAT(t, '%Y-%m')`. Tersedia juga `NOW()/CURDATE()/CURTIME()`, `YEAR()/MONTH()/DAY()/HOUR()`, `DATEDIFF()`, `TIMESTAMPDIFF()`, `DATE_ADD()/DATE_SUB()` dengan `INTERVAL n UNIT`, `LAST_DAY()`, `DAYNAME()/MONTHNAME()`.",
        contoh: "SELECT tanggal, DATE_FORMAT(tanggal, '%Y-%m') AS bulan, DATE_ADD(tanggal, INTERVAL 7 DAY) AS plus_7_hari, LAST_DAY(tanggal) AS akhir_bulan FROM pesanan LIMIT 5;",
        mysql: true,
      },
      {
        judul: 'Batasan (jujur)',
        isi: 'Cakupannya subset MySQL yang umum di tes basic — bukan 100% MySQL, jadi syntax aneh tetap kena error (itu bagian latihan). `NOW()` pakai UTC, `REGEXP` pakai syntax JavaScript, `MD5()` hanya stub, komentar `#` dikenali hanya di awal baris. Kalau error `no such function`, fungsinya belum dipetakan — cari ekuivalen SQLite-nya.',
        contoh: 'DESCRIBE produk;',
        mysql: true,
      },
    ],
  },
];
