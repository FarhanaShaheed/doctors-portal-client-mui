/* ---------------------------------------------------------------------------
   Data layer — real backend first, local demo data as the fallback.

   The original app talked to an Express/Mongo server on http://localhost:5000.
   That server is not part of this repository and is obviously not reachable
   from a public deploy, so every call here:

     1. tries the real REST endpoint (so nothing changes if the backend is up),
     2. falls back to the seed JSON shipped in /public on failure,
     3. persists writes to localStorage so the demo behaves like a real app —
        an appointment you book on the public site really does show up in the
        admin dashboard.

   Over HTTPS a request to http://localhost:5000 is blocked as mixed content
   before it even leaves the browser, so we skip step 1 there to keep the
   console clean. On http://localhost the real backend is still used.
--------------------------------------------------------------------------- */

import { API_BASE, canReachApi } from './config';

const API = API_BASE;

/* Storage keys are versioned: the v2 schema adds per-doctor working hours plus
   real start times and durations on appointments, so returning visitors get a
   fresh seed instead of the flat v1 rows. */
const LS = {
  appointments: 'dp_appointments_v2',
  doctors: 'dp_doctors_v2',
  admins: 'dp_admins',
  seeded: 'dp_seeded_v2',
  messages: 'dp_messages',
};

/* ------------------------------ tiny helpers ----------------------------- */

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
};

const asset = (file) => `${process.env.PUBLIC_URL || ''}/${file}`;

/** fetch that never throws — resolves to null when the backend is unavailable */
const softFetch = async (url, options) => {
  if (!canReachApi()) return null;
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
};

