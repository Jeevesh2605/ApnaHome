/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F3',
        amber: { DEFAULT: '#F5C518', dark: '#E0B000' },
        brown: { DEFAULT: '#1C1917', light: '#44403C', muted: '#78716C' },
        card: '#FFFFFF',
        border: '#E8E2D9',
        green: { DEFAULT: '#22C55E', light: '#4ADE80', dark: '#16A34A' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
    },
  },
  plugins: [],
}
