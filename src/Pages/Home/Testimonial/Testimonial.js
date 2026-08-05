import React from 'react';
import p1 from '../../../images/people-1.png';
import p2 from '../../../images/people-2.png';
import p3 from '../../../images/people-3.png';

const reviews = [
  {
    id: 'r1',
    name: 'Winson Herry',
    location: 'California, US',
    img: p1,
    text:
      'Booked at 9pm on a Sunday and had a slot the next morning. The dentist walked me through the X-ray on screen before touching anything — I have never had that anywhere else.',
  },
  {
    id: 'r2',
    name: 'Sadia Noor',
    location: 'Dhanmondi, Dhaka',
    img: p2,
    text:
      'Two fillings, one visit, exactly the price I was quoted online. The reminder the morning of the appointment is a small thing but it saved me from forgetting.',
  },
  {
    id: 'r3',
    name: 'Rafiul Karim',
    location: 'Gulshan, Dhaka',
    img: p3,
    text:
      'I brought my daughter for a pediatric check-up and she actually wants to go back. Clean clinic, zero waiting, and everything visible in the patient portal afterwards.',
  },
];

const Testimonial = () => (
  <section className="dp-section alt">
    <div className="dp-wrap dp-center">
      <span className="dp-eyebrow dp-reveal">Testimonials</span>
      <h2 className="dp-h2 dp-reveal">What our patients say</h2>
      <p className="dp-sub dp-reveal" style={{ marginBottom: 46 }}>
        Over 12,000 visits and a 4.9 average rating — here is a fair sample of it.
      </p>

      <div className="dp-grid-3">
        {reviews.map((review, i) => (
          <article className={`dp-quote dp-reveal dp-d${(i % 3) + 1}`} key={review.id}>
            <div className="stars">★★★★★</div>
            <p>“{review.text}”</p>
            <div className="who">
              <img src={review.img} alt={review.name} />
              <div>
                <div className="nm">{review.name}</div>
                <div className="loc">{review.location}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonial;
