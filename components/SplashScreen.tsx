import React, { useEffect, useState } from 'react';
import RocioLogo from './RocioLogo';

interface SplashScreenProps {
  isReady: boolean;
  onTransitionEnd: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isReady, onTransitionEnd }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isReady) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        onTransitionEnd();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isReady, onTransitionEnd]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-rocio-splash overflow-hidden transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Soft ambient circles */}
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-aqua/10 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 animate-drop flex flex-col items-center">
        <RocioLogo variant="full" theme="dark" size={92} showArabic />
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
