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
