/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#A7C957',    // Soft Green
        secondary: '#89CFF0',  // Sky Blue
        background: '#F5F3E7', // Light Beige
        accent: '#FFCBA4',     // Peach
      },
      fontFamily: {
        sans: ['Calibri', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Roboto', 'Calibri', 'system-ui', 'sans-serif'],
      },
      scale: {
        '105': '1.05',
      },
    },
  },
  plugins: [],
};