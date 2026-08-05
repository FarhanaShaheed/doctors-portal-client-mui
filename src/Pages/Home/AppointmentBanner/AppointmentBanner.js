import React from 'react';
import { Link } from 'react-router-dom';
import doctor from '../../../images/doctor.png';
import { IconArrow } from '../../Shared/Icons/Icons';

const AppointmentBanner = () => (
  <section className="dp-section">
    <div className="dp-wrap">
      <div className="dp-cta dp-reveal">
        <div>
          <span className="dp-eyebrow" style={{ background: 'rgba(255,255,255,.16)', color: '#e6e2ff' }}>
            Appointment
          </span>
          <h2 className="dp-h2">Make an appointment today</h2>
          <p>
            Choose a date, see exactly which slots are still open and confirm in
            one click. You get an instant confirmation and a reminder the morning
            of your visit — no phone calls, no waiting on hold.
          </p>
          <Link to="/appointment" className="dp-btn dp-btn-white">
            Choose your slot <IconArrow size={18} />
          </Link>
        </div>
        <div className="dp-cta-img">
          <img src={doctor} alt="Dentist ready for an appointment" />
        </div>
      </div>
    </div>
  </section>
);

export default AppointmentBanner;
