// Membandingkan hasil query user dengan hasil query solusi.
// Kolom dibandingkan per nama (case-insensitive). Baris dibandingkan
// sebagai multiset, kecuali orderMatters → urutan harus sama.

function normCol(name) {
  return String(name).trim().toLowerCase();
}

function normVal(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') {
    // bulatkan float agar 4.0 == 4 dan kecilkan noise floating point
    return Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : Number(v.toFixed(4));
  }
  return String(v);
}

function normRows(rows) {
  return rows.map((r) => r.map(normVal));
}

function rowKey(row) {
  return JSON.stringify(row);
}

export function compareResults(expected, actual, orderMatters) {
  const expCols = expected.columns.map(normCol);
  const actCols = actual.columns.map(normCol);

  if (actCols.length !== expCols.length) {
    return {
      ok: false,
      reason: 'column-count',
      message: `Jumlah kolom beda — diharapkan ${expCols.length} kolom (${expCols.join(', ')}), hasilmu ${actCols.length} kolom.`,
    };
  }
  for (let i = 0; i < expCols.length; i++) {
    if (expCols[i] !== actCols[i]) {
      return {
        ok: false,
        reason: 'column-name',
        message: `Nama kolom ke-${i + 1} beda — diharapkan "${expCols[i]}", hasilmu "${actCols[i]}". Cek alias (AS) dan urutan kolom.`,
      };
    }
  }

  const exp = normRows(expected.rows);
  const act = normRows(actual.rows);

  if (act.length !== exp.length) {
    return {
      ok: false,
      reason: 'row-count',
      message: `Jumlah baris beda — diharapkan ${exp.length} baris, hasilmu ${act.length} baris.`,
    };
  }

  if (orderMatters) {
    for (let i = 0; i < exp.length; i++) {
      if (rowKey(exp[i]) !== rowKey(act[i])) {
        return {
          ok: false,
          reason: 'row-value',
          message: `Baris ke-${i + 1} beda. Diharapkan: ${JSON.stringify(exp[i])} — hasilmu: ${JSON.stringify(act[i])}. (Soal ini menilai urutan baris.)`,
        };
      }
    }
  } else {
    const count = new Map();
    for (const r of exp) {
      const k = rowKey(r);
      count.set(k, (count.get(k) || 0) + 1);
    }
    for (const r of act) {
      const k = rowKey(r);
      const n = count.get(k) || 0;
      if (n === 0) {
        return {
          ok: false,
          reason: 'row-value',
          message: `Ada baris yang tidak seharusnya muncul: ${JSON.stringify(r)}.`,
        };
      }
      count.set(k, n - 1);
    }
  }

  return { ok: true };
}
