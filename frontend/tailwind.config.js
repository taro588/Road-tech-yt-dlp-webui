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
          50: '#e6f4ff',
          100: '#b3dfff',
          200: '#80c9ff',
          300: '#4db3ff',
          400: '#1a9dff',
          500: '#0088e6',
          600: '#006bb3',
          700: '#004d80',
          800: '#002f4d',
          900: '#1e3a5f',
        },
        accent: {
          50: '#e6faff',
          100: '#b3f0ff',
          200: '#80e6ff',
          300: '#4ddcff',
          400: '#1ad2ff',
          500: '#00d4ff',
          600: '#00a8cc',
          700: '#007a99',
          800: '#004d66',
          900: '#001f33',
        },
      },
    },
  },
  plugins: [],
}
