/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        youtube: {
          red: '#FF0000',
          darkRed: '#CC0000',
          lightRed: '#FF4D4D',
        },
        dark: {
          bg: '#0F0F0F',
          sidebar: '#0F0F0F',
          card: '#1F1F1F',
          hover: '#272727',
          border: '#3F3F3F',
          text: '#F1F1F1',
          muted: '#AAAAAA',
        },
        light: {
          bg: '#F9F9F9',
          sidebar: '#FFFFFF',
          card: '#FFFFFF',
          hover: '#F2F2F2',
          border: '#E5E5E5',
          text: '#0F0F0F',
          muted: '#606060',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
