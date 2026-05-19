/**
 * Rocío Brand Token System
 * روسيِّو — Desert Dew Palette
 *
 * All design decisions flow from these tokens.
 * Import and use throughout the app instead of hardcoded values.
 */
export const BRAND = {
  name: {
    en: 'Rocío',
    ar: 'روسيِّو',
    tagline: {
      en: 'Pure. Delivered.',
      ar: 'نقاء. توصيل.',
    },
    subtitle: {
      en: 'Water Delivery',
      ar: 'توصيل المياه',
    },
  },

  /**
   * Desert Dew Color Palette
   *
   * Story: Deep ocean waters (trust) meeting desert warmth (Saudi identity)
   * in the freshness of morning dew (purity, Rocío's essence).
   */
  colors: {
    /* Primary — Rocío Blue: trust, depth, water */
    primary:      '#1245C5',
    primaryDark:  '#071952',
    primaryLight: '#4B73E6',

    /* Secondary — Desert Rose: energy, warmth, life */
    secondary:    '#D4186A',

    /* Accent — Morning Dew: freshness, aqua purity */
    aqua:         '#00B8D9',

    /* Highlight — Desert Sand: premium, Saudi warmth */
    gold:         '#F59E0B',

    /* Surfaces */
    surface:      '#F5F8FF', /* Pearl White — clean, pure         */
    mist:         '#EAF2FF', /* Dawn Mist   — soft card bg        */
    white:        '#FFFFFF',

    /* Text hierarchy */
    text: {
      primary:   '#0F172A',
      secondary: '#475569',
      muted:     '#94A3B8',
      inverse:   '#FFFFFF',
    },

    /* Status */
    success: '#10B981',
    warning: '#F59E0B',
    error:   '#EF4444',
    info:    '#00B8D9',
  },

  /** Pre-composed gradients */
  gradients: {
    splash:    'linear-gradient(160deg, #071952 0%, #1245C5 55%, #00B8D9 100%)',
    header:    'linear-gradient(135deg, #1245C5 0%, #071952 100%)',
    aqua:      'linear-gradient(135deg, #00B8D9 0%, #1245C5 100%)',
    secondary: 'linear-gradient(135deg, #D4186A 0%, #FF6B9D 100%)',
    card:      'linear-gradient(135deg, #F5F8FF 0%, #EAF2FF 100%)',
    gold:      'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
  },

  /** Typography */
  fonts: {
    arabic: 'Cairo, sans-serif',
    latin:  'Inter, sans-serif',
    system: 'system-ui, -apple-system, sans-serif',
  },

  /** Border radius scale */
  radius: {
    sm:   '0.375rem',  /* 6px  */
    md:   '0.75rem',   /* 12px */
    lg:   '1rem',      /* 16px */
    xl:   '1.25rem',   /* 20px */
    '2xl':'1.5rem',    /* 24px */
    '3xl':'2rem',      /* 32px */
    full: '9999px',
  },

  /** Shadows */
  shadows: {
    primary:   '0 10px 30px rgba(18, 69, 197, 0.30)',
    secondary: '0 10px 30px rgba(212, 24, 106, 0.30)',
    aqua:      '0 10px 30px rgba(0, 184, 217, 0.25)',
    card:      '0 4px 20px rgba(0, 0, 0, 0.08)',
    sm:        '0 2px 8px rgba(0, 0, 0, 0.08)',
  },

  /** Animation timings */
  animation: {
    fast:   '150ms',
    normal: '300ms',
    slow:   '500ms',
    splash: '800ms',
  },
} as const;

export type BrandColors   = typeof BRAND.colors;
export type BrandGradient = keyof typeof BRAND.gradients;
