/* ---------------------------------------------------------------------------
   Scheduling engine — dependency free.

   Everything the booking screen needs (weeks, month grids, per-doctor working
   hours, slot generation, collision with existing appointments, "next
   available") is plain JavaScript `Date` arithmetic. No date library, no
   calendar package: the whole calendar UI is built on the handful of pure
   functions below, which keeps the bundle small and the behaviour testable.
--------------------------------------------------------------------------- */

import { dateKey, addDays } from './demoApi';

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ------------------------------ time helpers ----------------------------- */

/** "09:30" → 570 */
export const toMinutes = (hhmm) => {
  if (typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** 570 → "09:30" */
export const fromMinutes = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** 570 → "9:30 AM" — used in the confirmation summary */
export const to12h = (hhmm) => {
  const mins = toMinutes(hhmm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const timeRange = (start, duration = 30) =>
  `${start} – ${fromMinutes(toMinutes(start) + duration)}`;

export const durationLabel = (mins = 30) => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} hour${h > 1 ? 's' : ''}`;
};

export const money = (amount, currency = '৳') =>
  `${currency}${Number(amount || 0).toLocaleString('en-US')}`;

/* ------------------------------ date helpers ----------------------------- */

export const startOfDay = (d) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const isSameDay = (a, b) => dateKey(a) === dateKey(b);

export const isToday = (d) => isSameDay(d, new Date());

export const isPastDay = (d) => startOfDay(d).getTime() < startOfDay(new Date()).getTime();

/** Monday-first week start, the way European booking products show it. */
export const startOfWeek = (d) => {
  const copy = startOfDay(d);
  const shift = (copy.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  copy.setDate(copy.getDate() - shift);
  return copy;
};

export const weekDates = (weekStart) =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

/** 6×7 grid of dates covering the month `d` belongs to (Monday first). */
export const monthMatrix = (d) => {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
};

export const monthLabel = (d) =>
  d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export const dayNumber = (d) => d.getDate();

export const weekdayShort = (d) => d.toLocaleDateString(undefined, { weekday: 'short' });

export const weekRangeLabel = (weekStart) => {
  const end = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const left = weekStart.toLocaleDateString(undefined, { day: 'numeric', month: sameMonth ? undefined : 'short' });
  const right = end.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return `${left} – ${right}`;
};

/* --------------------------------- doctors ------------------------------- */

const DEFAULT_HOURS = {
  sun: [['09:00', '13:00'], ['15:00', '18:00']],
  mon: [['09:00', '13:00'], ['15:00', '18:00']],
  tue: [['09:00', '13:00'], ['15:00', '18:00']],
  wed: [['09:00', '13:00'], ['15:00', '18:00']],
  thu: [['09:00', '13:00'], ['15:00', '18:00']],
  fri: [],
  sat: [['10:00', '14:00']],
};

/** Doctors added through the admin form have no rota yet — give them one. */
export const workingHoursOf = (doctor) => (doctor && doctor.workingHours) || DEFAULT_HOURS;

export const servicesOf = (doctor) => {
  if (doctor && Array.isArray(doctor.services) && doctor.services.length) return doctor.services;
  return [{ name: doctor?.speciality || 'Consultation', duration: doctor?.slotDuration || 30, price: 1500 }];
};

export const worksOn = (doctor, date) => {
  const ranges = workingHoursOf(doctor)[DAY_KEYS[date.getDay()]] || [];
  return ranges.length > 0;
};

/** Hours a doctor is open on a given day, e.g. "09:00–13:00 · 14:00–17:30" */
export const openingLabel = (doctor, date) => {
  const ranges = workingHoursOf(doctor)[DAY_KEYS[date.getDay()]] || [];
  if (!ranges.length) return 'Closed';
  return ranges.map(([a, b]) => `${a}–${b}`).join(' · ');
};

/* --------------------------------- slots --------------------------------- */

export const periodOf = (minutes) => {
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 17 * 60) return 'afternoon';
  return 'evening';
};

export const PERIODS = [
  { key: 'morning', label: 'Morning', hint: 'before 12:00' },
  { key: 'afternoon', label: 'Afternoon', hint: '12:00 – 17:00' },
  { key: 'evening', label: 'Evening', hint: 'after 17:00' },
];

/** Raw grid of slots a doctor offers on `date` for a service of `step` minutes. */
export const buildDaySlots = (doctor, date, step) => {
  const ranges = workingHoursOf(doctor)[DAY_KEYS[date.getDay()]] || [];
  const size = step || doctor?.slotDuration || 30;
  const out = [];
  ranges.forEach(([from, to]) => {
    const end = toMinutes(to);
    for (let m = toMinutes(from); m + size <= end; m += size) {
      out.push({
        start: m,
        end: m + size,
        time: fromMinutes(m),
        endTime: fromMinutes(m + size),
        period: periodOf(m),
      });
    }
  });
  return out;
};

const belongsTo = (appointment, doctor) =>
  (appointment.doctorId && doctor.id && appointment.doctorId === doctor.id) ||
  appointment.doctor === doctor.name;

/** Busy intervals for one doctor on one day, in minutes-from-midnight. */
export const busyIntervals = (doctor, date, appointments = []) => {
  const key = dateKey(date);
  return appointments
    .filter((a) => a.dateKey === key && belongsTo(a, doctor) && a.status !== 'Cancelled')
    .map((a) => {
      const start = toMinutes(a.startTime || '00:00');
      return { start, end: start + (Number(a.duration) || 30), row: a };
    })
    .filter((b) => b.end > b.start);
};

/**
 * Slots for a doctor on a day, annotated with `booked` (collides with an
 * existing appointment) and `past` (already gone by, today only).
 */
export const daySlots = (doctor, date, appointments = [], step) => {
  if (!doctor) return [];
  const busy = busyIntervals(doctor, date, appointments);
  const now = new Date();
  const today = isSameDay(date, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return buildDaySlots(doctor, date, step).map((slot) => ({
    ...slot,
    booked: busy.some((b) => slot.start < b.end && b.start < slot.end),
    past: today && slot.start <= nowMinutes,
  }));
};

export const openSlots = (slots) => slots.filter((s) => !s.booked && !s.past);

export const groupByPeriod = (slots) =>
  PERIODS.map((p) => ({ ...p, slots: slots.filter((s) => s.period === p.key) })).filter(
    (g) => g.slots.length > 0
  );

/** How many bookable slots a doctor has on `date` — drives the week strip. */
export const availabilityOn = (doctor, date, appointments, step) =>
  openSlots(daySlots(doctor, date, appointments, step)).length;

/**
 * First bookable slot from `from` onwards, scanning at most `horizon` days.
 * Returns `{ date, slot }` or null when the doctor has nothing coming up.
 */
export const nextAvailable = (doctor, appointments = [], step, from = new Date(), horizon = 30) => {
  for (let i = 0; i < horizon; i += 1) {
    const day = addDays(from, i);
    const free = openSlots(daySlots(doctor, day, appointments, step));
    if (free.length) return { date: day, slot: free[0] };
  }
  return null;
};

export const nextAvailableLabel = (next) => {
  if (!next) return 'No openings';
  const { date, slot } = next;
  if (isToday(date)) return `Today · ${slot.time}`;
  if (isSameDay(date, addDays(new Date(), 1))) return `Tomorrow · ${slot.time}`;
  return `${date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · ${slot.time}`;
};
