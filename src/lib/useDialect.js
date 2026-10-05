import { useSyncExternalStore } from 'react';
import { getDialect, onDialectChange } from './dialect.js';

// Dialek editor yang aktif — subscribe supaya komponen re-render saat user ganti.
export function useDialect() {
  return useSyncExternalStore((cb) => onDialectChange(cb), getDialect);
}
