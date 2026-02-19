/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'gov-blue': '#964B00',
        'gov-blue-mid': '#B8860B',
        'gov-border': '#d1d5db',
        'gov-bg': '#f3f4f6',
        'gov-text': '#111827',
        'gov-text-secondary': '#374151',
        'gov-muted': '#6b7280',
        'gov-success': '#1a7f37',
        'gov-warning': '#b45309',
        'gov-danger': '#b91c1c',
      },
      fontFamily: {
        sans: [
          '"Source Sans Pro"',
          '"Noto Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
