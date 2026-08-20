# Changelog

## [3.0.1] — 2026-08-20 — Dashboard calendar was invisible
### Fixed
- The clinic console renders `<MiniMonth dark />`, which adds `.is-dark`, but **no dark
  rules had ever been written** — the day numbers kept `color: var(--ink)` (near-black) on
  a near-black panel, so the whole grid was unreadable. Added the full dark variant:
  day numbers, weekday heads, hover, today ring, selected day, availability dots, the
  ‹ › buttons (they were white pills) and the footer links.
- Those footer links also ran together as "TodayNext week"; the footer is now a flex row
  with a gap.

## [3.0.0] — 2026-08-14 — Real Firebase authentication, real roles
### Added
- **Firebase Auth is live** (project `doctors-portal-2b809`). Config lives in `.env`
  (gitignored, inlined at build time). Random credentials are rejected — the demo bypass
  where any email+password worked is gone.
- **Patients are no longer administrators.** A new registration comes back as *Patient*
  with no Messages / Make admin / Add doctor links. The admin flag comes from
  `GET /users/:email` when the API is up, otherwise from `REACT_APP_ADMIN_EMAILS`.
- `friendlyAuthError()` — "Wrong email or password." instead of
  `Firebase: Error (auth/user-not-found)`.
- `.env` also carries `REACT_APP_STRIPE_PK` (empty until the test key is added).

## [2.2.0] — 2026-08-14 — Eight fixes from the audit
### Added
- **Stripe payments** (`src/Pages/DashBoard/Payment/Payment.js`): a Pay button on every
  unpaid upcoming appointment opens a payment page using **Stripe Elements** — card data
  goes straight to Stripe's iframe, never through this code. Test mode. Without
  `REACT_APP_STRIPE_PK` the page shows **no card fields at all**, just an explanation and
  a "record as paid at the desk" action, rather than faking a card form.
- **Front-desk inbox** (`DashBoard/Messages`), admin-only: contact enquiries with reply
  (pre-filled email + marks the record replied) and delete.
- **Forgot password** on the login page (identical confirmation whether or not the address
  exists, so it can't be used to discover accounts).
- `src/api/config.js` — one place for the API base **and** the clinic's identity.
### Fixed
- **The contact form discarded every message.** `submit()` only flipped a flag; nothing
  was stored anywhere. Messages now reach the API, or localStorage when it is down.
- **Phone accepted letters** — "abcdefgh" booked an appointment. Rejected now, with the
  minimum/maximum digit checks, alongside validation for every other field.
- **Pages opened scrolled halfway down** — added `components/ScrollToTop.js`.
- **Booking collected only name, email and phone.** It now takes date of birth, address,
  insurance type/insurer/number, first-visit and reason for the visit.
- Hardcoded `localhost:5000` in 5 places → `API_BASE`.
- Placeholder Dhaka identity and ৳ prices → Frankfurt clinic and euro fees.

## [2.1.0] — 2026-08-06 — Doctolib-style scheduling
### Added
- **Complete rebuild of the booking experience** (`src/Pages/Appointment/`):
  - `DoctorRail` — searchable, specialty-filterable doctor cards with avatar, rating,
    review count, years of experience and a live "next available" badge (or "On leave").
  - `WeekStrip` — 7-day strip with ‹ › week navigation, Today, per-day slot counts,
    Full / past-day states, plus a `MiniMonth` popover for jumping to any date.
  - `SlotBoard` — real time slots grouped into Morning / Afternoon / Evening, generated
    from each doctor's working hours minus already-booked appointments; booked slots are
    struck through and disabled; skeleton shimmer while loading; availability legend.
  - Reason-for-visit chips carrying duration and price.
  - `SummaryPanel` — sticky booking summary (doctor, date, time, reason, room, total).
  - `BookingModal` — confirmation dialog and an animated success state.
  - `MyAppointments` — patient's upcoming visits; new bookings appear instantly here
    and in the admin appointment tables.
- `src/api/schedule.js` — slot generation/availability logic (plain `Date`, no new deps).
- Richer seed data in `public/doctors.json` (working hours, slot duration, services,
  prices, ratings) and `public/appointments.json`.
- Full scheduler stylesheet in `src/index.css` (`.sch-*`), responsive to 390px with a
  horizontally scrolling day strip, and `prefers-reduced-motion` support.
### Verified
- Live: 6 doctors, 7-day strip, real slots, slot → modal → confirm all working,
  **0 page/console errors**, no horizontal overflow on mobile.

## [2.0.0] — 2026-08-05 — Full overhaul & relaunch
### Added
- **Demo mode**: works with no backend or Firebase keys — guarded dual-mode auth,
  `src/api/demoApi.js` with seed JSON + localStorage persistence (booking, add-doctor
  and make-admin are real writes). HTTPS skips the localhost call entirely.
- **Rebuilt admin console**: glass sidebar + mobile drawer, live search, KPI cards with
  count-ups and 3D tilt, self-drawing SVG area chart, animated service bars, sticky-header
  tables with status pills, scroll reveals, `prefers-reduced-motion` support.
  New Appointments and Doctors pages.
- 3D mouse-tilt "live clinic" section, testimonials, CTA banner, working contact form.
- `public/vercel.json` SPA rewrites; seed data in `public/`.
### Changed
- Complete public UI redesign (indigo/violet design system, Plus Jakarta Sans):
  new nav with mobile menu, gradient hero, service cards, auth cards, footer.
- Dropped MUI everywhere except the date picker; booking modal is now custom.
- Responsive down to 390px.
### Fixed
- Blank render / `auth/invalid-api-key` when Firebase env vars are absent.
- Dead `morning-cliffs-43827.herokuapp.com` API origin.
- Deep links 404'ing on static hosting.
### Verified
- 18/18 automated checks against the live URL: 0 page errors, 0 console errors,
  0 failed requests; booking→dashboard, add-doctor, make-admin, search, logout,
  and mobile layouts all pass.
### Deployed
- https://doctors-portal-farhana.vercel.app

## [1.0.0] — 2021-11
- Original MERN + MUI course project: appointments, Firebase auth, Stripe, admin.
