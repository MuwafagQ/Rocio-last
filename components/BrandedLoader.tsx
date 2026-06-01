import React, { useEffect, useState } from 'react';

interface Props {
  isReady: boolean;
  onDone: () => void;
}

const SPARK = 'M18 72 C10 58,14 36,30 22 C46 8,66 10,76 26 C84 38,80 54,66 62 C54 68,36 62,28 70 C24 74,22 80,18 72Z';

export const BrandedLoader: React.FC<Props> = ({ isReady, onDone }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setFading(true);
    const t = setTimeout(onDone, 380);
    return () => clearTimeout(t);
  }, [isReady, onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F5F8FF',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.35s ease-out',
    }}>
      <svg
        width={96}
        height={96}
        viewBox="4 4 88 88"
        fill="none"
        className="animate-spark"
      >
        <path d={SPARK} fill="#D4186A" />
      </svg>
    </div>
  );
};

export default BrandedLoader;
