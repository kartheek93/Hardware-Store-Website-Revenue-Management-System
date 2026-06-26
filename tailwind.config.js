/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // --- Semantic tokens (shadcn-style) ---
        background: '#FAFAF8', // off-white canvas
        foreground: '#1F1E1C', // near-black warm gray text (never pure #000)
        card: '#FFFFFF',
        'card-foreground': '#1F1E1C',
        popover: '#FFFFFF',
        'popover-foreground': '#1F1E1C',
        border: '#E7E5E0',
        input: '#E7E5E0',
        ring: '#D85A30',
        muted: '#F1F0EC',
        'muted-foreground': '#6B6A65',

        // --- Brand: primary (deep orange — earthy hardware feel) ---
        primary: {
          DEFAULT: '#D85A30',
          foreground: '#FFFFFF',
          50: '#FBF1EC',
          100: '#F6DECF',
          200: '#EDBA9F',
          300: '#E4956F',
          400: '#DE7750',
          500: '#D85A30',
          600: '#B8481F',
          700: '#943A19',
          800: '#702C13',
          900: '#4D1E0D',
        },

        // --- Secondary: slate gray ---
        secondary: {
          DEFAULT: '#5F5E5A',
          foreground: '#FFFFFF',
          50: '#F4F4F3',
          100: '#E7E7E5',
          200: '#CCCBC8',
          300: '#A9A8A3',
          400: '#84837E',
          500: '#5F5E5A',
          600: '#4C4B48',
          700: '#3A3937',
          800: '#282725',
          900: '#1A1A18',
        },

        // --- Accent: warm amber ---
        accent: {
          DEFAULT: '#BA7517',
          foreground: '#FFFFFF',
          50: '#FAF2E5',
          100: '#F2DFBE',
          200: '#E5BE7C',
          300: '#D89E3B',
          400: '#C98722',
          500: '#BA7517',
          600: '#965E12',
          700: '#71470E',
          800: '#4D3009',
          900: '#281905',
        },

        // --- Status colors (used in badges, alerts, KPIs) ---
        success: {
          DEFAULT: '#2E7D52',
          foreground: '#FFFFFF',
          bg: '#E7F4EC',
          border: '#BFE3CD',
        },
        warning: {
          DEFAULT: '#B7791F',
          foreground: '#FFFFFF',
          bg: '#FBF1DA',
          border: '#F3DCA6',
        },
        danger: {
          DEFAULT: '#C0392B',
          foreground: '#FFFFFF',
          bg: '#FBE9E7',
          border: '#F2C6C0',
        },
      },
      spacing: {
        // Half-step + custom sizes used for icons and buttons across the app.
        4.5: '1.125rem', // 18px
        5.5: '1.375rem', // 22px
        13: '3.25rem', // 52px
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Constrained type scale (12 / 14 / 16 / 20 / 24 / 32 / 48)
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.6rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.4rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.9rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        // Soft, layered elevation — subtle reads as premium
        xs: '0 1px 2px 0 rgb(31 30 28 / 0.05)',
        sm: '0 1px 3px 0 rgb(31 30 28 / 0.08), 0 1px 2px -1px rgb(31 30 28 / 0.06)',
        md: '0 4px 12px -2px rgb(31 30 28 / 0.08), 0 2px 6px -2px rgb(31 30 28 / 0.05)',
        lg: '0 12px 28px -6px rgb(31 30 28 / 0.12), 0 4px 10px -4px rgb(31 30 28 / 0.06)',
        card: '0 1px 3px 0 rgb(31 30 28 / 0.06), 0 1px 2px -1px rgb(31 30 28 / 0.04)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}
