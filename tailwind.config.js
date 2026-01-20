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
        alexBrush: ['Alex Brush', 'cursive'],
        averia: ['Averia Sans Libre', 'sans-serif'],
        belanosima: ['Belanosima', 'sans-serif'],
        bellefair: ['Bellefair', 'serif'],
        capriola: ['Capriola', 'sans-serif'],
        comfortaa: ['Comfortaa', 'cursive'],
        crimson: ['Crimson Text', 'serif'],
        fredoka: ['Fredoka', 'sans-serif'],
        luckiest: ['Luckiest Guy', 'cursive'],
        mitr: ['Mitr', 'sans-serif'],
        nationalPark: ['National Park', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        passionOne: ['Passion One', 'cursive'],
        poiretOne: ['Poiret One', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        redHat: ['Red Hat Display', 'sans-serif'],
        titanOne: ['Titan One', 'cursive'],
        urbanist: ['Urbanist', 'sans-serif'],
        youngSerif: ['Young Serif', 'serif'],
      },
    },
  },
  plugins: [  
    require('@tailwindcss/typography'),
  ],
};
