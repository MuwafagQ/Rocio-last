import React from 'react';

interface RocioLogoProps {
  size?:      number;
  variant?:   'mark' | 'wordmark' | 'full';
  theme?:     'color' | 'dark' | 'light';
  showArabic?: boolean;
}

const RocioLogo: React.FC<RocioLogoProps> = ({
  size       = 48,
  variant    = 'full',
  theme      = 'color',
  showArabic = true,
}) => {
  const h = Math.round(size * 1.25);

  const bgFill =
    theme === 'color' ? 'url(#rocioGrad)' :
    theme === 'dark'  ? 'rgba(255,255,255,0.08)' :
                        '#1245C5';

  const wordColor   = theme === 'light' ? '#1245C5'           : 'white';
  const arabicColor = theme === 'light' ? '#94A3B8'           : 'rgba(255,255,255,0.55)';

  const mark = (
    <svg width={size} height={h} viewBox="0 0 100 125" fill="none">
      <rect x="4" y="4" width="92" height="92" rx="22" fill={bgFill} />
      <g stroke="white" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="10">
        <line x1="33" y1="23" x2="33" y2="77" />
        <path d="M33 23 C55 23,68 30,68 44 C68 58,55 58,33 58" />
        <line x1="50" y1="58" x2="70" y2="77" />
      </g>
      <defs>
        <linearGradient id="rocioGrad" x1="4" y1="4" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1B55D4" />
          <stop offset="100%" stopColor="#071952" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (variant === 'mark') return mark;

  const wordmark = (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <span style={{
        fontFamily:    "'Inter', sans-serif",
        fontWeight:    700,
        fontSize:      size * 0.46,
        letterSpacing: '0.04em',
        color:         wordColor,
      }}>
        Rocío
      </span>
      {showArabic && (
        <span style={{
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 500,
          fontSize:   size * 0.25,
          color:      arabicColor,
          marginTop:  2,
          direction:  'rtl',
        }}>
          روسيِّو
        </span>
      )}
    </div>
  );

  if (variant === 'wordmark') return wordmark;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.29 }}>
      {mark}
      {wordmark}
    </div>
  );
};

export default RocioLogo;
