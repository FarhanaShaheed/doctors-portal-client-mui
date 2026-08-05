import React from 'react';

/* Inline stroke icons — no icon package, no network requests, themable by
   `currentColor`, and they keep the bundle small. */
const base = (props) => ({
  width: props.size || 20,
  height: props.size || 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: props.weight || 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
});

export const IconTooth = (p) => (
  <svg {...base(p)}>
    <path d="M12 5.5c-1.6-1.2-3.2-1.7-4.6-1.2C5.6 4.9 4.8 6.7 5 9c.2 2 .7 3.4 1.2 5.5.4 1.7.4 4.5 1.9 4.5 1.3 0 1.4-1.9 1.8-3.5.3-1.3.7-2.3 2.1-2.3s1.8 1 2.1 2.3c.4 1.6.5 3.5 1.8 3.5 1.5 0 1.5-2.8 1.9-4.5.5-2.1 1-3.5 1.2-5.5.2-2.3-.6-4.1-2.4-4.7-1.4-.5-3 0-4.6 1.2Z" />
  </svg>
);

export const IconShield = (p) => (
  <svg {...base(p)}><path d="M12 3l7 3v6c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);

export const IconSparkle = (p) => (
  <svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>
);

export const IconCalendar = (p) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
);

export const IconClock = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

export const IconUsers = (p) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><path d="M16 5.3a3.2 3.2 0 0 1 0 6.2M18 20c0-2.4-.8-4.2-2.2-5.2" /></svg>
);

export const IconStethoscope = (p) => (
  <svg {...base(p)}><path d="M6 3v5a4 4 0 0 0 8 0V3" /><path d="M4 3h3M13 3h3" /><path d="M10 12v2a5 5 0 0 0 5 5 4 4 0 0 0 4-4v-2" /><circle cx="19" cy="11" r="2" /></svg>
);

export const IconGrid = (p) => (
  <svg {...base(p)}><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>
);

export const IconShieldUser = (p) => (
  <svg {...base(p)}><path d="M12 3l7 3v6c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V6l7-3Z" /><circle cx="12" cy="10.5" r="2.2" /><path d="M8.4 16.5c.6-1.6 2-2.4 3.6-2.4s3 .8 3.6 2.4" /></svg>
);

export const IconPlus = (p) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconSearch = (p) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>);
export const IconMenu = (p) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconLogout = (p) => (<svg {...base(p)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 8 6 12l4 4M6 12h10" /></svg>);
export const IconArrow = (p) => (<svg {...base(p)}><path d="M5 12h13M13 6l6 6-6 6" /></svg>);
export const IconCheck = (p) => (<svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7" /></svg>);
export const IconPhone = (p) => (<svg {...base(p)}><path d="M6 3h3l1.6 4-2 1.4a12 12 0 0 0 5 5L15 11.4 19 13v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 5.2 2 2 0 0 1 6 3Z" /></svg>);
export const IconMail = (p) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>);
export const IconPin = (p) => (<svg {...base(p)}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>);
export const IconTrend = (p) => (<svg {...base(p)}><path d="M4 17 10 11l4 4 6-7" /><path d="M15 8h5v5" /></svg>);
export const IconInbox = (p) => (<svg {...base(p)}><path d="M4 13h4l1.5 3h5L16 13h4" /><path d="M5 5h14l1.5 8v4a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-4L5 5Z" /></svg>);
export const IconGoogle = (p) => (
  <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" aria-hidden focusable="false">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.4-.18-2.05H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.75 3-4.33 3-7.35Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.6-2.43l-3.2-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.8-1.75-5.6-4.1H3.1v2.58A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.83V7.5H3.1a10 10 0 0 0 0 9l3.3-2.58Z" />
    <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.84-2.84C16.95 2.99 14.7 2 12 2A10 10 0 0 0 3.1 7.5l3.3 2.59C7.2 7.73 9.4 5.98 12 5.98Z" />
  </svg>
);
