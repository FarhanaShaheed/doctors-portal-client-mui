import React, { useState } from 'react';
import { IconMail, IconPhone, IconPin, IconArrow } from '../../Shared/Icons/Icons';
import { createMessage } from '../../../api/demoApi';
import { CLINIC } from '../../../api/config';

const ContactUs = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ email: '', subject: '', message: '' });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError('That email address looks incomplete.'); return; }
    if (form.message.trim().length < 10) { setError('A little more detail helps the desk answer properly.'); return; }
    setError(''); setSending(true);
    // reaches the clinic dashboard's inbox (API when up, local store otherwise)
    await createMessage({ ...form, email, name: form.name || email.split('@')[0] });
    setSending(false);
    setSent(true);
    setForm({ email: '', subject: '', message: '' });
  };

  return (
    <section className="dp-section" id="contact">
      <div className="dp-wrap">
        <div className="dp-contact-card dp-reveal">
          <div>
            <span className="dp-eyebrow" style={{ background: 'rgba(255,255,255,.12)', color: '#d8d5ff' }}>
              Contact us
            </span>
            <h2 className="dp-h2">Always connected with you</h2>
            <p className="lead">
              Questions about a treatment, insurance or a booking? Send a note and
              the front desk replies within one working day.
            </p>

            <div className="dp-contact-list">
              <div><span className="ic"><IconPin size={17} /></span> {`${CLINIC.street}, ${CLINIC.city}`}</div>
              <div><span className="ic"><IconPhone size={17} /></span> {CLINIC.phone}</div>
              <div><span className="ic"><IconMail size={17} /></span> {CLINIC.email}</div>
            </div>
          </div>

          <form onSubmit={submit}>
            {sent && (
              <div className="dp-alert dp-alert-ok" role="status">
                Thanks — your message is in the queue. The clinic will reply by email.
              </div>
            )}
            <div className="dp-field">
              <label htmlFor="c-email">Email address</label>
              <input
                id="c-email" className="dp-input" name="email" type="email" required
                placeholder="you@example.com" value={form.email} onChange={change}
              />
            </div>
            <div className="dp-field">
              <label htmlFor="c-subject">Subject</label>
              <input
                id="c-subject" className="dp-input" name="subject" required
                placeholder="What is this about?" value={form.subject} onChange={change}
              />
            </div>
            <div className="dp-field">
              <label htmlFor="c-message">Your message</label>
              <textarea
                id="c-message" className="dp-input" name="message" rows={4} required
                placeholder="Tell us a little more…" value={form.message} onChange={change}
              />
            </div>
            <button type="submit" className="dp-btn dp-btn-primary dp-btn-block">
              Send message <IconArrow size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
