const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true };

export const VolumeOn = () => (
  <svg {...base}>
    <path d="M3 9v6h4l5 4V5L7 9H3z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export const VolumeOff = () => (
  <svg {...base}>
    <path d="M3 9v6h4l5 4V5L7 9H3z" />
    <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export const MusicOn = () => (
  <svg {...base}>
    <path d="M9 3v11.5a3.5 3.5 0 1 0 2 3.2V8h7V3H9z" />
  </svg>
);

export const MusicOff = () => (
  <svg {...base}>
    <path d="M9 3v11.5a3.5 3.5 0 1 0 2 3.2V8h7V3H9z" />
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const BackIcon = () => (
  <svg {...base} fill="none">
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
