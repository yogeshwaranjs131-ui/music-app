/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1DB954',
        'spotify-black': '#121212',
        'spotify-gray': '#181818',
        'spotify-light-gray': '#282828',
        'spotify-subtext': '#b3b3b3',
      }
    },
  },
  plugins: [],
}