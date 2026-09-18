/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#d93850',
          darkred: '#b8273d',
          charcoal: '#333333',
          dark: '#1a1a1a',
          gold: '#f6d274',
          bg: '#f4f6f8',
          border: '#e0e0e0',
          borderdark: '#cccccc',
        },
      },
      fontFamily: {
        dosis: ['Dosis', 'sans-serif'],
      },
    },
  },
  plugins: [],
};