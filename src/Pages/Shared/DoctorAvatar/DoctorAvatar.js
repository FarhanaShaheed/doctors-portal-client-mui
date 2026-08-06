import React from 'react';

/* Gradient monogram avatar. Deterministic per doctor (the `tone` field in the
   seed data), so the clinic looks consistent without shipping photos. */
const initialsOf = (name = '') =>
  name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'DR';

const DoctorAvatar = ({ doctor = {}, size = 52, dot = false, className = '' }) => (
  <span
    className={`sch-av t-${doctor.tone || 'indigo'}${dot ? ' has-dot' : ''} ${className}`}
    style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    aria-hidden="true"
  >
    {doctor.initials || initialsOf(doctor.name)}
    {dot && <i className={`sch-av-dot${doctor.status === 'On leave' ? ' off' : ''}`} />}
  </span>
);

export default DoctorAvatar;
