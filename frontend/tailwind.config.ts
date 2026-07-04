/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — deep teal (health/growth) with a warm amber accent
        'ngo-primary': '#0f7a5f',
        'ngo-primary-dark': '#0b5c47',
        'ngo-primary-light': '#e6f5f1',
        'ngo-accent': '#f0a020',
        'ngo-accent-dark': '#c97f0f',
        // Shared ink/surface tokens (also used by chart components)
        ink: {
          primary: '#0b0b0b',
          secondary: '#52514e',
          muted: '#898781',
        },
        surface: {
          page: '#f9f9f7',
          card: '#fcfcfb',
        },
        line: {
          hairline: '#e1e0d9',
          baseline: '#c3c2b7',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};