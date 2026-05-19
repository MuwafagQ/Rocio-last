import React from 'react';

interface RocioLogoProps {
  size?: number;
  variant?: 'mark' | 'wordmark' | 'full';
  theme?: 'color' | 'dark' | 'light';
  showArabic?: boolean;
}

/**
 * Rocío brand mark — three-arm triskelion symbol.
 *
 * Three identical bezier arms at 120° intervals, sweeping clockwise.
 * No letterform. No industry imagery. Works at any size, any vertical.
 */
export const RocioLogo: React.FC<RocioLogoProps> = ({
  size = 48,
  variant = 'full',
  theme = 'color',
  showArabic = true,
}) => {
  const id = `rocio-${size}-${theme}`;

  const containerFill =
    theme === 'light' ? 'rgba(255,255,255,0.14)'
    : theme === 'dark'  ? '#071952'
    : `url(#${id})`;

  const containerStroke =
    theme === 'light' ? 'rgba(255,255,255,0.28)' : 'none';

  const textColor =
    theme === 'light' ? '#FFFFFF'
    : theme === 'dark'  ? '#071952'
    : '#1245C5';

  const subColor =
    theme === 'light' ? 'rgba(255,255,255,0.55)'
    : theme === 'dark'  ? '#475569'
    : '#94A3B8';

  const ARM = 'M50 20 C74 20,80 44,62 60';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.18 }}>

      {(variant === 'mark' || variant === 'full') && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
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
          <rect
            x="4" y="4" width="92" height="92" rx="22"
            fill={containerFill}
            stroke={containerStroke !== 'none' ? containerStroke : undefined}
            strokeWidth={containerStroke !== 'none' ? 1.5 : undefined}
          />
          <g stroke="white" strokeWidth="10" strokeLinecap="round" fill="none">
            <path d={ARM} />
            <path d={ARM} transform="rotate(120 50 50)" />
            <path d={ARM} transform="rotate(240 50 50)" />
          </g>
        </svg>
      )}

      {(variant === 'wordmark' || variant === 'full') && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: size * 0.46,
            letterSpacing: '0.04em',
            color: textColor,
          }}>
            Rocío
          </span>
          {showArabic && (
            <span style={{
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 500,
              fontSize: size * 0.25,
              letterSpacing: '0.04em',
              color: subColor,
              marginTop: size * 0.04,
            }}>
              روسيِّو
            </span>
          )}
        </div>
      )}

    </div>
  );
};