const loadSeed = async (file) => {
  try {
    const res = await fetch(asset(file));
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
};

/* ------------------------------- date keys ------------------------------- */

export const dateKey = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${day}`;
};

export const addDays = (d, n) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

export const prettyDate = (d) =>
  (d instanceof Date ? d : new Date(d)).toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

export const shortDay = (d) =>
  (d instanceof Date ? d : new Date(d)).toLocaleDateString(undefined, { weekday: 'short' });

/* ------------------------------ appointments ----------------------------- */

/* The v1 data model stored a single display string ("08.00 AM - 09.00 AM").
   v2 stores a machine-readable `startTime` + `duration` so the scheduler can
   detect collisions; these two helpers keep old records readable. */
const pad = (n) => String(n).padStart(2, '0');

const parseStart = (row) => {
  if (row.startTime) return row.startTime;
  const match = /(\d{1,2})[.:](\d{2})\s*(AM|PM)?/i.exec(row.time || '');
  if (!match) return '09:00';
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = (match[3] || '').toUpperCase();
  if (suffix === 'PM' && hour < 12) hour += 12;
  if (suffix === 'AM' && hour === 12) hour = 0;
  return `${pad(hour)}:${pad(minute)}`;
};

/** "09:30" + 45 → "10:15" */
export const addMinutes = (hhmm, minutes) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  const total = (h || 0) * 60 + (m || 0) + Number(minutes || 0);
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
};

export const slotLabel = (startTime, duration = 30) =>
  `${startTime} – ${addMinutes(startTime, duration)}`;

/** Seeds localStorage once from /appointments.json, anchoring the sample data
 *  to the current week so the dashboard always has something to show. */
const seedAppointments = async () => {
  if (read(LS.seeded, false) && read(LS.appointments, null)) return read(LS.appointments, []);
  const seed = await loadSeed('appointments.json');
  const today = new Date();
  const rows = seed.map((row) => {
    const when = addDays(today, row.dayOffset || 0);
    const startTime = parseStart(row);
    const duration = Number(row.duration) || 30;
    return {
      _id: row.id,
      patientName: row.patientName,
      email: row.email,
      phone: row.phone,
      startTime,
      duration,
      endTime: addMinutes(startTime, duration),
      time: slotLabel(startTime, duration),
      serviceName: row.serviceName,
      doctor: row.doctor,
      doctorId: row.doctorId,
      price: row.price,
      status: row.status || 'Confirmed',
      dateKey: dateKey(when),
      date: when.toLocaleDateString(),
      seeded: true,
    };
  });
  write(LS.appointments, rows);
  write(LS.seeded, true);
  return rows;
};

const auth = (token) => (token ? { authorization: `Bearer ${token}` } : {});

/**
 * The clinic's bookings.
 * @param email  scope: return only this patient's bookings. Pass nothing only
 *               for an administrator — the API enforces the same rule, and the
 *               filter below repeats it so the offline/demo path cannot leak
 *               one patient's schedule to another.
 */
export const getAppointments = async ({ email, token } = {}) => {
  const remote = await softFetch(
    `${API}/appointments${email ? `?email=${encodeURIComponent(email)}` : ''}`,
    { headers: auth(token) }
  );
  const rows = Array.isArray(remote) && remote.length ? remote : await seedAppointments();
  if (!email) return rows;
  const mine = String(email).toLowerCase();
  return rows.filter((a) => String(a.email || '').toLowerCase() === mine);
};

/* Free/busy for the public booking grid: which slots are taken, never by whom.
   The booking page used to pull the entire appointment list — names, emails and
   phone numbers included — just to grey out a few buttons. */
export const getAvailability = async () => {
  const remote = await softFetch(`${API}/appointments/availability`);
  const rows = Array.isArray(remote) && remote.length ? remote : await seedAppointments();
  return rows.map((a) => ({
    doctorId: a.doctorId,
    doctor: a.doctor,
    dateKey: a.dateKey,
    startTime: a.startTime,
    duration: a.duration,
    status: a.status,
  }));
};

export const getMyAppointments = async (email, token) => {
  if (!email) return [];
  return getAppointments({ email, token });
};

export const createAppointment = async (appointment, token) => {
  const duration = Number(appointment.duration) || 30;
  const startTime = appointment.startTime || '09:00';
  const payload = {
    ...appointment,
    startTime,
    duration,
    endTime: addMinutes(startTime, duration),
    time: appointment.time || slotLabel(startTime, duration),
    _id: `local-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const remote = await softFetch(`${API}/appointments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth(token) },
    body: JSON.stringify(appointment),
  });

  const current = await seedAppointments();
  const next = [payload, ...current];
  write(LS.appointments, next);

  return { insertedId: (remote && remote.insertedId) || payload._id, appointment: payload };
};

export const updateAppointmentStatus = async (id, status) => {
  const current = read(LS.appointments, []);
  const next = current.map((a) => (a._id === id ? { ...a, status } : a));
  write(LS.appointments, next);
  return next;
};

/* -------------------------------- doctors -------------------------------- */

export const getDoctors = async () => {
  const remote = await softFetch(`${API}/doctors`);
  if (Array.isArray(remote) && remote.length) return remote;

  const stored = read(LS.doctors, null);
  if (stored) return stored;

  const seed = await loadSeed('doctors.json');
  write(LS.doctors, seed);
  return seed;
};

export const createDoctor = async (doctor, token) => {
  await softFetch(`${API}/doctors`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...auth(token) },
    body: JSON.stringify(doctor),
  });

  const current = await getDoctors();
  const initials = (doctor.name || '?')
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const tones = ['indigo', 'violet', 'teal', 'amber', 'rose'];
  /* A new doctor is bookable straight away: give them the clinic's standard
     rota and a consultation matching their speciality. */
  const standardHours = {
    sun: [['09:00', '13:00'], ['15:00', '18:00']],
    mon: [['09:00', '13:00'], ['15:00', '18:00']],
    tue: [['09:00', '13:00'], ['15:00', '18:00']],
    wed: [['09:00', '13:00'], ['15:00', '18:00']],
    thu: [['09:00', '13:00'], ['15:00', '18:00']],
    fri: [],
    sat: [['10:00', '14:00']],
  };
  const record = {
    id: `local-${Date.now()}`,
    status: 'Active',
    rating: 5,
    reviews: 0,
    patients: 0,
    experience: Number(doctor.experience) || 1,
    tone: tones[current.length % tones.length],
    room: 'Room 101 · Level 1',
    languages: ['Bangla', 'English'],
    slotDuration: 30,
    workingHours: standardHours,
    services: [
      { name: `${doctor.speciality || 'General'} consultation`, duration: 30, price: 1500 },
      { name: 'Follow-up visit', duration: 30, price: 900 },
    ],
    ...doctor,
    initials: initials || 'DR',
  };
  const next = [record, ...current];
  write(LS.doctors, next);
  return record;
};

/* --------------------------------- users --------------------------------- */

export const getUsers = async (token) => {
  const remote = await softFetch(`${API}/users`, { headers: auth(token) });
  if (Array.isArray(remote) && remote.length) return remote;
  const seed = await loadSeed('users.json');
  const promoted = read(LS.admins, []);
  return seed.map((u) => (promoted.includes(u.email) ? { ...u, admin: true } : u));
};

export const makeAdmin = async (email, token) => {
  await softFetch(`${API}/users/admin`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const promoted = read(LS.admins, []);
  if (!promoted.includes(email)) write(LS.admins, [...promoted, email]);
  return { modifiedCount: 1 };
};

/* ------------------------------- analytics ------------------------------- */

/** Appointment counts for the next `days` days, ready for the dashboard chart. */
/* ---- contact-form messages --------------------------------------------------
   The form used to discard everything it collected: submit() only flipped a flag.
   Messages now go to the API when it is reachable and to localStorage otherwise,
   so the clinic dashboard has an inbox either way. */
/* Marks an appointment paid. Real backend first (it stores the Stripe transaction
   against the booking); otherwise the local copy is updated so the receipt persists. */
export const payAppointment = async (id, transactionId, token) => {
  const patch = { paid: true, transactionId, paidAt: new Date().toISOString() };
  const remote = await softFetch(`${API}/appointments/${id}/payment`, {
    method: 'PUT', headers: { 'content-type': 'application/json', ...auth(token) }, body: JSON.stringify(patch),
  });
  if (!remote) {
    write(LS.appointments, read(LS.appointments, []).map((a) => (String(a._id) === String(id) ? { ...a, ...patch } : a)));
  }
  return patch;
};

export const getMessages = async (token) => {
  const remote = await softFetch(`${API}/messages`, { headers: auth(token) });
  if (Array.isArray(remote)) return remote;
  return read(LS.messages, []);
};

export const createMessage = async (message) => {
  const record = { ...message, _id: 'm' + Date.now(), status: 'new', createdAt: new Date().toISOString() };
  const remote = await softFetch(`${API}/messages`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(record),
  });
  if (!remote) write(LS.messages, [record, ...read(LS.messages, [])]);
  return record;
};

export const updateMessage = async (id, patch, token) => {
  const remote = await softFetch(`${API}/messages/${id}`, {
    method: 'PUT', headers: { 'content-type': 'application/json', ...auth(token) }, body: JSON.stringify(patch),
  });
  if (!remote) write(LS.messages, read(LS.messages, []).map((m) => (m._id === id ? { ...m, ...patch } : m)));
  return true;
};

export const deleteMessage = async (id, token) => {
  const remote = await softFetch(`${API}/messages/${id}`, { method: 'DELETE', headers: auth(token) });
  if (!remote) write(LS.messages, read(LS.messages, []).filter((m) => m._id !== id));
  return true;
};

export const appointmentsByDay = (appointments, days = 7, from = new Date()) => {
  const buckets = [];
  for (let i = 0; i < days; i += 1) {
    const day = addDays(from, i);
    const key = dateKey(day);
    buckets.push({
      key,
      label: shortDay(day),
      date: day,
      value: appointments.filter((a) => a.dateKey === key).length,
    });
  }
  return buckets;
};

export const countByService = (appointments) => {
  const map = new Map();
  appointments.forEach((a) => map.set(a.serviceName, (map.get(a.serviceName) || 0) + 1));
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const SERVICES = [
  'Teeth Orthodontics',
  'Cavity Protection',
  'Cosmetic Dentistry',
  'Teeth Cleaning',
  'Pediatric Dental',
  'Oral Surgery',
];
