import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DoctorAvatar from '../../Shared/DoctorAvatar/DoctorAvatar';
import { IconCheck, IconArrow, IconClock, IconCalendar, IconPin } from '../../Shared/Icons/Icons';
import { durationLabel, money, timeRange, to12h } from '../../../api/schedule';
import { prettyDate, createAppointment, dateKey } from '../../../api/demoApi';
import useAuth from '../../../hooks/useAuth';

/* Confirmation dialog: review → confirm → success, all in place.
   Logged-out visitors get the "log in and come back" state instead of the
   form, so nothing is lost when they return. */
const BookingModal = ({ doctor, date, service, slot, user, onClose, onBooked }) => {
  const { token } = useAuth();   // signs the booking so it lands on the right account
  const [step, setStep] = useState(user?.email ? 'review' : 'login');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState({
    patientName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    birthDate: '',
    gender: '',
    street: '',
    postcode: '',
    city: '',
    insurer: '',
    insuranceType: 'statutory',
    insuranceNumber: '',
    reason: '',
    firstVisit: 'yes',
    note: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const change = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  /* A phone number is digits plus the separators people actually type. Letters used to
     sail straight through — "abcdefgh" booked an appointment. */
  const PHONE_OK = /^[0-9+()\/.\s-]+$/;
  const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validate = (v) => {
    const e = {};
    if (v.patientName.trim().length < 2) e.patientName = 'Please enter the patient\u2019s full name.';
    if (!EMAIL_OK.test(v.email.trim())) e.email = 'That email address looks incomplete.';

    const digits = v.phone.replace(/\D/g, '');
    if (!v.phone.trim()) e.phone = 'We call this number to confirm the visit.';
    else if (!PHONE_OK.test(v.phone.trim())) e.phone = 'A phone number cannot contain letters.';
    else if (digits.length < 7) e.phone = `That is only ${digits.length} digit${digits.length === 1 ? '' : 's'} \u2014 at least 7 are needed.`;
    else if (digits.length > 15) e.phone = 'That is too long for a phone number.';

    if (!v.birthDate) e.birthDate = 'Date of birth is required for the patient file.';
    else {
      const age = (Date.now() - new Date(v.birthDate).getTime()) / 3.15576e10;
      if (age < 0) e.birthDate = 'That date is in the future.';
      else if (age > 120) e.birthDate = 'Please check that date.';
    }
    if (v.street.trim().length < 4) e.street = 'Street and house number are required.';
    if (!/^\d{4,6}$/.test(v.postcode.trim())) e.postcode = 'Postcode should be 4-6 digits.';
    if (v.city.trim().length < 2) e.city = 'City is required.';
    if (v.insuranceType !== 'self' && v.insurer.trim().length < 2) e.insurer = 'Insurer is required (or choose self-payer).';
    if (!v.reason.trim()) e.reason = 'Tell the doctor what the visit is about.';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      const el = document.querySelector('[data-invalid="true"]');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus?.(); }
      return;
    }
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
    const result = await createAppointment(appointment, token);
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
      <li><span className="ic"><IconPin size={15} /></span>{doctor.room || 'Zeil practice'}</li>
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

            <div className="sch-form-sec"><span>1</span> Patient</div>

            <div className="dp-two">
              <div className="dp-field">
                <label htmlFor="b-name">Patient name *</label>
                <input id="b-name" className="dp-input" name="patientName" data-invalid={errors.patientName ? 'true' : undefined}
                  value={form.patientName} onChange={change} placeholder="Full name" />
                {errors.patientName && <span className="dp-err">{errors.patientName}</span>}
              </div>
              <div className="dp-field">
                <label htmlFor="b-dob">Date of birth *</label>
                <input id="b-dob" className="dp-input" name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)}
                  data-invalid={errors.birthDate ? 'true' : undefined} value={form.birthDate} onChange={change} />
                {errors.birthDate && <span className="dp-err">{errors.birthDate}</span>}
              </div>
            </div>

            <div className="dp-two">
              <div className="dp-field">
                <label htmlFor="b-email">Email *</label>
                <input id="b-email" className="dp-input" name="email" type="email" data-invalid={errors.email ? 'true' : undefined}
                  value={form.email} onChange={change} placeholder="you@example.com" />
                {errors.email && <span className="dp-err">{errors.email}</span>}
              </div>
              <div className="dp-field">
                <label htmlFor="b-phone">Phone *</label>
                <input id="b-phone" className="dp-input" name="phone" type="tel" inputMode="tel"
                  data-invalid={errors.phone ? 'true' : undefined} value={form.phone} onChange={change} placeholder="+49 69 1200 4400" />
                {errors.phone && <span className="dp-err">{errors.phone}</span>}
              </div>
            </div>

            <div className="sch-form-sec"><span>2</span> Address</div>

            <div className="dp-field">
              <label htmlFor="b-street">Street and house number *</label>
              <input id="b-street" className="dp-input" name="street" data-invalid={errors.street ? 'true' : undefined}
                value={form.street} onChange={change} placeholder="Musterstra\u00dfe 12" />
              {errors.street && <span className="dp-err">{errors.street}</span>}
            </div>
            <div className="dp-two">
              <div className="dp-field">
                <label htmlFor="b-post">Postcode *</label>
                <input id="b-post" className="dp-input" name="postcode" inputMode="numeric"
                  data-invalid={errors.postcode ? 'true' : undefined} value={form.postcode} onChange={change} placeholder="60313" />
                {errors.postcode && <span className="dp-err">{errors.postcode}</span>}
              </div>
              <div className="dp-field">
                <label htmlFor="b-city">City *</label>
                <input id="b-city" className="dp-input" name="city" data-invalid={errors.city ? 'true' : undefined}
                  value={form.city} onChange={change} placeholder="Frankfurt am Main" />
                {errors.city && <span className="dp-err">{errors.city}</span>}
              </div>
            </div>

            <div className="sch-form-sec"><span>3</span> Insurance &amp; visit</div>

            <div className="dp-two">
              <div className="dp-field">
                <label htmlFor="b-instype">Cover *</label>
                <select id="b-instype" className="dp-input" name="insuranceType" value={form.insuranceType} onChange={change}>
                  <option value="statutory">Statutory (gesetzlich)</option>
                  <option value="private">Private (privat)</option>
                  <option value="self">Self-payer</option>
                </select>
              </div>
              <div className="dp-field">
                <label htmlFor="b-insurer">Insurer {form.insuranceType === 'self' ? <i>(not needed)</i> : '*'}</label>
                <input id="b-insurer" className="dp-input" name="insurer" disabled={form.insuranceType === 'self'}
                  data-invalid={errors.insurer ? 'true' : undefined} value={form.insurer} onChange={change} placeholder="e.g. AOK, TK, Barmer" />
                {errors.insurer && <span className="dp-err">{errors.insurer}</span>}
              </div>
            </div>

            <div className="dp-two">
              <div className="dp-field">
                <label htmlFor="b-insno">Insurance number <i>(optional)</i></label>
                <input id="b-insno" className="dp-input" name="insuranceNumber" value={form.insuranceNumber} onChange={change} placeholder="A123456789" />
              </div>
              <div className="dp-field">
                <label htmlFor="b-first">First visit here?</label>
                <select id="b-first" className="dp-input" name="firstVisit" value={form.firstVisit} onChange={change}>
                  <option value="yes">Yes, first visit</option>
                  <option value="no">No, returning patient</option>
                </select>
              </div>
            </div>

            <div className="dp-field">
              <label htmlFor="b-reason">Reason for the visit *</label>
              <input id="b-reason" className="dp-input" name="reason" data-invalid={errors.reason ? 'true' : undefined}
                value={form.reason} onChange={change} placeholder="e.g. toothache on the lower left since Monday" />
              {errors.reason && <span className="dp-err">{errors.reason}</span>}
            </div>

            <div className="dp-field">
              <label htmlFor="b-note">Anything else the doctor should know? <i>(optional)</i></label>
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
