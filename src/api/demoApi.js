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

const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const canReachApi = () => {
  if (typeof window === 'undefined') return false;
  if (window.location.protocol === 'https:' && API.startsWith('http://')) return false;
  return true;
};

const LS = {
  appointments: 'dp_appointments',
  doctors: 'dp_doctors',
  admins: 'dp_admins',
  seeded: 'dp_seeded_v1',
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

/** Seeds localStorage once from /appointments.json, anchoring the sample data
 *  to the current week so the dashboard always has something to show. */
const seedAppointments = async () => {
  if (read(LS.seeded, false) && read(LS.appointments, null)) return read(LS.appointments, []);
  const seed = await loadSeed('appointments.json');
  const today = new Date();
  const rows = seed.map((row) => {
    const when = addDays(today, row.dayOffset || 0);
    return {
      _id: row.id,
      patientName: row.patientName,
      email: row.email,
      phone: row.phone,
      time: row.time,
      serviceName: row.serviceName,
      doctor: row.doctor,
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

export const getAppointments = async ({ email, token } = {}) => {
  const remote = await softFetch(
    `${API}/appointments${email ? `?email=${encodeURIComponent(email)}` : ''}`,
    token ? { headers: { authorization: `Bearer ${token}` } } : undefined
  );
  if (Array.isArray(remote) && remote.length) return remote;
  return seedAppointments();
};

export const createAppointment = async (appointment) => {
  const payload = {
    ...appointment,
    _id: `local-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  const remote = await softFetch(`${API}/appointments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
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

export const createDoctor = async (doctor) => {
  await softFetch(`${API}/doctors`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
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
  const record = {
    id: `local-${Date.now()}`,
    status: 'Active',
    rating: 5,
    patients: 0,
    experience: Number(doctor.experience) || 1,
    tone: tones[current.length % tones.length],
    ...doctor,
    initials: initials || 'DR',
  };
  const next = [record, ...current];
  write(LS.doctors, next);
  return record;
};

/* --------------------------------- users --------------------------------- */

export const getUsers = async () => {
  const remote = await softFetch(`${API}/users`);
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
