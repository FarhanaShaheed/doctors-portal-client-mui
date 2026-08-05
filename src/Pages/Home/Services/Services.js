import React from 'react';
import Service from './../Service/Service';
import fluoride from '../../../images/fluoride.png';
import cavity from '../../../images/cavity.png';
import whitening from '../../../images/whitening.png';

const services = [
  {
    id: 's1',
    name: 'Fluoride treatment',
    description:
      'A 20-minute protective varnish that re-mineralises weakened enamel and cuts the risk of new cavities — the single cheapest thing you can do for your teeth.',
    img: fluoride,
  },
  {
    id: 's2',
    name: 'Cavity filling',
    description:
      'Tooth-coloured composite fillings shaped and cured in one sitting. We match the shade to the tooth next door, so nobody can tell where the filling is.',
    img: cavity,
  },
  {
    id: 's3',
    name: 'Teeth whitening',
    description:
      'Clinically supervised whitening that lifts 4–6 shades in a single session, with a take-home tray so the result still looks fresh six months later.',
    img: whitening,
  },
];

const Services = () => (
  <section className="dp-section" id="services">
    <div className="dp-wrap dp-center">
      <span className="dp-eyebrow dp-reveal">Our services</span>
      <h2 className="dp-h2 dp-reveal">Everything your teeth need, in one clinic</h2>
      <p className="dp-sub dp-reveal" style={{ marginBottom: 46 }}>
        Preventive, restorative and cosmetic dentistry under one roof — with the
        same dentist following you through the whole treatment plan.
      </p>

      <div className="dp-grid-3">
        {services.map((service, i) => (
          <Service key={service.id} service={service} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default Services;
