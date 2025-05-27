
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.html",
    "./scripts/**/*.js",
    "./script.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'hindi': ['Noto Sans Devanagari', 'sans-serif'],
        'gujarati': ['Noto Sans Gujarati', 'sans-serif'],
        'english': ['Inter', 'sans-serif'],
      },
      colors: {
        'saffron': {
          500: '#FF6600',
          600: '#E55A00',
          700: '#CC5200',
        }
      }
    },
  },
  plugins: [],
}
