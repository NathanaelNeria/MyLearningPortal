export function formatVal(v) {
  if (v === null || v === undefined) return 'NULL';
  return String(v);
}

export function formatRupiah(n) {
  return 'Rp' + Number(n).toLocaleString('id-ID');
}
