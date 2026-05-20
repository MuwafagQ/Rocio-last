import React from 'react';

const SPARK = 'M18 72 C10 58,14 36,30 22 C46 8,66 10,76 26 C84 38,80 54,66 62 C54 68,36 62,28 70 C24 74,22 80,18 72Z';

const SplashScreen: React.FC = () => (
  <div style={{
    position:       'fixed',
    inset:          0,
    background:     'linear-gradient(160deg, #071952 0%, #1245C5 55%, #00B8D9 100%)',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         9999,
    overflow:       'hidden',
  }}>

    <div style={{
      position: 'absolute', bottom: -60, left: -60,
      width: 260, height: 260, borderRadius: '50%',
      background: 'rgba(0,184,217,0.14)', pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', top: -40, right: -40,
      width: 180, height: 180, borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
    }} />

    <svg width="88" height="88" viewBox="0 0 100 100" fill="none"
         style={{ position: 'relative', zIndex: 1 }}>
      <rect x="4" y="4" width="92" height="92" rx="22" fill="url(#splashGrad)" />
      <g transform="translate(12 14) scale(0.8)">
        <path d={SPARK} fill="#D4186A" />
      </g>
      <defs>
        <linearGradient id="splashGrad" x1="4" y1="4" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
      </defs>
    </svg>

    {/* wordmark: Roc + spark-dotted ı + o */}
    <div style={{
      display:    'inline-flex',
      alignItems: 'baseline',
      marginTop:  24,
      paddingTop: 20,
      position:   'relative',
      zIndex:     1,
    }}>
      {(['Roc', null, 'o'] as const).map((seg, idx) =>
        seg !== null ? (
          <span key={idx} style={{
            fontFamily:    "'Inter', sans-serif",
            fontWeight:    800,
            fontSize:      '2.6rem',
            letterSpacing: '0.12em',
            color:         '#fff',
            lineHeight:    1,
          }}>{seg}</span>
        ) : (
          <span key={idx} style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
            <span style={{
              fontFamily:    "'Inter', sans-serif",
              fontWeight:    800,
              fontSize:      '2.6rem',
              letterSpacing: '0.12em',
              color:         '#fff',
              lineHeight:    1,
            }}>&#x131;</span>
            <svg
              style={{
                position:      'absolute',
                left:          '50%',
                top:           -11,
                transform:     'translateX(-50%)',
                display:       'block',
                pointerEvents: 'none',
              }}
              width="18"
              height="18"
              viewBox="0 5 100 80"
              fill="none"
            >
              <path d={SPARK} fill="#D4186A" />
            </svg>
          </span>
        )
      )}
    </div>

    <div style={{
      fontFamily:    "'Cairo', sans-serif",
      fontWeight:    500,
      fontSize:      '1.1rem',
      color:         'rgba(255,255,255,0.58)',
      marginTop:     6,
      letterSpacing: '0.06em',
      direction:     'rtl',
      position:      'relative',
      zIndex:        1,
    }}>
      &#x631;&#x648;&#x633;&#x64A;&#x650;&#x651;&#x648;
    </div>

    <div style={{
      display:    'flex',
      alignItems: 'center',
      gap:        10,
      marginTop:  14,
      position:   'relative',
      zIndex:     1,
    }}>
      <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.22)' }} />
      <div style={{
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '0.56rem',
        letterSpacing: '0.22em',
        color:         'rgba(255,255,255,0.38)',
        textTransform: 'uppercase',
      }}>
        Commerce · Intelligence
      </div>
      <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.22)' }} />
    </div>

    <div style={{ display: 'flex', gap: 6, marginTop: 52, position: 'relative', zIndex: 1 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: i === 1 ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.40)',
        }} />
      ))}
    </div>
  </div>
);

export default SplashScreen;
