import React, { useEffect, useState } from 'react';

/* Pure SVG + CSS chart — no charting library, no dependencies.
   The stroke draws itself in via stroke-dashoffset, the fill fades behind it. */
const W = 720;
const H = 240;
const PAD = { l: 34, r: 18, t: 24, b: 36 };

const smooth = (pts) => {
  if (!pts.length) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i];
    const b = pts[i + 1];
    const cx = (a.x + b.x) / 2;
    d += ` C${cx},${a.y} ${cx},${b.y} ${b.x},${b.y}`;
  }
  return d;
};

const AreaChart = ({ data = [] }) => {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 4);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const pts = data.map((d, i) => ({
    x: PAD.l + i * step,
    y: PAD.t + (1 - d.value / max) * innerH,
    ...d,
  }));

  const line = smooth(pts);
  const base = PAD.t + innerH;
  const area = `${line} L${pts[pts.length - 1].x},${base} L${pts[0].x},${base} Z`;

  // Approximate the polyline length so the draw-in animation is proportional.
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  len = Math.ceil(len * 1.2);

  const gridRows = 4;

  return (
    <div className="chart-wrap">
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Appointments per day">
        <defs>
          <linearGradient id="dpStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridRows + 1 }).map((_, i) => {
          const y = PAD.t + (innerH / gridRows) * i;
          const v = Math.round(max - (max / gridRows) * i);
          return (
            <g key={i}>
              <line className="grid-line" x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} />
              <text className="lbl" x={PAD.l - 10} y={y + 4} textAnchor="end">{v}</text>
            </g>
          );
        })}

        <path className="area" d={area} style={{ opacity: drawn ? 1 : 0 }} />
        <path
          className="line"
          d={line}
          style={{ strokeDasharray: len, strokeDashoffset: drawn ? 0 : len }}
        />

        {pts.map((p, i) => (
          <g key={p.key || i}>
            <circle
              className="dot"
              cx={p.x}
              cy={p.y}
              r="5"
              style={{ opacity: drawn ? 1 : 0, transitionDelay: `${0.7 + i * 0.07}s` }}
            >
              <title>{`${p.label}: ${p.value} appointments`}</title>
            </circle>
            <text
              className="val"
              x={p.x}
              y={p.y - 14}
              textAnchor="middle"
              style={{ opacity: drawn ? 1 : 0, transitionDelay: `${0.8 + i * 0.07}s` }}
            >
              {p.value}
            </text>
            <text className="lbl" x={p.x} y={H - 12} textAnchor="middle">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default AreaChart;
