/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jd-green': {
          DEFAULT: '#367C2B',
          50: '#f0f7ee',
          100: '#d9edcf',
          200: '#b4db9f',
          300: '#8ec96f',
          400: '#68b73f',
          500: '#4fa328',
          600: '#367C2B',
          700: '#2d6624',
          800: '#24501c',
          900: '#1a3a14',
        },
        'jd-yellow': {
          DEFAULT: '#FFDE00',
          50: '#fffde0',
          100: '#fffab3',
          200: '#fff580',
          300: '#ffef4d',
          400: '#ffe81a',
          500: '#FFDE00',
          600: '#e6c800',
          700: '#b39b00',
          800: '#806f00',
          900: '#4d4200',
        },
      },
    },
  },
  plugins: [],
}
