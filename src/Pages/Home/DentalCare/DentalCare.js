import React from 'react';
import { Link } from 'react-router-dom';
import treatment from '../../../images/treatment.png';
import { IconArrow } from '../../Shared/Icons/Icons';

const points = [
  'Same dentist from first consult to final check-up',
  'Digital X-rays and a written treatment plan before anything starts',
  'Evening and weekend slots for people who work office hours',
  'Transparent, itemised pricing — no surprises at the counter',
];

const DentalCare = () => (
  <section className="dp-section alt" id="about">
    <div className="dp-wrap dp-grid-2">
      <div className="dp-feature-img dp-reveal">
        <img src={treatment} alt="Dentist treating a patient" />
      </div>

      <div className="dp-reveal dp-d1">
        <span className="dp-eyebrow">Why patients stay</span>
        <h2 className="dp-h2">Exceptional dental care, on your terms</h2>
        <p className="dp-sub">
          Most people put off the dentist because the process is opaque and the
          waiting room eats a whole afternoon. We rebuilt the clinic around
          scheduled slots, so you know exactly what is happening and when.
        </p>

        <ul className="dp-ticks">
          {points.map((point) => (
            <li key={point}>
              <span className="dp-tick">✓</span>
              {point}
            </li>
          ))}
        </ul>

        <Link to="/appointment" className="dp-btn dp-btn-primary">
          Find a slot <IconArrow size={18} />
        </Link>
      </div>
    </div>
  </section>
);

export default DentalCare;
