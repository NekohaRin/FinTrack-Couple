/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F472B6',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#FDE8F0',
          foreground: '#4A2040',
        },
        accent: {
          DEFAULT: '#FBBF24',
          foreground: '#4A2040',
        },
        background: '#FFF5F9',
        foreground: '#4A2040',
        muted: {
          DEFAULT: '#f5e6ef',
          foreground: '#9d6b8a',
        },
        border: '#f0d5e5',
        destructive: {
          DEFAULT: '#FDA4AF',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        script: ['Dancing Script', 'cursive'],
        sans: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}