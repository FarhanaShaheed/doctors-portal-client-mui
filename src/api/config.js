/* Single source for where the Express/MongoDB API lives, and for the clinic's own
   details. Nothing else in the app should hardcode a host, a phone number or an address.

   Local dev / demo:  nothing set -> http://localhost:5000
   Real deployment:   REACT_APP_API_BASE=https://…  (build time, CRA inlines it)   */

export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

/* Over HTTPS a call to http://localhost:5000 is blocked as mixed content before it
   leaves the browser, so the demo layer skips the network entirely in that case. */
export const canReachApi = () => {
  if (typeof window === 'undefined') return false;
  if (window.location.protocol === 'https:' && API_BASE.startsWith('http://')) return false;
  return true;
};

/* The (fictional) clinic this demo represents. Kept in one place so the address,
   phone and currency stay consistent across the site, the emails and the receipts. */
export const CLINIC = {
  name: 'Doctors Portal',
  tagline: 'Dental Care',
  street: 'Zeil 42',
  city: '60313 Frankfurt am Main',
  country: 'Germany',
  phone: '+49 69 1200 4400',
  email: 'hello@doctorsportal.demo',
  hours: 'Mon–Fri 08:00–19:00 · Sat 09:00–14:00',
  currency: 'EUR',
  currencySymbol: '€',
};

export const money = (amount) =>
  `${CLINIC.currencySymbol}${Number(amount || 0).toLocaleString('de-DE')}`;

export default API_BASE;
