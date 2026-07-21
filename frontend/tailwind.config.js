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
        },
        indigo: {
          650: '#493fd8',
        },
        purple: {
          650: '#892be2',
        },
        rose: {
          650: '#ce1842',
          655: '#c7143e',
        },
        pink: {
          650: '#cc206c',
        },
        cyan: {
          650: '#0b82a0',
        },
        emerald: {
          650: '#058660',
        },
        green: {
          650: '#159042',
        },
        slate: {
          55: '#f5f8fa',
          105: '#ecf0f4',
          205: '#d9e2ec',
          250: '#d5dde6',
          405: '#8293a8',
          450: '#7c8ba1',
          455: '#78879b',
          550: '#556477',
          555: '#505f71',
          650: '#3c4a5e',
          655: '#384656',
          755: '#293548',
          850: '#172033',
          855: '#161f30',
          955: '#080d19',
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
