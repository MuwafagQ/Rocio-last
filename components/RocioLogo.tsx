import React from 'react';

// Option C "Spark" — speech-bubble silhouette with bottom-left tail
const SPARK = 'M18 72 C10 58,14 36,30 22 C46 8,66 10,76 26 C84 38,80 54,66 62 C54 68,36 62,28 70 C24 74,22 80,18 72Z';
const ROSE  = '#D4186A';

interface RocioLogoProps {
  size?:       number;
  variant?:    'mark' | 'wordmark' | 'full';
  theme?:      'color' | 'dark' | 'light';
  showArabic?: boolean;
}

const RocioLogo: React.FC<RocioLogoProps> = ({
  size       = 48,
  variant    = 'full',
  theme      = 'color',
  showArabic = true,
}) => {
  const bgFill =
    theme === 'color' ? 'url(#rocioGrad)' :
    theme === 'dark'  ? 'rgba(255,255,255,0.08)' :
                        '#1245C5';

  const wordColor   = theme === 'light' ? '#1245C5'            : 'white';
  const arabicColor = theme === 'light' ? '#94A3B8'            : 'rgba(255,255,255,0.55)';

  const mark = (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="4" y="4" width="92" height="92" rx="22" fill={bgFill} />
      <g transform="translate(12 14) scale(0.8)">
        <path d={SPARK} fill={ROSE} />
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

  const fs       = size * 0.46;
  const accentSz = Math.round(fs * 0.44);

  const letterStyle: React.CSSProperties = {
    fontFamily:    "'Inter', sans-serif",
    fontWeight:    700,
    fontSize:      fs,
    letterSpacing: '0.04em',
    color:         wordColor,
    lineHeight:    1,
  };

  const wordmark = (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      {/* English wordmark: Roci + spark-accented ı + o */}
      <div style={{ display: 'inline-flex', alignItems: 'baseline' }}>
        <span style={letterStyle}>Roci</span>

        {/* dotless-i with spark accent mark */}
        <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
          <span style={letterStyle}>&#x131;</span>
          <svg
            style={{
              position:      'absolute',
              left:          '50%',
              top:           -(accentSz + 1),
              transform:     'translateX(-50%)',
              display:       'block',
              pointerEvents: 'none',
            }}
            width={accentSz}
            height={accentSz}
            viewBox="0 5 100 80"
            fill="none"
          >
            <path d={SPARK} fill={ROSE} />
          </svg>
        </span>

        <span style={letterStyle}>o</span>
      </div>

      {showArabic && (
        <span style={{
          fontFamily: "'Cairo', sans-serif",
          fontWeight: 500,
          fontSize:   size * 0.25,
          color:      arabicColor,
          marginTop:  2,
          direction:  'rtl',
        }}>
          &#x631;&#x648;&#x633;&#x64A;&#x650;&#x651;&#x648;
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
