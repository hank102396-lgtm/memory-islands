/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Noto Serif TC"', 'serif'],
      },
      colors: {
        night: '#101b3d',
        ink: '#14213d',
      },
      boxShadow: {
        glow: '0 0 35px rgba(255, 229, 137, 0.34)',
      },
    },
  },
  plugins: [],
}
