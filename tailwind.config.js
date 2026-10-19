/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#07080a',
          900: '#0c0e12',
          800: '#14171f',
          700: '#1f2430',
        },
        signblue: {
          500: '#0057b8',
          400: '#1d7dfa',
          600: '#00428f',
        },
        signal: {
          amber: '#f59e0b',
          red: '#ef4444',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Noto Serif TC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
