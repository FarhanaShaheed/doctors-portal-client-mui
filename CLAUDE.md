# Doctors Portal — project guide (for Claude & future me)

React (CRA) **medical appointment platform**: browse services, pick a date, book a
slot, and manage the clinic from an admin console. Portfolio project of
Farhana Binta Shaheed → linked from her CV.

- **Live:** https://doctors-portal-farhana.vercel.app
- **Client repo:** github.com/FarhanaShaheed/doctors-portal-client-mui (this repo)
- **Server repo:** github.com/FarhanaShaheed/doctors-portal-server

## Stack
React 17 (CRA) · react-router-dom v5 · Firebase Auth · MUI (now only the date picker) ·
Express + MongoDB + Stripe (separate repo) · deployed on Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local      # optional: real Firebase web config
NODE_OPTIONS=--openssl-legacy-provider npm start
```

## ⭐ Demo mode (why the live site works with no backend)
- `src/Pages/Login/Firebase/firebase.config.js` exports `isFirebaseConfigured`;
  `firebase.init.js` refuses to call `initializeApp` without keys.
- `src/hooks/useFirebase.js` is **dual mode** — every `getAuth()`/`onAuthStateChanged`/
  `signOut` is guarded and the auth observer returns early when `auth` is null.
  With no keys: any email+password signs in, the session persists in localStorage,
  and the demo user is an **admin**. The returned API shape is unchanged (+ a `demoMode` flag).
- `src/api/demoApi.js` tries the real `localhost:5000` REST calls first, then falls back
  to seed JSON in `public/` (`doctors.json`, `appointments.json`, `users.json`, dated
  relative to today) and persists writes to localStorage. **Over HTTPS it skips the
  localhost call entirely**, so the production console stays clean.
- Booking, Add Doctor and Make Admin are real, persisted writes in demo mode.
- `public/vercel.json` provides SPA rewrites.

**To go real:** set `REACT_APP_FIREBASE_*` env vars (and `REACT_APP_API_BASE` for a hosted
API) and redeploy — the code switches over automatically, no edits needed.

## Scheduling system (the centrepiece)
`src/Pages/Appointment/` + `src/api/schedule.js`. Doctor rail (search + specialty filter,
"next available" badges) → week strip (‹ › navigation, per-day slot counts, Full/past
states, MiniMonth popover) → slot board (Morning/Afternoon/Evening groups, booked slots
struck through, skeleton shimmer) → reason chips (duration + price) → sticky summary →
confirmation modal → success. Slots are generated from each doctor's `workingHours` /
`slotDuration` in `public/doctors.json` minus existing bookings; new bookings persist via
`demoApi` and show up in `MyAppointments` and the admin tables. Styles are the `.sch-*`
block at the end of `src/index.css`. No extra npm dependencies — plain `Date` maths.

## Design system
Indigo/violet palette in `src/index.css`, imported **last** in `src/index.js` (after the
now-blanked `App.css`); `Plus Jakarta Sans` via `public/index.html`.
- Public: nav with mobile menu, gradient hero with floating chips, service cards,
  feature row, a mouse-tilt **3D "live clinic" section**, CTA banner, testimonials,
  contact form, footer, centered auth cards with a demo-mode notice.
- **Admin console:** glass sidebar (mobile drawer), top bar with live search,
  KPI cards with count-ups + cursor-tracked 3D tilt, a dependency-free SVG area chart
  that draws itself via `stroke-dashoffset`, animated service bars, sticky-header tables
  with status pills and empty states, IntersectionObserver scroll reveals,
  full `prefers-reduced-motion` support. Pages: Appointments, Doctors.
- MUI was removed everywhere except the date picker; the booking modal is custom.
- Responsive down to 390px.

## Deploy (order matters)
`react-scripts build` wipes `build/.vercel`, so:
```bash
NODE_OPTIONS=--openssl-legacy-provider npx react-scripts build
cd build && npx vercel link --yes --project doctors-portal --scope <scope> --token=<token>
rm -f .env.local .gitignore      # created by `vercel link`
npx vercel deploy --prod --yes --scope <scope> --token=<token>
```
Project must have `framework:null` and `ssoProtection:null`.
