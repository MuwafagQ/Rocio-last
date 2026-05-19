import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isReady: boolean;
  onTransitionEnd: () => void;
}

/**
 * Rocío Splash Screen — geometric brand mark on ocean-gradient background.
 * Staggered entrance: mark → wordmark → loading dots.
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
      {/* Ambient glow orbs */}
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(0, 184, 217, 0.14)' }}
      />
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-2xl pointer-events-none"
        style={{ background: 'rgba(75, 115, 230, 0.14)' }}
      />

      <div
        className="flex flex-col items-center justify-center relative z-10"
        style={{ gap: 0 }}
      >
        {/* Logo Mark */}
        <div style={{ animation: 'dropFall 0.8s cubic-bezier(0.22,1,0.36,1) both' }}>
          <svg
            width="96"
            height="120"
            viewBox="0 0 100 125"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="splashBg" x1="4" y1="4" x2="96" y2="96" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.07)" />
              </linearGradient>
            </defs>
            {/* Container */}
            <rect
              x="4" y="4" width="92" height="92" rx="22"
              fill="url(#splashBg)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Three-stroke R */}
            <g
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeWidth="10"
            >
              <line x1="33" y1="23" x2="33" y2="77" />
              <path d="M33 23 C55 23,68 30,68 44 C68 58,55 58,33 58" />
              <line x1="50" y1="58" x2="70" y2="77" />
            </g>
          </svg>
        </div>

        {/* Wordmark */}
        <div
          className="flex flex-col items-center"
          style={{ marginTop: 20, animation: 'dropFall 0.8s 0.12s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <h1
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: '2.75rem',
              letterSpacing: '0.12em',
              color: '#FFFFFF',
              lineHeight: 1,
              margin: 0,
            }}
          >
            Rocío
          </h1>
          <p
            style={{
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 500,
              fontSize: '1.1rem',
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.58)',
              marginTop: 6,
            }}
          >
            روسيِّو
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 12,
            }}
          >
            <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.22)' }} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '0.58rem',
                letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.38)',
                textTransform: 'uppercase',
              }}
            >
              Water Delivery
            </span>
            <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.22)' }} />
          </div>
        </div>

        {/* Loading dots */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginTop: 52,
            animation: 'dropFall 0.8s 0.26s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.50)',
                animation: `bounce 1.2s ${i * 0.18}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
