/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00', // 포인트 주황색
          light: '#FF8C38',
          dark: '#E05A00',
        },
        secondary: {
          DEFAULT: '#121212', // 메인 검정색
          light: '#2A2A2A',
          dark: '#000000',
        },
        neutral: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#D4D4D4',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 