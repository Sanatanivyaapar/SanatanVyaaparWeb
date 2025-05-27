
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
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        'dharmic': {
          orange: '#ff6b35',
          gold: '#ffcc02',
          red: '#dc2626',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
