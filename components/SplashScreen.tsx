import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isReady: boolean;
  onTransitionEnd: () => void;
}

const ARM = 'M50 20 C74 20,80 44,62 60';

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
      style={{ background: 'linear-gradient(155deg, #071952 0%, #1245C5 52%, #00B8D9 100%)' }}
    >
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(0,184,217,0.13)' }} />
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-2xl pointer-events-none"
        style={{ background: 'rgba(75,115,230,0.13)' }} />

      <div className="flex flex-col items-center justify-center relative z-10">
        <div style={{ animation: 'dropFall 0.75s cubic-bezier(0.22,1,0.36,1) both' }}>
          <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
            <rect x="4" y="4" width="92" height="92" rx="22"
              fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.26)" strokeWidth="1.5" />
            <g stroke="white" strokeWidth="10" strokeLinecap="round" fill="none">
              <path d={ARM} />
              <path d={ARM} transform="rotate(120 50 50)" />
              <path d={ARM} transform="rotate(240 50 50)" />
            </g>
          </svg>
        </div>

        <div className="flex flex-col items-center"
          style={{ marginTop: 20, animation: 'dropFall 0.75s 0.11s cubic-bezier(0.22,1,0.36,1) both' }}>
          <h1 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:'2.75rem', letterSpacing:'0.12em', color:'#FFFFFF', lineHeight:1, margin:0 }}>
            Rocío
          </h1>
          <p style={{ fontFamily:'Cairo,sans-serif', fontWeight:500, fontSize:'1.05rem', letterSpacing:'0.06em', color:'rgba(255,255,255,0.55)', marginTop:6 }}>
            روسيِّو
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:11 }}>
            <span style={{ display:'block', width:26, height:1, background:'rgba(255,255,255,0.22)' }} />
            <span style={{ fontFamily:'Inter,sans-serif', fontWeight:500, fontSize:'0.56rem', letterSpacing:'0.22em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase' }}>
              Water Delivery
            </span>
            <span style={{ display:'block', width:26, height:1, background:'rgba(255,255,255,0.22)' }} />
          </div>
        </div>

        <div style={{ display:'flex', gap:6, marginTop:52, animation:'dropFall 0.75s 0.24s cubic-bezier(0.22,1,0.36,1) both' }}>
          {[0,1,2].map((i) => (
            <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.48)', animation:`bounce 1.2s ${i*0.18}s ease-in-out infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
};
