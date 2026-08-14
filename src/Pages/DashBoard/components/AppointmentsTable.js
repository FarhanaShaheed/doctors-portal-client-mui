import React from 'react';
import { IconInbox } from '../../Shared/Icons/Icons';
import { durationLabel, money } from '../../../api/schedule';
import { Link } from 'react-router-dom';

const tones = ['', 'violet', 'teal', 'amber', 'rose'];

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const docInitials = (name = '') =>
  name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'DR';

/* The scheduler writes real start times, durations and prices, so the console
   shows the same shape of data a receptionist would read off a day sheet. */
const AppointmentsTable = ({
  rows = [],
  compact = false,
  showPay = false,        // patient view: offer to settle the fee
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
            <th>Doctor</th>
            {!compact && <th>Date</th>}
            {!compact && <th>Fee</th>}
            <th>Status</th>
            {showPay && <th>Payment</th>}
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
              <td style={{ whiteSpace: 'nowrap' }}>
                <span className="dtime">{row.time}</span>
                <span className="dsub">{durationLabel(row.duration || 30)}</span>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <span className="dwho-doc">
                  <span className="davatar sm">{docInitials(row.doctor)}</span>
                  {row.doctor || '—'}
                </span>
              </td>
              {!compact && <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>}
              {!compact && <td style={{ whiteSpace: 'nowrap' }}>{row.price ? money(row.price) : '—'}</td>}
              <td>
                <span className={`pill ${(row.status || 'confirmed').toLowerCase()}`}>
                  {row.seeded ? row.status : row.status === 'Pending' ? 'New' : row.status}
                </span>
              </td>
              {showPay && (
                <td style={{ whiteSpace: 'nowrap' }}>
                  {row.paid
                    ? <span className="pill paid">Paid</span>
                    : <Link to={`/dashboard/payment/${row._id}`} className="dp-btn dp-btn-primary dp-btn-sm">Pay</Link>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;
