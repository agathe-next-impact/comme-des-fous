/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  darkMode: "class", // <-- ceci est OBLIGATOIRE pour le mode dark via la classe
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"new-astro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
