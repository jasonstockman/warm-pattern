/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sepia-darkest': '#2B2718',
        'sepia-darker': '#474030',
        'sepia-dark': '#695F4D',
        'sepia': '#BFB4A3',
        'sepia-light': '#F0EBE4',
        'sepia-lighter': '#F7F5F2',
        'sepia-lightest': '#FCFBFA',
      }
    },
  },
  plugins: [],
} 