/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F7FAF7',
          card: '#FFFFFF',
          primary: '#16845B',
          dark: '#105B40',
          secondary: '#38A169',
          light: '#E8F5EC',
          pale: '#F0F8F2',
          text: '#172B22',
          muted: '#64746B',
          border: '#E1EAE3',
          warning: '#E8A23A',
          error: '#DC5555',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(22, 132, 91, 0.05), 0 1px 2px -1px rgba(22, 132, 91, 0.05)',
        card: '0 4px 6px -1px rgba(23, 43, 34, 0.04), 0 2px 4px -2px rgba(23, 43, 34, 0.04)',
        hover: '0 10px 15px -3px rgba(22, 132, 91, 0.08), 0 4px 6px -4px rgba(22, 132, 91, 0.04)',
      }
    },
  },
  plugins: [],
}
