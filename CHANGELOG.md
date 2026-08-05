# Changelog

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
