import React from 'react';
import { IconInbox } from '../../Shared/Icons/Icons';

const tones = ['', 'violet', 'teal', 'amber', 'rose'];

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const AppointmentsTable = ({
  rows = [],
  compact = false,
  emptyTitle = 'Nothing booked yet',
  emptyText = 'Appointments booked on the public site land here instantly.',
}) => {
  if (!rows.length) {
    return (
      <div className="dash-empty">
        <div className="ic"><IconInbox size={26} /></div>
        <b>{emptyTitle}</b>
        <span style={{ fontSize: '.88rem' }}>{emptyText}</span>
      </div>
    );
  }

  return (
    <div className="dtable-wrap">
      <table className={`dtable${compact ? ' compact' : ''}`}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Service</th>
            <th>Time</th>
            {!compact && <th>Doctor</th>}
            {!compact && <th>Date</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row._id || i}>
              <td>
                <div className="who">
                  <span className={`davatar ${tones[i % tones.length]}`}>{initials(row.patientName)}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{row.patientName || 'Unnamed patient'}</div>
                    <div className="em">{row.email}</div>
                  </div>
                </div>
              </td>
              <td>{row.serviceName}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{row.time}</td>
              {!compact && <td>{row.doctor || '—'}</td>}
              {!compact && <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>}
              <td>
                <span className={`pill ${(row.status || 'confirmed').toLowerCase()}`}>
                  {row.seeded ? row.status : row.status === 'Pending' ? 'New' : row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;
