/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#F7F4EE',
          card: '#FFFFFF',
          dark: '#20201D',
          olive: '#59624A',
          'olive-light': '#78805E',
          amber: '#D8893D',
          'amber-hover': '#C0752C',
          beige: '#E9E1D3',
          border: '#E2DACB',
          muted: '#6B685F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
