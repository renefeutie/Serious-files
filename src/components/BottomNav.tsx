import React from 'react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  demandesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  demandesCount,
}) => {
  interface NavTab {
    id: string;
    label: string;
    icon: string;
    badgeCount?: number;
    hasPulse?: boolean;
  }

  const tabs: NavTab[] = [
    { id: 'accueil', label: 'Accueil', icon: 'home' },
    { id: 'explorer', label: 'Explorer', icon: 'grid_view' },
    { id: 'devis', label: 'Devis', icon: 'request_quote', hasPulse: true },
    { id: 'demandes', label: 'Demandes', icon: 'assignment', badgeCount: demandesCount },
    { id: 'compte', label: 'Compte', icon: 'person' },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#f2fcf2]/95 backdrop-blur-xl border-t border-[#e1ebe1] shadow-[0_-1px_12px_rgba(0,0,0,0.05)] pb-safe"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
                isActive
                  ? 'text-[#006946] font-bold'
                  : 'text-[#3e4942] hover:text-[#151e18]'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>

                {/* Pulse dot on Devis */}
                {tab.hasPulse && !isActive && (
                  <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 rounded-full bg-[#ffb955] ring-2 ring-[#f2fcf2]" />
                )}

                {/* Badge count on Demandes */}
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-[#006946] text-white text-[10px] font-bold ring-2 ring-[#f2fcf2]">
                    {tab.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
