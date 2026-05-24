/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        dasher: {
          dark: '#111827',     // Dark slate sidebar
          darker: '#0b0f19',   // Darkest background
          card: '#ffffff',     // Card surface
          bg: '#f3f4f6',       // Premium light background
          accent: '#4f46e5',   // Indigo
          indigo: '#4f46e5',
          purple: '#7c3aed',
          blue: '#2563eb',
          cyan: '#0891b2',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      boxShadow: {
        'saas': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 30px -5px rgba(79, 70, 229, 0.1)',
        'sidebar-active': '0 8px 16px -2px rgba(79, 70, 229, 0.4)'
      },
      fontFamily: {
        sans: ['DM Sans', 'Jost', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
