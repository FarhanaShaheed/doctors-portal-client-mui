import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors } from '../../../api/demoApi';
import { IconArrow, IconStethoscope } from '../../Shared/Icons/Icons';

/* Interactive 3D band: the card tilts toward the cursor (perspective +
   preserve-3d) while the badges float above it on the Z axis. */
const CareStage3D = () => {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: -7, ry: 11 });
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    let alive = true;
    getDoctors().then((all) => {
      if (alive && all && all.length) setDoctor(all[0]);
    });
    return () => { alive = false; };
  }, []);

  const onMove = (e) => {
    if (!stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -y * 14, ry: x * 20 });
  };

  const load = [
    { label: 'Orthodontics', pct: 82 },
    { label: 'Oral surgery', pct: 64 },
    { label: 'Cleaning', pct: 91 },
    { label: 'Pediatric', pct: 47 },
  ];

  return (
    <section
      className="dp-3d"
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: -7, ry: 11 })}
    >
      <div className="dp-wrap dp-3d-grid">
        <div>
          <span className="dp-eyebrow">Live clinic view</span>
          <h2 className="dp-h2">
            The clinic runs on<br />one live dashboard
          </h2>
          <p className="dp-3d-lead">
            Move your cursor over the panel. Every booking a patient makes lands
            in the admin dashboard instantly — chair load, specialist rota and
            today&apos;s queue, all in one place.
          </p>
          <Link to="/dashboard" className="dp-btn dp-btn-primary">
            Open the dashboard <IconArrow size={18} />
          </Link>
        </div>

        <div className="dp-3d-stage" ref={stageRef} style={{ perspective: '1100px' }}>
          <div
            className="dp-3d-card"
            style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
          >
            <div className="dp-3d-row">
              <span className="dp-avatar" style={{ width: 44, height: 44 }}>
                {doctor ? doctor.initials : <IconStethoscope size={19} />}
              </span>
              <div>
                <h4>{doctor ? doctor.name : 'Dr. Ayesha Rahman'}</h4>
                <div className="muted">{doctor ? doctor.speciality : 'Orthodontics'} · on duty now</div>
              </div>
            </div>

            <div className="dp-3d-bars">
              {load.map((row, i) => (
                <div className="dp-3d-bar" key={row.label}>
                  <span>{row.label}</span>
                  <span className="track">
                    <span
                      className="fill"
                      style={{ width: `${row.pct}%`, animationDelay: `${0.15 * i}s` }}
                    />
                  </span>
                  <span style={{ textAlign: 'right' }}>{row.pct}%</span>
                </div>
              ))}
            </div>

            <div className="dp-3d-badge b1" style={{ transform: 'translateZ(70px)' }}>🦷 6 chairs live</div>
            <div className="dp-3d-badge b2" style={{ transform: 'translateZ(92px)' }}>⚡ Instant booking</div>
            <div className="dp-3d-badge b3" style={{ transform: 'translateZ(56px)' }}>Today · 27 appointments</div>
          </div>
          <div className="dp-3d-glow" />
        </div>
      </div>
    </section>
  );
};

export default CareStage3D;
