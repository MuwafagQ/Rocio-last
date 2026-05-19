import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isReady: boolean;
  onTransitionEnd: () => void;
}

/**
 * Rocío Splash Screen
 *
 * Brand moment: ocean-deep gradient background, animated dewdrop mark,
 * bilingual wordmark (Rocío / روسيِّو), bouncing loading dots.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ isReady, onTransitionEnd }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isReady) {
      setIsFadingOut(true);
      const t = setTimeout(onTransitionEnd, 800);
      return () => clearTimeout(t);
    }
  }, [isReady, onTransitionEnd]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(160deg, #071952 0%, #1245C5 55%, #00B8D9 100%)' }}
    >
      {/* ── Ambient glow orbs ── */}
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(0, 184, 217, 0.15)' }}
      />
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-2xl pointer-events-none"
        style={{ background: 'rgba(75, 115, 230, 0.15)' }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full blur-2xl pointer-events-none"
        style={{ background: 'rgba(255, 255, 255, 0.04)' }}
      />

      {/* ── Content ── */}
      <div className="flex flex-col items-center justify-center relative z-10" style={{ gap: '0px' }}>

        {/* Dewdrop Logo Mark */}
        <div style={{ animation: 'dropFall 0.9s cubic-bezier(0.22,1,0.36,1) both' }}>
          <svg
            width="100"
            height="125"
            viewBox="0 0 100 125"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="splashDropGrad" x1="50" y1="6" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                <stop offset="0%"  stopColor="#A8EDFF" />
                <stop offset="35%" stopColor="#3D7FE8" />
                <stop offset="100%" stopColor="#071952" />
              </linearGradient>
              <filter id="dropGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glow underneath */}
            <ellipse cx="50" cy="112" rx="30" ry="7" fill="#00B8D9" opacity="0.20" />

            {/* Main dewdrop */}
            <path
              d="M50 6 C50 6, 16 50, 16 72 C16 90.4 31.6 105 50 105 C68.4 105 84 90.4 84 72 C84 50 50 6 50 6 Z"
              fill="url(#splashDropGrad)"
              filter="url(#dropGlow)"
            />

            {/* Glass body overlay */}
            <path
              d="M50 22 C50 22, 28 56, 28 72 C28 83.6 38 93 50 93 C62 93 72 83.6 72 72 C72 56 50 22 50 22 Z"
              fill="white"
              opacity="0.08"
            />

            {/* Main reflection streak */}
            <ellipse
              cx="35"
              cy="67"
              rx="5"
              ry="13"
              transform="rotate(-42 35 67)"
              fill="white"
              opacity="0.40"
            />

            {/* Small top reflection */}
            <ellipse
              cx="60"
              cy="40"
              rx="2.5"
              ry="5.5"
              transform="rotate(-30 60 40)"
              fill="white"
              opacity="0.22"
            />

            {/* R letterform */}
            <text
              x="34"
              y="84"
              fontFamily="Inter, sans-serif"
              fontWeight="700"
              fontSize="30"
              fill="white"
              opacity="0.90"
            >
              R
            </text>
          </svg>
        </div>

        {/* Brand Wordmark */}
        <div
          className="flex flex-col items-center"
          style={{ marginTop: '20px', animation: 'dropFall 0.9s 0.15s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Latin name */}
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: '2.8rem',
              letterSpacing: '0.14em',
              color: '#FFFFFF',
              lineHeight: 1,
              margin: 0,
            }}
          >
            Rocío
          </h1>

          {/* Arabic name */}
          <p
            style={{
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 500,
              fontSize: '1.15rem',
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.65)',
              marginTop: '6px',
            }}
          >
            روسيِّو
          </p>

          {/* Divider rule + tagline */}
          <div
            className="flex items-center"
            style={{ gap: '10px', marginTop: '12px' }}
          >
            <span style={{ display: 'block', width: '32px', height: '1px', background: 'rgba(255,255,255,0.25)' }} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '0.625rem',
                letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
              }}
            >
              Water Delivery
            </span>
            <span style={{ display: 'block', width: '32px', height: '1px', background: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>

        {/* Animated loading dots */}
        <div
          className="flex"
          style={{ gap: '6px', marginTop: '48px', animation: 'dropFall 0.9s 0.3s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.55)',
                animation: `bounce 1.2s ${i * 0.18}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
