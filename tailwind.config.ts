import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        theo: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          'surface-2': 'var(--surface-2)',
          border: 'var(--border)',
          ink: 'var(--ink)',
          'ink-soft': 'var(--ink-soft)',
          muted: 'var(--muted)',
          purple: 'var(--purple)',
          'purple-soft': 'var(--purple-soft)',
          pink: 'var(--pink)',
          yellow: 'var(--yellow)',
          good: 'var(--good)',
          'good-bg': 'var(--good-bg)',
          warn: 'var(--warn)',
          'warn-bg': 'var(--warn-bg)',
          chip: 'var(--chip-bg)',
        },
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['var(--font-bricolage)', 'Bricolage Grotesque', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        theo: 'var(--shadow)',
      },
    },
  },
  plugins: [],
}
export default config
