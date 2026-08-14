import React from 'react';
import { Link } from 'react-router-dom';
import chair from '../../../images/chair.png';
import { IconArrow, IconCalendar, IconShield, IconStethoscope } from '../../Shared/Icons/Icons';

const Banner = () => (
  <section className="dp-hero">
    <div className="dp-wrap">
      <div className="dp-hero-grid">
        <div>
          <span className="dp-eyebrow">Frankfurt&apos;s modern dental clinic</span>
          <h1>
            Your new smile <br />
            <span className="accent">starts right here</span>
          </h1>
          <p className="dp-hero-lead">
            Pick a day, pick a slot, walk in. Six specialist services, transparent
            pricing and a clinic team that actually runs on time — booking takes
            under a minute.
          </p>

          <div className="dp-hero-ctas">
            <Link to="/appointment" className="dp-btn dp-btn-primary">
              Book an appointment <IconArrow size={18} />
            </Link>
            <a href="#services" className="dp-btn dp-btn-light">Explore services</a>
          </div>

          <div className="dp-hero-stats">
            <div><b>12k+</b><span>Happy patients</span></div>
            <div><b>24</b><span>Specialists</span></div>
            <div><b>4.9★</b><span>Average rating</span></div>
          </div>
        </div>

        <div className="dp-hero-visual">
          <div className="dp-hero-orb" />
          <img className="dp-hero-img" src={chair} alt="Modern dental treatment chair" />

          <div className="dp-float dp-float-1">
            <span className="ic"><IconCalendar size={17} /></span>
            <span>Next slot today<small>08:00 – 09:00 AM</small></span>
          </div>
          <div className="dp-float dp-float-2">
            <span className="ic"><IconShield size={17} /></span>
            <span>Insurance ready<small>Cashless claims</small></span>
          </div>
          <div className="dp-float dp-float-3">
            <span className="ic"><IconStethoscope size={17} /></span>
            <span>On-call dentist<small>7 days a week</small></span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Banner;
