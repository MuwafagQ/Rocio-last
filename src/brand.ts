export const BRAND = {
  name: {
    en: 'Rocío',
    ar: 'روسيِّو',
    tagline: { en: 'Pure. Delivered.', ar: 'نقاء. توصيل.' },
  },
  colors: {
    primary:      '#1245C5',
    primaryDark:  '#071952',
    primaryLight: '#4B73E6',
    secondary:    '#D4186A',
    aqua:         '#00B8D9',
    gold:         '#F59E0B',
    surface:      '#F5F8FF',
    mist:         '#EAF2FF',
    text: {
      primary:   '#0F172A',
      secondary: '#475569',
      muted:     '#94A3B8',
      inverse:   '#FFFFFF',
    },
  },
  gradients: {
    splash:  'linear-gradient(160deg, #071952 0%, #1245C5 55%, #00B8D9 100%)',
    mark:    'linear-gradient(135deg, #1B55D4 0%, #071952 100%)',
    header:  'linear-gradient(135deg, #1245C5 0%, #071952 100%)',
    surface: 'linear-gradient(180deg, #F5F8FF 0%, #EAF2FF 100%)',
  },
  fonts: {
    arabic: "'Cairo', sans-serif",
    latin:  "'Inter', sans-serif",
  },
  radius: {
    sm:   '8px',
    md:   '12px',
    lg:   '16px',
    xl:   '22px',
    mark: '22px',
  },
  shadows: {
    card:   '0 2px 8px rgba(0,0,0,0.06)',
    mark:   '0 8px 24px rgba(18,69,197,0.35)',
    splash: '0 32px 64px rgba(7,25,82,0.40)',
  },
  animation: {
    splash: 'dropFall 0.6s ease-out both',
  },
} as const;

export type BrandColors   = typeof BRAND.colors;
export type BrandGradient = keyof typeof BRAND.gradients;
