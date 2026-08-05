import React, { useRef, useState } from 'react';
import useCountUp from '../../../hooks/useCountUp';
import { IconTrend } from '../../Shared/Icons/Icons';

/* KPI card: animated count-up number + a subtle 3D tilt that follows the
   cursor. Content sits on translateZ so it lifts off the card face. */
const StatCard = ({ icon, label, value, suffix = '', delta, deltaLabel, tone = '', duration = 1100 }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const shown = useCountUp(value, duration);

  const move = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -y * 11, ry: x * 13 });
  };

  const up = delta >= 0;

  return (
    <article
      ref={ref}
      className={`kpi ${tone} dp-reveal`}
      onMouseMove={move}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
    >
      <div className="kpi-in">
        <div className="kpi-ic">{icon}</div>
        <div className="lbl">{label}</div>
        <div className="num">{shown.toLocaleString()}{suffix}</div>
        {typeof delta === 'number' && (
          <div className={`delta ${up ? 'up' : 'down'}`}>
            <IconTrend size={15} />
            {up ? '+' : ''}{delta}% <span>{deltaLabel || 'vs last week'}</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default StatCard;
