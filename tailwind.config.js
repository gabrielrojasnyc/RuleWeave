/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New brand colors
        brand: {
          teal: {
            light: '#4FD1C5',
            DEFAULT: '#0B9E8E',
            dark: '#05746A'
          },
          coral: {
            light: '#FFA69E',
            DEFAULT: '#FF6B6B',
            dark: '#D84C4C'
          },
          mustard: {
            light: '#F9CB76',
            DEFAULT: '#F5A623',
            dark: '#D98800'
          },
          charcoal: {
            light: '#616E7C',
            DEFAULT: '#3E4C59',
            dark: '#2D3748'
          },
        },
        // New neutral palette
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, var(--brand-gradient-from), var(--brand-gradient-to))',
      }
    },
  },
  plugins: [],
}