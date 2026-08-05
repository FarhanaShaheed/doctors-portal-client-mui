import React, { useState, useEffect } from 'react';
import useAuth from './../../../hooks/useAuth';
import { createAppointment, dateKey, prettyDate } from '../../../api/demoApi';
import { IconCheck } from '../../Shared/Icons/Icons';

const BookingModal = ({ booking, date, onClose, onBooked }) => {
  const { user } = useAuth();
  const [info, setInfo] = useState({
    patientName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!booking) return null;

  const change = (e) => setInfo({ ...info, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const appointment = {
      ...info,
      time: booking.time,
      serviceName: booking.name,
      doctor: booking.doctor,
      date: date.toLocaleDateString(),
      dateKey: dateKey(date),
    };
    const result = await createAppointment(appointment);
    setSaving(false);
    onBooked(result.appointment);
  };

  return (
    <div className="dp-modal-back" role="dialog" aria-modal="true" aria-label={`Book ${booking.name}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dp-modal">
        <div className="dp-modal-head">
          <div>
            <h3>{booking.name}</h3>
            <div className="sub">{booking.time} · {prettyDate(date)}</div>
          </div>
          <button type="button" className="dp-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <form className="dp-modal-body" onSubmit={submit}>
          <div className="dp-field">
            <label htmlFor="b-name">Patient name</label>
            <input id="b-name" className="dp-input" name="patientName" required value={info.patientName} onChange={change} placeholder="Full name" />
          </div>

          <div className="dp-two">
            <div className="dp-field">
              <label htmlFor="b-email">Email</label>
              <input id="b-email" className="dp-input" name="email" type="email" required value={info.email} onChange={change} placeholder="you@example.com" />
            </div>
            <div className="dp-field">
              <label htmlFor="b-phone">Phone</label>
              <input id="b-phone" className="dp-input" name="phone" required value={info.phone} onChange={change} placeholder="+880 1XXX XXXXXX" />
            </div>
          </div>

          <div className="dp-two">
            <div className="dp-field">
              <label htmlFor="b-slot">Slot</label>
              <input id="b-slot" className="dp-input" value={booking.time} disabled readOnly />
            </div>
            <div className="dp-field">
              <label htmlFor="b-date">Date</label>
              <input id="b-date" className="dp-input" value={prettyDate(date)} disabled readOnly />
            </div>
          </div>

          <button type="submit" className="dp-btn dp-btn-primary dp-btn-block" disabled={saving} style={{ marginTop: 8 }}>
            {saving ? 'Confirming…' : <>Confirm appointment <IconCheck size={17} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
