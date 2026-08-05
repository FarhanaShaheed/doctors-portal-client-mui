import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Booking from '../Booking/Booking';
import BookingModal from '../BookingModal/BookingModal';
import { getAppointments, dateKey, prettyDate } from '../../../api/demoApi';
import { IconCheck, IconArrow } from '../../Shared/Icons/Icons';

const slots = [
  { id: 1, name: 'Teeth Orthodontics', time: '08.00 AM - 09.00 AM', capacity: 10, doctor: 'Dr. Ayesha Rahman' },
  { id: 2, name: 'Cavity Protection', time: '08.00 AM - 09.00 AM', capacity: 10, doctor: 'Dr. Sabbir Ahmed' },
  { id: 3, name: 'Cosmetic Dentistry', time: '09.00 AM - 10.00 AM', capacity: 8, doctor: 'Dr. Tanvir Hossain' },
  { id: 4, name: 'Teeth Cleaning', time: '10.00 AM - 11.00 AM', capacity: 9, doctor: 'Dr. Farhana Binta' },
  { id: 5, name: 'Pediatric Dental', time: '06.00 PM - 07.00 PM', capacity: 5, doctor: 'Dr. Nusrat Jahan' },
  { id: 6, name: 'Oral Surgery', time: '07.00 PM - 08.00 PM', capacity: 10, doctor: 'Dr. Imran Chowdhury' },
];

const AvailableAppointments = ({ date }) => {
  const [taken, setTaken] = useState([]);
  const [active, setActive] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const key = dateKey(date);

  const refresh = () => {
    getAppointments().then((all) => setTaken(all.filter((a) => a.dateKey === key)));
  };

  useEffect(refresh, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const withSpaces = useMemo(
    () =>
      slots.map((slot) => ({
        ...slot,
        space: Math.max(
          0,
          slot.capacity - taken.filter((a) => a.serviceName === slot.name).length
        ),
      })),
    [taken]
  );

  const handleBooked = (appointment) => {
    setActive(null);
    setConfirmed(appointment);
    refresh();
    if (typeof window !== 'undefined') window.scrollTo({ top: window.scrollY - 220, behavior: 'smooth' });
  };

  return (
    <section className="dp-slots-wrap">
      <div className="dp-wrap">
        <div className="dp-slots-panel">
          <div className="dp-slots-top">
            <div>
              <h2 className="dp-h3">Available appointments</h2>
              <p style={{ fontSize: '.9rem' }}>{prettyDate(date)}</p>
            </div>
            <span className="dp-chip">
              {withSpaces.reduce((n, s) => n + s.space, 0)} slots open · {taken.length} booked
            </span>
          </div>

          {confirmed && (
            <div className="dp-alert dp-alert-ok" role="status" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <IconCheck size={18} />
              <span>
                <b>Appointment confirmed.</b> {confirmed.serviceName} · {confirmed.time} on {prettyDate(date)}.
              </span>
              <Link to="/dashboard" className="dp-btn dp-btn-ghost dp-btn-sm" style={{ marginLeft: 'auto' }}>
                See it in the dashboard <IconArrow size={15} />
              </Link>
            </div>
          )}

          <div className="dp-grid-3" style={{ marginTop: 20 }}>
            {withSpaces.map((slot) => (
              <Booking key={slot.id} booking={slot} onBook={setActive} />
            ))}
          </div>
        </div>
      </div>

      {active && (
        <BookingModal
          booking={active}
          date={date}
          onClose={() => setActive(null)}
          onBooked={handleBooked}
        />
      )}
    </section>
  );
};

export default AvailableAppointments;
