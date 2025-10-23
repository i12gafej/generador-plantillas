/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1115',
          panel: '#12151c',
          card: '#0b0d12',
          border: '#1f2937',
          hover: '#1a1f2a',
        },
        primary: {
          DEFAULT: '#2b6cb0',
          hover: '#2c7bd6',
          disabled: '#3d5673',
        }
      }
    },
  },
  plugins: [],
}

