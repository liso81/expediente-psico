/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F6F5F1',
        ink: '#1E2A28',
        primary: {
          DEFAULT: '#2F6E63',
          dark: '#1F4E46',
          light: '#E4EEEC',
        },
        clay: {
          DEFAULT: '#B5834D',
          light: '#F1E4D2',
        },
        line: '#D9D4C8',
        surface: '#FFFFFF',
        privado: {
          DEFAULT: '#7A4F6B',
          light: '#F2E6EE',
        },
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
