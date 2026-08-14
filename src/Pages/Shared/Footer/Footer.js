import React from 'react';
import { Link } from 'react-router-dom';
import { IconTooth } from '../Icons/Icons';
import { CLINIC } from '../../../api/config';

const Footer = () => (
  <footer className="dp-footer">
    <div className="dp-wrap">
      <div className="dp-footer-grid">
        <div>
          <div className="dp-brand">
            <span className="dp-logo"><IconTooth size={21} /></span>
            <span>
              Doctors Portal
              <small>Dental care</small>
            </span>
          </div>
          <p style={{ maxWidth: '22rem' }}>
            A modern dental clinic platform — patients book in seconds, the clinic
            runs the day from one dashboard.
          </p>
        </div>

        <div>
          <h5>Services</h5>
          <a href="/#services">Teeth orthodontics</a>
          <a href="/#services">Cavity protection</a>
          <a href="/#services">Cosmetic dentistry</a>
          <a href="/#services">Oral surgery</a>
        </div>

        <div>
          <h5>Clinic</h5>
          <a href="/#about">About us</a>
          <Link to="/appointment">Book appointment</Link>
          <Link to="/dashboard">Admin dashboard</Link>
          <a href="/#contact">Contact</a>
        </div>

        <div>
          <h5>Get in touch</h5>
          <p>{CLINIC.street}<br />{CLINIC.city}</p>
          <p>{CLINIC.phone}</p>
          <p>hello@doctorsportal.demo</p>
        </div>
      </div>

      <div className="dp-footer-bottom">
        <span>© {new Date().getFullYear()} Doctors Portal. Portfolio demo project.</span>
        <span>Built with React, React Router and a hand-rolled design system.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
