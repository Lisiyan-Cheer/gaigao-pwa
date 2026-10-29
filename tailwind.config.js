/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fcfbfa',
          100: '#f7f6f2',
          200: '#edece6',
          300: '#dedcd3',
          800: '#232529',
          900: '#191a1d',
          950: '#111215',
        },
        coral: {
          500: '#f97316',
          600: '#ea580c',
        }
      },
      fontFamily: {
        serif: [
          '"Songti SC"',
          '"Source Han Serif SC"',
          '"Noto Serif CJK SC"',
          'STSong',
          'Georgia',
          'serif',
        ],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
