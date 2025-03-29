/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f9fc',
          100: '#d4f1f9',
          200: '#a9e2f3',
          300: '#7ed4ec',
          400: '#53c5e6',
          500: '#47b1cd', // Primary
          600: '#339cb8', // Primary hover
          700: '#297d94',
          800: '#1f5e70',
          900: '#143e4c',
        },
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}