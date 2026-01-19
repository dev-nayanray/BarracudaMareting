/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: {
          100: '#1A1A24',
          200: '#252532',
          300: '#3A3A4A',
        },
        text: {
          DEFAULT: '#FFFFFF',
          muted: 'rgba(255, 255, 255, 0.6)',
        },
        primary: {
          DEFAULT: '#D4AF37',
          500: '#D4AF37',
          400: '#E5C158',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          500: '#8B5CF6',
          400: '#A78BFA',
        },
        accent: {
          red: '#EF4444',
          green: '#22C55E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { 'box-shadow': '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        'float': {
          '0%, 100%': { 'transform': 'translateY(0)' },
          '50%': { 'transform': 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

