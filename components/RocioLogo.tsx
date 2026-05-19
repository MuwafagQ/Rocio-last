import React from 'react';

interface RocioLogoProps {
  /** Height of the logo mark in px (width scales proportionally) */
  size?: number;
  /** 'mark' = drop only | 'wordmark' = text only | 'full' = drop + text */
  variant?: 'mark' | 'wordmark' | 'full';
  /** Color theme */
  theme?: 'color' | 'dark' | 'light';
  /** Show Arabic sub-label (only in 'wordmark' and 'full' variants) */
  showArabic?: boolean;
}

/**
 * Rocío brand logo.
 * The dewdrop (قطرة الندى) mark symbolises morning dew — fresh, pure, first.
 */
export const RocioLogo: React.FC<RocioLogoProps> = ({
  size = 48,
  variant = 'full',
  theme = 'color',
  showArabic = true,
}) => {
  const GRAD_ID = `rocio-grad-${size}-${theme}`;

  const markFill =
    theme === 'light' ? '#FFFFFF'
    : theme === 'dark'  ? '#071952'
    : `url(#${GRAD_ID})`;

  const textColor =
    theme === 'light' ? '#FFFFFF'
    : theme === 'dark'  ? '#071952'
    : '#1245C5';

  const subColor =
    theme === 'light' ? 'rgba(255,255,255,0.65)'
    : theme === 'dark'  ? '#475569'
    : '#475569';

  /* ── Drop shape on a 100×125 canvas ── */
  const markH = size * 1.25;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.18 }}>

      {/* ── Logo Mark ── */}
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
            <linearGradient id={GRAD_ID} x1="50" y1="6" x2="50" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%"  stopColor="#60D6F4" />
              <stop offset="38%" stopColor="#1B55D4" />
              <stop offset="100%" stopColor="#071952" />
            </linearGradient>
          </defs>

          {/* Subtle drop shadow */}
          <ellipse cx="50" cy="112" rx="26" ry="6" fill="#071952" opacity="0.15" />

          {/* Main dewdrop body */}
          <path
            d="M50 6 C50 6, 16 50, 16 72 C16 90.4 31.6 105 50 105 C68.4 105 84 90.4 84 72 C84 50 50 6 50 6 Z"
            fill={markFill}
          />

          {/* Glass inner highlight */}
          <path
            d="M50 22 C50 22, 28 56, 28 72 C28 83.6 38 93 50 93 C62 93 72 83.6 72 72 C72 56 50 22 50 22 Z"
            fill="white"
            opacity="0.10"
          />

          {/* Primary reflection streak */}
          <ellipse
            cx="35"
            cy="67"
            rx="5"
            ry="12"
            transform="rotate(-42 35 67)"
            fill="white"
            opacity="0.38"
          />

          {/* Secondary reflection dot */}
          <ellipse
            cx="60"
            cy="42"
            rx="2.5"
            ry="5.5"
            transform="rotate(-30 60 42)"
            fill="white"
            opacity="0.20"
          />

          {/* 'R' letterform */}
          <text
            x="34"
            y="84"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fontSize="30"
            fill="white"
            opacity="0.88"
          >
            R
          </text>
        </svg>
      )}

      {/* ── Wordmark ── */}
      {(variant === 'wordmark' || variant === 'full') && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              color: textColor,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: size * 0.48,
              letterSpacing: '0.06em',
            }}
          >
            Rocío
          </span>
          {showArabic && (
            <span
              style={{
                color: subColor,
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 500,
                fontSize: size * 0.28,
                letterSpacing: '0.04em',
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
