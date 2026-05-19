import React from 'react';

interface RocioLogoProps {
  size?: number;
  variant?: 'mark' | 'wordmark' | 'full';
  theme?: 'color' | 'dark' | 'light';
  showArabic?: boolean;
}

/**
 * Rocío brand logo — geometric three-stroke "R" mark.
 *
 * The mark is built from three clean strokes:
 *   1. Vertical stem  — structure, stability
 *   2. Curved bowl    — openness, intelligence
 *   3. Diagonal leg   — momentum, forward motion
 *
 * No industry-specific imagery. Works for any business vertical.
 */
export const RocioLogo: React.FC<RocioLogoProps> = ({
  size = 48,
  variant = 'full',
  theme = 'color',
  showArabic = true,
}) => {
  const id = `rocio-${size}-${theme}`;

  const containerFill =
    theme === 'light'
      ? 'rgba(255,255,255,0.15)'
      : theme === 'dark'
      ? '#071952'
      : `url(#${id})`;

  const containerStroke =
    theme === 'light' ? 'rgba(255,255,255,0.30)' : 'none';

  const strokeColor = 'white';

  const textColor =
    theme === 'light' ? '#FFFFFF' : theme === 'dark' ? '#071952' : '#1245C5';

  const subColor =
    theme === 'light'
      ? 'rgba(255,255,255,0.60)'
      : theme === 'dark'
      ? '#475569'
      : '#94A3B8';

  const markH = Math.round(size * 1.25);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.18 }}>
      {(variant === 'mark' || variant === 'full') && (
        <svg
          width={size}
          height={markH}
          viewBox="0 0 100 125"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={id} x1="4" y1="4" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1B55D4" />
              <stop offset="100%" stopColor="#071952" />
            </linearGradient>
          </defs>

          {/* Container */}
          <rect
            x="4" y="4" width="92" height="92" rx="22"
            fill={containerFill}
            stroke={containerStroke}
            strokeWidth={containerStroke !== 'none' ? 1.5 : 0}
          />

          {/* Three-stroke R */}
          <g
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeWidth="10"
          >
            {/* 1. Vertical stem */}
            <line x1="33" y1="23" x2="33" y2="77" />
            {/* 2. Curved bowl */}
            <path d="M33 23 C55 23,68 30,68 44 C68 58,55 58,33 58" />
            {/* 3. Diagonal leg */}
            <line x1="50" y1="58" x2="70" y2="77" />
          </g>
        </svg>
      )}

      {(variant === 'wordmark' || variant === 'full') && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: size * 0.48,
              letterSpacing: '0.04em',
              color: textColor,
            }}
          >
            Rocío
          </span>
          {showArabic && (
            <span
              style={{
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 500,
                fontSize: size * 0.26,
                letterSpacing: '0.04em',
                color: subColor,
                marginTop: size * 0.04,
              }}
            >
              روسيِّو
            </span>
          )}
        </div>
      )}
    </div>
  );
};
