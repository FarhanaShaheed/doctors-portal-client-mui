import React from 'react';

const ServiceBars = ({ rows = [] }) => {
  if (!rows.length) return <p style={{ color: 'var(--d-mute)', fontSize: '.86rem' }}>No bookings yet.</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="bars">
      {rows.map((row, i) => (
        <div key={row.name}>
          <div className="bar-row">
            <span className="nm">{row.name}</span>
            <span className="vl">{row.value}</span>
          </div>
          <div className="bar-track">
            <span
              className="bar-fill"
              style={{ width: `${Math.round((row.value / max) * 100)}%`, animationDelay: `${i * 0.09}s` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServiceBars;
