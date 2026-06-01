import React from 'react';
import { useFeatureFlags, FeatureFlags } from '../hooks/useFeatureFlags';

interface FeatureGateProps {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onBlocked?: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ flag, children, fallback = null, onBlocked }) => {
  const { flags, loading } = useFeatureFlags();

  if (loading) return null;

  if (!flags[flag]) {
    onBlocked?.();
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
