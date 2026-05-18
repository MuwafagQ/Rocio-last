import React from 'react';
import { Home, User as UserIcon, RefreshCw, Layers, HandHeart, Database } from 'lucide-react';
import { Tab } from '../types';
import { useAuth } from '../store/AuthContext';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { user } = useAuth();
  
  const tabs = [
    { id: Tab.HOME, icon: Home, label: 'الرئيسية' },
    { id: Tab.BRANDS, icon: Layers, label: 'الماركات' },
    { id: Tab.COMMUNITY, icon: HandHeart, label: 'المجتمع' },
    { id: Tab.SUBSCRIPTIONS, icon: RefreshCw, label: 'الاشتراكات' },
    { id: Tab.PROFILE, icon: UserIcon, label: 'حسابي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe px-2 py-2 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-14 relative transition-colors ${
              isActive ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50 -translate-y-1' : ''}`}>
                <tab.icon size={22} className={isActive ? 'fill-current' : ''} />
            </div>
            <span className={`text-[9px] font-medium mt-1 ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
