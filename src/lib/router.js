import { useEffect, useState } from 'react';

// Router mini berbasis hash — app ini static-friendly (bisa dibuka dari file/hosting apapun).
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#/, '') || '/';
}

export function nav(to) {
  window.location.hash = to;
}
