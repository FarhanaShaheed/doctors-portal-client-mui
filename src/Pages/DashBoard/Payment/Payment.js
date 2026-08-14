import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useAuth from '../../../hooks/useAuth';
import { getMyAppointments, payAppointment } from '../../../api/demoApi';
import { API_BASE, CLINIC, money } from '../../../api/config';
import { IconCheck, IconArrow } from '../../Shared/Icons/Icons';

/* Paying a consultation fee with Stripe.

   IMPORTANT — no card number ever touches this code: the fields below are Stripe's own
   CardElement, an iframe hosted by Stripe. We only ever see a token.

   Keys are TEST keys (pk_test_…). With none configured the page shows no card fields at
   all — just an explanation and a "record as paid" button — rather than pretending to
   take a payment. */

const PK = process.env.REACT_APP_STRIPE_PK || '';
const stripePromise = PK ? loadStripe(PK) : null;

const CARD_STYLE = {
  style: {
    base: { fontSize: '15px', color: '#1b1a3a', fontFamily: 'inherit', '::placeholder': { color: '#9a99ad' } },
    invalid: { color: '#c1272d' },
  },
};

const CardForm = ({ appointment, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/create-payment-intent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ price: appointment.price }),
    })
      .then((r) => { if (!r.ok) throw new Error('api'); return r.json(); })
      .then((d) => setClientSecret(d.clientSecret || ''))
      .catch(() => setClientSecret(''));   // server not reachable — handled below
  }, [appointment.price]);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true); setError('');

    const card = elements.getElement(CardElement);
    const { error: cardError } = await stripe.createPaymentMethod({ type: 'card', card });
    if (cardError) { setError(cardError.message); setBusy(false); return; }

    if (!clientSecret) {
      setError('The payment server is not reachable, so the card was not charged.');
      setBusy(false);
      return;
    }

    const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: { name: appointment.patientName, email: appointment.email },
      },
    });
    setBusy(false);
    if (confirmError) { setError(confirmError.message); return; }
    onPaid(paymentIntent.id);
  };

  return (
    <form onSubmit={submit} className="pay-form">
      <label className="pay-label">Card details</label>
      <div className="pay-card"><CardElement options={CARD_STYLE} /></div>
      <p className="pay-hint">
        Stripe <b>test mode</b> — use card <code>4242 4242 4242 4242</code>, any future expiry and CVC.
        No real money moves.
      </p>
      {error && <div className="dp-alert dp-alert-err">{error}</div>}
      <button type="submit" className="dp-btn dp-btn-primary dp-btn-block" disabled={!stripe || busy}>
        {busy ? 'Processing…' : <>Pay {money(appointment.price)} <IconArrow size={17} /></>}
      </button>
    </form>
  );
};

const Payment = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    getMyAppointments(user.email).then((list) => {
      setAppointment((list || []).find((a) => String(a._id) === String(id)) || null);
      setLoading(false);
    });
  }, [user?.email, id]);

  const settle = async (transactionId) => {
    await payAppointment(id, transactionId);
    setReceipt(transactionId);
  };

  const summary = useMemo(() => appointment && ([
    ['Patient', appointment.patientName],
    ['Treatment', appointment.serviceName],
    ['Doctor', appointment.doctor],
    ['When', `${appointment.date} · ${appointment.time}`],
    ['Fee', money(appointment.price)],
  ]), [appointment]);

  if (loading) return <section className="dash-page"><p className="dash-muted">Loading…</p></section>;
  if (!appointment) {
    return (
      <section className="dash-page">
        <div className="dash-empty">That appointment was not found. <Link to="/dashboard/my-appointments">Back to my appointments</Link></div>
      </section>
    );
  }

  return (
    <section className="dash-page">
      <header className="dash-head">
        <div>
          <h2>Pay your consultation fee</h2>
          <p>{CLINIC.name} · {CLINIC.street}, {CLINIC.city}</p>
        </div>
      </header>

      <div className="pay-grid">
        <aside className="pay-summary">
          {summary.map(([k, v]) => (<div key={k}><span>{k}</span><b>{v}</b></div>))}
          <p className="pay-note">
            Paying in advance is optional — you can also settle at the front desk on the day.
          </p>
        </aside>

        <div className="pay-panel">
          {receipt || appointment.paid ? (
            <div className="pay-done">
              <span className="sch-done-tick"><IconCheck size={28} weight={2.6} /></span>
              <h4>Payment received</h4>
              <p>
                {money(appointment.price)} paid for {appointment.serviceName}.<br />
                Transaction <code>{receipt || appointment.transactionId}</code>
              </p>
              <button type="button" className="dp-btn dp-btn-primary" onClick={() => history.push('/dashboard/my-appointments')}>
                Back to my appointments
              </button>
            </div>
          ) : PK ? (
            <Elements stripe={stripePromise}>
              <CardForm appointment={appointment} onPaid={settle} />
            </Elements>
          ) : (
            <div className="pay-nokey">
              <b>Card payments are not switched on for this deployment</b>
              <p>
                The clinic's Stripe <b>test</b> publishable key is missing, so no card form is
                shown — this page will not ask for card details it cannot process. Add
                <code>REACT_APP_STRIPE_PK=pk_test_…</code> at build time and the real Stripe
                card field appears here.
              </p>
              <button type="button" className="dp-btn dp-btn-ghost"
                onClick={() => settle('demo-' + Date.now().toString(36))}>
                Record as paid at the desk
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Payment;
