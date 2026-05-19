import React from 'react';

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

    {/* decorative orbs */}
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

    {/* mark */}
    <svg width="88" height="110" viewBox="0 0 100 125" fill="none"
         style={{ position: 'relative', zIndex: 1 }}>
      <rect x="4" y="4" width="92" height="92" rx="22" fill="url(#splashGrad)" />
      <g stroke="white" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="10">
        <line x1="33" y1="23" x2="33" y2="77" />
        <path d="M33 23 C55 23,68 30,68 44 C68 58,55 58,33 58" />
        <line x1="50" y1="58" x2="70" y2="77" />
      </g>
      <defs>
        <linearGradient id="splashGrad" x1="4" y1="4" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
      </defs>
    </svg>

    {/* wordmark */}
    <div style={{
      fontFamily:    "'Inter', sans-serif",
      fontWeight:    800,
      fontSize:      '2.6rem',
      letterSpacing: '0.12em',
      color:         '#fff',
      marginTop:     20,
      lineHeight:    1,
      position:      'relative',
      zIndex:        1,
    }}>
      Rocío
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
      روسيِّو
    </div>

    {/* rule */}
    <div style={{
      display:   'flex',
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

    {/* loading dots */}
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
