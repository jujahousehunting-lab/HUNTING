/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9ee',
          100: '#f9f0d2',
          200: '#f2dfa0',
          300: '#e9c963',
          400: '#dfb13a',
          500: '#c9a030',
          600: '#b8892a',
          700: '#9a6f21',
          800: '#7d5920',
          900: '#6a4a1e',
          950: '#3d2a0e',
        },
        charcoal: {
          50:  '#f4f4f4',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#666666',
          600: '#4f4f4f',
          700: '#3d3d3d',
          800: '#2d2d2d',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#f8f5ee',
          200: '#f0ebe0',
          300: '#e5dccb',
          400: '#d4c8b0',
          500: '#bfae93',
        },
      },
    },
  },
  plugins: [],
};
