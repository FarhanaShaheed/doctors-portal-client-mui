import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DoctorAvatar from '../../Shared/DoctorAvatar/DoctorAvatar';
import { IconCheck, IconArrow, IconClock, IconCalendar, IconPin } from '../../Shared/Icons/Icons';
import { durationLabel, money, timeRange, to12h } from '../../../api/schedule';
import { prettyDate, createAppointment, dateKey } from '../../../api/demoApi';

/* Confirmation dialog: review → confirm → success, all in place.
   Logged-out visitors get the "log in and come back" state instead of the
   form, so nothing is lost when they return. */
const BookingModal = ({ doctor, date, service, slot, user, onClose, onBooked }) => {
  const [step, setStep] = useState(user?.email ? 'review' : 'login');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState({
    patientName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    note: '',
  });

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const appointment = {
      ...form,
      doctor: doctor.name,
      doctorId: doctor.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
      startTime: slot.time,
      time: timeRange(slot.time, service.duration),
      date: date.toLocaleDateString(),
      dateKey: dateKey(date),
    };
    const result = await createAppointment(appointment);
    setSaving(false);
    setSaved(result.appointment);
    setStep('done');
    onBooked(result.appointment);
  };

  const facts = (
    <ul className="sch-facts">
      <li><span className="ic"><IconCalendar size={15} /></span>{prettyDate(date)}</li>
      <li><span className="ic"><IconClock size={15} /></span>{timeRange(slot.time, service.duration)} <i>({to12h(slot.time)})</i></li>
      <li><span className="ic"><IconCheck size={15} /></span>{service.name} · {durationLabel(service.duration)}</li>
      <li><span className="ic"><IconPin size={15} /></span>{doctor.room || 'Dhanmondi clinic'}</li>
    </ul>
  );

  return (
    <div
      className="dp-modal-back"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm your appointment"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="dp-modal sch-modal">
        <div className="sch-modal-head">
          <div className="sch-modal-doc">
            <DoctorAvatar doctor={doctor} size={44} />
            <div>
              <h3>{step === 'done' ? 'Appointment confirmed' : 'Confirm your appointment'}</h3>
              <div className="sub">{doctor.name} · {doctor.speciality}</div>
            </div>
          </div>
          <button type="button" className="dp-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        {step === 'login' && (
          <div className="dp-modal-body">
            <div className="sch-modal-panel">{facts}</div>
            <p className="sch-modal-lead">
              Almost there. Log in so the clinic knows who is coming — we will bring
              you straight back to this booking.
            </p>
            <Link
              to={{ pathname: '/login', state: { from: { pathname: '/appointment' } } }}
              className="dp-btn dp-btn-primary dp-btn-block"
            >
              Log in to confirm <IconArrow size={16} />
            </Link>
            <p className="sch-modal-foot">
              New here?{' '}
              <Link to={{ pathname: '/register', state: { from: { pathname: '/appointment' } } }}>
                Create an account
              </Link>{' '}
              — it takes a few seconds.
            </p>
          </div>
        )}

        {step === 'review' && (
          <form className="dp-modal-body" onSubmit={submit}>
            <div className="sch-modal-panel">
              {facts}
              <div className="sch-modal-price">
                <span>Consultation fee</span>
                <b>{money(service.price)}</b>
              </div>
            </div>

            <div className="dp-field">
              <label htmlFor="b-name">Patient name</label>
              <input id="b-name" className="dp-input" name="patientName" required value={form.patientName} onChange={change} placeholder="Full name" />
            </div>

            <div className="dp-two">
              <div className="dp-field">
                <label htmlFor="b-email">Email</label>
                <input id="b-email" className="dp-input" name="email" type="email" required value={form.email} onChange={change} placeholder="you@example.com" />
              </div>
              <div className="dp-field">
                <label htmlFor="b-phone">Phone</label>
                <input id="b-phone" className="dp-input" name="phone" required value={form.phone} onChange={change} placeholder="+880 1XXX XXXXXX" />
              </div>
            </div>

            <div className="dp-field">
              <label htmlFor="b-note">Anything the doctor should know? <i>(optional)</i></label>
              <input id="b-note" className="dp-input" name="note" value={form.note} onChange={change} placeholder="e.g. sensitive to cold, taking antibiotics" />
            </div>

            <button type="submit" className="dp-btn dp-btn-primary dp-btn-block" disabled={saving} style={{ marginTop: 6 }}>
              {saving ? 'Confirming…' : <>Confirm booking <IconCheck size={17} /></>}
            </button>
            <p className="sch-modal-foot">Free cancellation up to 24 hours before your visit.</p>
          </form>
        )}

        {step === 'done' && (
          <div className="dp-modal-body sch-done">
            <span className="sch-done-tick"><IconCheck size={30} weight={2.6} /></span>
            <h4>You are booked in</h4>
            <p>
              A confirmation is on its way to <b>{saved?.email}</b>. The clinic can see
              this appointment in the dashboard already.
            </p>
            <div className="sch-modal-panel">{facts}</div>
            <div className="sch-done-actions">
              <button type="button" className="dp-btn dp-btn-ghost" onClick={onClose}>Book another slot</button>
              <Link to="/dashboard/my-appointments" className="dp-btn dp-btn-primary">
                My appointments <IconArrow size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
