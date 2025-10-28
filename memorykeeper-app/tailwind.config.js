const withOpacity = (variable) => ({ opacityValue }) => {
  if (opacityValue !== undefined) {
    return `rgb(var(${variable}) / ${opacityValue})`;
  }
  return `rgb(var(${variable}))`;
};

const palette = {
  primary: withOpacity('--mk-color-primary'),
  'primary-strong': withOpacity('--mk-color-primary-strong'),
  'primary-muted': withOpacity('--mk-color-primary-muted'),
  accent: withOpacity('--mk-color-accent'),
  ink: withOpacity('--mk-color-ink'),
  'ink-muted': withOpacity('--mk-color-ink-muted'),
  surface: withOpacity('--mk-color-surface'),
  'surface-raised': withOpacity('--mk-color-surface-raised'),
  'surface-muted': withOpacity('--mk-color-surface-muted'),
  border: withOpacity('--mk-color-border'),
  success: withOpacity('--mk-color-success'),
  warning: withOpacity('--mk-color-warning'),
  danger: withOpacity('--mk-color-danger'),
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: palette,
      fontFamily: {
        display: ["'Nunito Variable'", 'Nunito', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', "'Nunito Variable'", 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0px 10px 45px rgba(27, 19, 8, 0.08)',
        subtle: '0px 8px 30px rgba(27, 19, 8, 0.05)',
        ring: '0px 0px 0px 1px rgba(27, 19, 8, 0.04), 0px 10px 35px rgba(27, 19, 8, 0.12)',
      },
      spacing: {
        gutter: 'clamp(1rem, 1.5vw, 1.75rem)',
        section: 'clamp(1.5rem, 2vw, 2.5rem)',
        card: 'clamp(1.25rem, 1.8vw, 2rem)',
      },
      fontSize: {
        'display-1': ['clamp(2.5rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        'display-2': ['clamp(2rem, 3vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'title-1': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'title-2': ['1.75rem', { lineHeight: '1.2' }],
      },
      backdropBlur: {
        soft: '10px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        'float-up': {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        'fade-slide': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'float-up': 'float-up 0.65s ease-out both',
        'fade-slide': 'fade-slide 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
