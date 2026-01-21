/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Utilisation de la classe .dark
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Averia Sans Libre',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        averia: ['Averia Sans Libre', 'sans-serif'],
        belanosima: ['Belanosima', 'sans-serif'],
      },
    },
  },
  plugins: [  
    require('@tailwindcss/typography'),
  ],
};
