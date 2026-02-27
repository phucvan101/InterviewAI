/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0edff',
          100: '#e0d9ff',
          200: '#c4b5fd',
          300: '#a78bfa',
          400: '#8b5cf6',
          500: '#6d43f5',
          600: '#5b21b6',
          700: '#4c1d95',
          800: '#3b0d7a',
          900: '#2e0463',
          950: '#1a0040',
        },
        navy: {
          50:  '#eef1fb',
          100: '#dde3f7',
          200: '#bbc7ef',
          300: '#8fa2e0',
          400: '#6175cc',
          500: '#3d54b8',
          600: '#2d3f9a',
          700: '#1e2d7c',
          800: '#111c5a',
          900: '#0c1445',
          950: '#080d2e',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
        display: ['"SVN-Gilroy"', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(109,67,245,0.35) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(45,63,154,0.2) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}
