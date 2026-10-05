// Renderer flowchart sederhana dari data node/edge berkoordinat.
// Node digambar sebagai shape SVG sesuai 'bentuk', edge sebagai polyline + panah.

function shapePoints(node) {
  const { x, y, w, h } = node;
  return { x, y, w, h };
}

function anchor(node, side) {
  const { x, y, w, h } = shapePoints(node);
  if (side === 'top') return [x, y - h / 2];
  if (side === 'bottom') return [x, y + h / 2];
  if (side === 'left') return [x - w / 2, y];
  if (side === 'right') return [x + w / 2, y];
  return [x, y];
}

function pickSides(from, to) {
  // pilih sisi keluar/masuk terbaik berdasarkan posisi relatif
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? ['right', 'left'] : ['left', 'right'];
  return dy > 0 ? ['bottom', 'top'] : ['top', 'bottom'];
}

function Edge({ a, b, via, label, nodes }) {
  const na = nodes.find((n) => n.id === a);
  const nb = nodes.find((n) => n.id === b);
  if (!na || !nb) return null;
  let [sA, sB] = pickSides(na, nb);
  let p1 = anchor(na, sA);
  let p2 = anchor(nb, sB);
  let pts = [p1, ...(via || []), p2];
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  // panah di ujung: arah segmen terakhir
  const [x2, y2] = pts[pts.length - 1];
  const [x1, y1] = pts[pts.length - 2];
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const sz = 7;
  const arrow = [
    [x2, y2],
    [x2 - sz * Math.cos(ang - 0.45), y2 - sz * Math.sin(ang - 0.45)],
    [x2 - sz * Math.cos(ang + 0.45), y2 - sz * Math.sin(ang + 0.45)],
  ]
    .map((p) => p.map((v) => v.toFixed(1)).join(','))
    .join(' ');

  // label di titik pertama + sepertiga segmen awal
  let lx = null, ly = null;
  if (label) {
    lx = (p1[0] * 2 + (via?.[0]?.[0] ?? p2[0])) / 3 + 8;
    ly = (p1[1] * 2 + (via?.[0]?.[1] ?? p2[1])) / 3 - 4;
  }
  return (
    <g>
      <path d={d} fill="none" stroke="#64748b" strokeWidth="1.6" />
      <polygon points={arrow} fill="#64748b" />
      {label && (
        <text x={lx} y={ly} fontSize="11" fontWeight="600" fill="#0f766e">
          {label}
        </text>
      )}
    </g>
  );
}

function NodeShape({ node }) {
  const { x, y, w, h, bentuk, teks } = node;
  const stroke = '#1e293b';
  const fillMap = {
    terminator: '#fed7aa',
    proses: '#dbeafe',
    keputusan: '#fef08a',
    io: '#d1fae5',
    dokumen: '#e9d5ff',
    konektor: '#f1f5f9',
    predefined: '#dbeafe',
  };
  const fill = fillMap[bentuk] || '#e2e8f0';
  const common = { fill, stroke, strokeWidth: 1.6 };

  let shape = null;
  if (bentuk === 'terminator') {
    shape = <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} {...common} />;
  } else if (bentuk === 'keputusan') {
    shape = (
      <polygon
        points={`${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}`}
        {...common}
      />
    );
  } else if (bentuk === 'io') {
    const skew = 12;
    shape = (
      <polygon
        points={`${x - w / 2 + skew},${y - h / 2} ${x + w / 2},${y - h / 2} ${x + w / 2 - skew},${y + h / 2} ${x - w / 2},${y + h / 2}`}
        {...common}
      />
    );
  } else if (bentuk === 'dokumen') {
    const wave = 6;
    shape = (
      <path
        d={`M ${x - w / 2} ${y - h / 2} L ${x + w / 2} ${y - h / 2} L ${x + w / 2} ${y + h / 2 - wave}
            Q ${x + w / 4} ${y + h / 2 + wave} ${x} ${y + h / 2 - wave}
            Q ${x - w / 4} ${y + h / 2 - wave * 2} ${x - w / 2} ${y + h / 2 - wave} Z`}
        {...common}
      />
    );
  } else if (bentuk === 'konektor') {
    shape = <circle cx={x} cy={y} r={w / 2} {...common} />;
  } else if (bentuk === 'predefined') {
    shape = (
      <g>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} {...common} />
        <line x1={x - w / 2 + 6} y1={y - h / 2} x2={x - w / 2 + 6} y2={y + h / 2} stroke={stroke} strokeWidth="1.4" />
        <line x1={x + w / 2 - 6} y1={y - h / 2} x2={x + w / 2 - 6} y2={y + h / 2} stroke={stroke} strokeWidth="1.4" />
      </g>
    );
  } else {
    shape = <rect x={x - w / 2} y={y - h / 2} width={w} height={h} {...common} />;
  }

  const lines = String(teks).split('\n');
  return (
    <g>
      {shape}
      <text x={x} y={y} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1e293b">
        {lines.map((ln, i) => (
          <tspan key={i} x={x} dy={i === 0 ? -(lines.length - 1) * 7 + 4 : 14}>
            {ln}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export default function FlowchartView({ nodes, edges, lebar = 460, tinggi = 460 }) {
  return (
    <svg
      viewBox={`0 0 ${lebar} ${tinggi}`}
      className="w-full h-auto bg-slate-50 rounded-xl border border-slate-200"
      role="img"
    >
      {(edges || []).map((e, i) => (
        <Edge key={i} a={e.from} b={e.to} via={e.via} label={e.label} nodes={nodes} />
      ))}
      {nodes.map((n) => (
        <NodeShape key={n.id} node={n} />
      ))}
    </svg>
  );
}

// Bentuk simbol tunggal untuk materi/kartu simbol.
export function SimbolShape({ bentuk, size = 72 }) {
  const w = bentuk === 'keputusan' ? size : size * 1.7;
  const h = bentuk === 'keputusan' ? size * 0.72 : size * 0.55;
  const node = { x: 0, y: 0, w, h, bentuk, teks: '' };
  const vb = bentuk === 'arus' ? `-10 -14 ${size + 20} 28` : `${-w / 2 - 10} ${-h / 2 - 10} ${w + 20} ${h + 20}`;
  return (
    <svg viewBox={vb} style={{ width: w + 20, height: Math.max(h + 20, 34) }} className="mx-auto">
      {bentuk === 'arus' ? (
        <g>
          <line x1="0" y1="0" x2={size} y2="0" stroke="#1e293b" strokeWidth="2" />
          <polygon points={`${size},0 ${size - 8},-5 ${size - 8},5`} fill="#1e293b" />
        </g>
      ) : (
        <NodeShape node={node} />
      )}
    </svg>
  );
}
