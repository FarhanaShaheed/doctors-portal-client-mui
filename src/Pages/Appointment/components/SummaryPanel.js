import React from 'react';
import { Link } from 'react-router-dom';
import DoctorAvatar from '../../Shared/DoctorAvatar/DoctorAvatar';
import { IconCalendar, IconClock, IconPin, IconCheck, IconArrow } from '../../Shared/Icons/Icons';
import { durationLabel, money, timeRange } from '../../../api/schedule';
import { prettyDate } from '../../../api/demoApi';

/* Sticky desktop rail: who / what / when, the price, and the patient's own
   upcoming visits — which update the instant a booking is confirmed. */
const SummaryPanel = ({ doctor, date, service, slot, onReview, user, mine }) => (
  <aside className="sch-aside">
    <div className="sch-summary">
      <div className="sch-summary-doc">
        <DoctorAvatar doctor={doctor} size={48} dot />
        <div>
          <b>{doctor.name}</b>
          <span>{doctor.speciality}</span>
        </div>
        <span className="sch-rating">{doctor.rating || 5}★</span>
      </div>

      <p className="sch-summary-bio">{doctor.bio}</p>

      <ul className="sch-summary-rows">
        <li>
          <span className="ic"><IconCalendar size={16} /></span>
          <span className="lb">Date</span>
          <span className="vl">{prettyDate(date)}</span>
        </li>
        <li>
          <span className="ic"><IconClock size={16} /></span>
          <span className="lb">Time</span>
          <span className={`vl${slot ? '' : ' is-empty'}`}>
            {slot ? timeRange(slot.time, service.duration) : 'Pick a slot'}
          </span>
        </li>
        <li>
          <span className="ic"><IconCheck size={16} /></span>
          <span className="lb">Reason</span>
          <span className="vl">{service.name}</span>
        </li>
        <li>
          <span className="ic"><IconPin size={16} /></span>
          <span className="lb">Where</span>
          <span className="vl">{doctor.room || 'Zeil practice'}</span>
        </li>
      </ul>

      <div className="sch-summary-total">
        <span>{durationLabel(service.duration)} consultation</span>
        <b>{money(service.price)}</b>
      </div>

      <button
        type="button"
        className="dp-btn dp-btn-primary dp-btn-block"
        disabled={!slot}
        onClick={onReview}
      >
        {slot ? 'Review & confirm' : 'Select a time first'}
      </button>

      {!user?.email && (
        <p className="sch-summary-note">
          You can browse freely — we only ask you to{' '}
          <Link to={{ pathname: '/login', state: { from: { pathname: '/appointment' } } }}>log in</Link>{' '}
          when you confirm.
        </p>
      )}
    </div>

    <div className="sch-mine">
      <div className="sch-mine-head">
        <h3>My appointments</h3>
        {mine.length > 0 && <span>{mine.length}</span>}
      </div>

      {mine.length === 0 ? (
        <p className="sch-mine-empty">
          {user?.email
            ? 'No upcoming visits yet. Your bookings will appear here straight away.'
            : 'Log in to see the visits you have already booked.'}
        </p>
      ) : (
        <ul className="sch-mine-list">
          {mine.slice(0, 4).map((a) => (
            <li key={a._id}>
              <span className="dt">
                <b>{new Date(`${a.dateKey}T00:00:00`).getDate()}</b>
                <i>{new Date(`${a.dateKey}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</i>
              </span>
              <span className="in">
                <b>{a.serviceName}</b>
                <i>{a.doctor} · {a.time}</i>
              </span>
              <span className={`sch-tag ${(a.status || 'Confirmed').toLowerCase()}`}>{a.status}</span>
            </li>
          ))}
        </ul>
      )}

      {user?.email && (
        <Link to="/dashboard/my-appointments" className="sch-linkbtn strong">
          Open my appointments <IconArrow size={14} />
        </Link>
      )}
    </div>
  </aside>
);

export default SummaryPanel;
