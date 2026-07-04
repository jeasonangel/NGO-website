// Validated categorical / sequential / status palette for charts.
// Values are the documented instance — see the dataviz skill's palette.md.
// Never hand-pick a new hex here; snap to these steps only.

export const categorical = {
  blue: '#2a78d6',
  aqua: '#1baf7a',
  yellow: '#eda100',
  green: '#008300',
  violet: '#4a3aa7',
  red: '#e34948',
  magenta: '#e87ba4',
  orange: '#eb6834',
};

// One-hue sequential ramp (blue), light -> dark, for magnitude encoding.
export const sequentialBlue = {
  100: '#cde2fb',
  150: '#b7d3f6',
  200: '#9ec5f4',
  250: '#86b6ef',
  300: '#6da7ec',
  350: '#5598e7',
  400: '#3987e5',
  450: '#2a78d6',
  500: '#256abf',
  550: '#1c5cab',
  600: '#184f95',
  650: '#104281',
  700: '#0d366b',
};

export const status = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export const ink = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
};

export const chrome = {
  surface: '#fcfcfb',
  page: '#f9f9f7',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
};
