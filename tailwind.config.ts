import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0078D4',
          hover:   '#106EBE',
          active:  '#005A9E',
        },
        recording: '#C42B1C',
        success:   '#107C10',
        warning:   '#797673',
        error:     '#C42B1C',
        surface: {
          DEFAULT:  '#FFFFFF',
          elevated: '#FAFAFA',
        },
        border:     '#E0E0E0',
        muted:      '#6B6B6B',
      },
      fontFamily: {
        sans: ['Segoe UI Variable', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Cascadia Code', 'Consolas', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.6875rem', { lineHeight: '1.5' }],
        'sm':   ['0.75rem',   { lineHeight: '1.5' }],
        'base': ['0.875rem',  { lineHeight: '1.5' }],
        'lg':   ['1rem',      { lineHeight: '1.4' }],
        'xl':   ['1.125rem',  { lineHeight: '1.3' }],
        '2xl':  ['1.25rem',   { lineHeight: '1.2' }],
      },
      spacing: {
        '1':  '4px',  '2':  '8px',  '3':  '12px', '4': '16px',
        '5': '20px',  '6': '24px',  '8': '32px',  '10': '40px', '12': '48px',
      },
      borderRadius: {
        sm: '4px', md: '6px', lg: '8px',
      },
      boxShadow: {
        panel: '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config
