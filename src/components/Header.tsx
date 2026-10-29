import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, artisanId?: string) => void;
  onOpenDrawer: () => void;
  onOpenCitySelector: () => void;
  currentDistrict: string;
  currentCity: string;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenDrawer,
  onOpenCitySelector,
  currentDistrict,
  currentCity,
  favoritesCount,
}) => {
  const { user, userProfile } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#f2fcf2]/95 backdrop-blur-xl pt-safe border-b border-[#e1ebe1]/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        {/* Left: Drawer toggle + Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Menu principal"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#151e18] hover:bg-[#e6f1e7] active:bg-[#dbe5dc] transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('accueil')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006946] to-[#16845b] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">handyman</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-[#006946] tracking-tight leading-tight">
                Mboa<span className="text-[#a06800]">Facile</span>
              </span>
              <span className="text-[10px] text-[#3d665a] font-medium leading-none hidden sm:block">
                Services &amp; Artisans Certifiés
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#3e4942]">
          <button
            type="button"
            onClick={() => onNavigate('accueil')}
            className={`hover:text-[#006946] transition-colors ${
              currentTab === 'accueil' ? 'text-[#006946] font-bold' : ''
            }`}
          >
            Accueil
          </button>
          <button
            type="button"
            onClick={() => onNavigate('explorer')}
            className={`hover:text-[#006946] transition-colors ${
              currentTab === 'explorer' ? 'text-[#006946] font-bold' : ''
            }`}
          >
            Trouver un professionnel
          </button>
          <button
            type="button"
            onClick={() => onNavigate('devis')}
            className={`hover:text-[#006946] transition-colors ${
              currentTab === 'devis' ? 'text-[#006946] font-bold' : ''
            }`}
          >
            Demander un devis
          </button>
          <button
            type="button"
            onClick={() => onNavigate('demandes')}
            className={`hover:text-[#006946] transition-colors ${
              currentTab === 'demandes' ? 'text-[#006946] font-bold' : ''
            }`}
          >
            Mes demandes
          </button>
        </nav>

        {/* Right: Location Pill + Search + Favorites + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Location Selector Button */}
          <button
            type="button"
            onClick={onOpenCitySelector}
            className="flex items-center gap-1 px-3 h-9 rounded-full bg-[#ecf6ed] text-[#3e4942] text-xs font-semibold hover:bg-[#e1ebe1] border border-[#dbe5dc]/80 transition-colors"
            title="Changer de quartier ou ville"
          >
            <span className="material-symbols-outlined text-[16px] text-[#a06800]">
              location_on
            </span>
            <span className="max-w-[85px] sm:max-w-[120px] truncate">
              {currentDistrict || currentCity}
            </span>
            <span className="material-symbols-outlined text-[14px] text-[#6e7a72]">
              expand_more
            </span>
          </button>

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => onNavigate('explorer')}
            aria-label="Recherche rapide"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#151e18] hover:bg-[#e6f1e7] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          {/* Favorites Heart with counter */}
          <button
            type="button"
            onClick={() => onNavigate('compte')}
            aria-label="Mes favoris"
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#151e18] hover:bg-[#e6f1e7] transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                favoritesCount > 0 ? 'text-[#ba1a1a]' : 'text-[#6e7a72]'
              }`}
              style={{ fontVariationSettings: favoritesCount > 0 ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Auth State Button: Login or Profile */}
          {user ? (
            <div className="flex items-center gap-1.5">
              {userProfile?.role === 'merchant' && (
                <button
                  type="button"
                  onClick={() => onNavigate('espace-commercant')}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#bfecdc] text-[#006946] text-xs font-bold hover:bg-[#a3e2cd] transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">storefront</span>
                  <span>Espace Pro</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate('mon-profil')}
                aria-label="Mon profil"
                className="w-9 h-9 rounded-full bg-[#006946] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#006946]/30 hover:ring-[#006946] transition-all overflow-hidden"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}</span>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigate('inscrire-mon-commerce')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#006946] hover:bg-[#ecf6ed] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add_business</span>
                <span>Espace Pro</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('connexion')}
                className="h-9 px-3 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Connexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
