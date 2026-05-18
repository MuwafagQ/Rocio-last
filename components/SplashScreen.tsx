import React, { useEffect, useState } from 'react';

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
      }, 800); // 800ms fade out
      return () => clearTimeout(timer);
    }
  }, [isReady, onTransitionEnd]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center animate-pulse">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dewdrop Element */}
          <path 
            d="M50 10 C50 10, 20 45, 20 65 C20 81.5685, 33.4315 95, 50 95 C66.5685 95, 80 81.5685, 80 65 C80 45, 50 10, 50 10 Z" 
            fill="url(#waterGradient)" 
          />
          {/* Inner highlight for 3D effect */}
          <path 
            d="M50 25 C50 25, 30 50, 30 65 C30 76.0457, 38.9543 85, 50 85 C61.0457 85, 70 76.0457, 70 65 C70 50, 50 25, 50 25 Z" 
            fill="#FFFFFF" 
            opacity="0.2" 
          />
          {/* Small reflection */}
          <ellipse cx="35" cy="65" rx="5" ry="10" transform="rotate(-45 35 65)" fill="#FFFFFF" opacity="0.4" />
          <defs>
            <linearGradient id="waterGradient" x1="50" y1="10" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#87CEEB" /> {/* Sky Blue */}
              <stop offset="1" stopColor="#000080" /> {/* Deep Navy */}
            </linearGradient>
          </defs>
        </svg>
        <h1 className="mt-6 text-4xl font-bold tracking-widest" style={{ color: '#000080', fontFamily: 'system-ui, sans-serif' }}>
          Rocío
        </h1>
      </div>
    </div>
  );
};
