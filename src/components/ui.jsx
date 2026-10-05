export function TingkatBadge({ tingkat }) {
  const map = {
    mudah: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sedang: 'bg-amber-100 text-amber-700 border-amber-200',
    sulit: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  const label = { mudah: 'Mudah', sedang: 'Sedang', sulit: 'Sulit' }[tingkat] || tingkat;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${map[tingkat]}`}>
      {label}
    </span>
  );
}

export function KategoriBadge({ nama }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
      {nama}
    </span>
  );
}

export function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4l3.3 3.3 7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
    </svg>
  );
}

export function ProgressBar({ value, className = '' }) {
  return (
    <div className={`h-2 rounded-full bg-slate-200 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.round(value * 100))}%` }}
      />
    </div>
  );
}
