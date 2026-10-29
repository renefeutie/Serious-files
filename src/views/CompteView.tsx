import React from 'react';
import { ARTISANS } from '../data/mockData';
import { LegalTab } from '../components/LegalModal';

interface CompteViewProps {
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onNavigate: (tab: string, artisanId?: string) => void;
  onOpenCitySelector: () => void;
  onOpenProModal: () => void;
  currentCity: string;
  currentDistrict: string;
  onOpenLegalModal?: (tab: LegalTab) => void;
}

export const CompteView: React.FC<CompteViewProps> = ({
  favorites,
  onToggleFavorite,
  onNavigate,
  onOpenCitySelector,
  onOpenProModal,
  currentCity,
  currentDistrict,
  onOpenLegalModal,
}) => {
  const favoriteArtisans = ARTISANS.filter((a) => favorites.has(a.id));

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pt-4 pb-24 flex flex-col gap-4">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#e1ebe1] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#006946]/30 bg-[#ecf6ed]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzVJXNLiHJHSRN1qlVaXDaZ0erVYr-ayB2S7bcBMwABnZcwZ9xdFi8-S7iNMB349iTHenx0LtSD9zZDWHKGcEYBBjuDHVAyQgQhfzVacSbi2ryaWqOV8fvYav9tT5NgWvE8WE1u9_7fFnjSQxhiCaKntMYjEm-8Ry4mrUpbj9HmhxypcBYR2GrSEXh6xzVm5TfuVLGIJ-D29sKLCb9i6kWLNZmF1QXj0yGGsUG9Jivp06mR5T1WBgdqA"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#151e18]">Sylvie Kamga</h1>
            <p className="text-xs text-[#6e7a72]">+237 699 45 21 80</p>
            <button
              type="button"
              onClick={onOpenCitySelector}
              className="text-xs font-semibold text-[#006946] flex items-center gap-1 mt-0.5 hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>
                {currentDistrict}, {currentCity}
              </span>
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </button>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#bfecdc] text-[#006946] text-xs font-bold shrink-0">
          Compte Client
        </span>
      </div>

      {/* Mes Favoris Section */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">favorite</span>
            <h2 className="text-sm font-bold text-[#151e18]">
              Mes Artisans Favoris ({favoriteArtisans.length})
            </h2>
          </div>
          {favoriteArtisans.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('explorer')}
              className="text-xs text-[#006946] font-semibold hover:underline"
            >
              En explorer d'autres
            </button>
          )}
        </div>

        {favoriteArtisans.length === 0 ? (
          <p className="text-xs text-[#6e7a72] py-2">
            Vous n'avez pas encore d'artisan en favori. Cliquez sur le cœur d'un artisan pour le retrouver facilement.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {favoriteArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="p-3 rounded-2xl bg-[#f2fcf2] border border-[#e1ebe1] flex items-center justify-between gap-2.5"
              >
                <div
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  onClick={() => onNavigate('artisan', artisan.id)}
                >
                  <img
                    src={artisan.avatar}
                    alt={artisan.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#151e18] truncate block">
                      {artisan.name}
                    </span>
                    <span className="text-[11px] text-[#3d665a] truncate block">{artisan.job}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('artisan', artisan.id)}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#006946] hover:bg-[#bfecdc]"
                    title="Voir fiche"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(artisan.id)}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6]"
                    title="Retirer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Registration Callout */}
      <div className="rounded-3xl bg-[#ecf6ed] p-5 border border-[#bfecdc] flex flex-col sm:flex-row items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-[#006946] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">handyman</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#151e18]">Vous êtes prestataire ?</h3>
            <p className="text-xs text-[#3e4942]">
              Recevez des clients qualifiés chaque jour à Douala &amp; Yaoundé.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenProModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white font-bold text-xs shrink-0 shadow-xs"
        >
          Créer mon profil Pro
        </button>
      </div>

      {/* Assistance MboaFacile Dédiée */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006946] text-[22px]">support_agent</span>
            <h2 className="text-sm font-bold text-[#151e18]">Assistance &amp; Service Client</h2>
          </div>
          <span className="text-[10px] font-bold text-[#006946] bg-[#bfecdc] px-2 py-0.5 rounded-full">
            7j/7 • 24h/24
          </span>
        </div>
        <p className="text-xs text-[#6e7a72]">
          Un doute sur une intervention, une question sur un devis ou un besoin de médiation ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href="https://wa.me/237686942622?text=Bonjour%20MboaFacile,%20j'ai%20besoin%20d'aide%20concernant%20mon%20compte"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-[#bfecdc] hover:bg-[#a4d0c0] text-[#006946] flex items-center justify-between transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <div className="text-left">
                <div className="font-extrabold text-xs">WhatsApp Assistance</div>
                <div className="text-[11px] font-semibold text-[#006946]/80">686 94 26 22</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
          </a>

          <a
            href="tel:+237654475764"
            className="p-3.5 rounded-2xl bg-[#006946] hover:bg-[#005236] text-white flex items-center justify-between transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px]">call</span>
              <div className="text-left">
                <div className="font-extrabold text-xs">Appel Assistance</div>
                <div className="text-[11px] text-[#bfecdc] font-semibold">654 47 57 64</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
          </a>
        </div>
      </div>

      {/* Numéros d'urgence locaux au Cameroun */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">e911_emergency</span>
          <h2 className="text-sm font-bold text-[#151e18]">Numéros d'urgence utiles (Douala)</h2>
        </div>
        <p className="text-xs text-[#6e7a72]">En cas d'incident grave sur le réseau public :</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <a
            href="tel:8010"
            className="p-3 rounded-2xl bg-[#f2fcf2] border border-[#e1ebe1] flex flex-col items-center text-center hover:bg-[#ecf6ed]"
          >
            <span className="font-bold text-[#006946] text-sm">8010</span>
            <span className="text-[11px] text-[#3e4942]">Eneo Dépannage</span>
          </a>
          <a
            href="tel:118"
            className="p-3 rounded-2xl bg-[#f2fcf2] border border-[#e1ebe1] flex flex-col items-center text-center hover:bg-[#ecf6ed]"
          >
            <span className="font-bold text-[#ba1a1a] text-sm">118</span>
            <span className="text-[11px] text-[#3e4942]">Pompiers Douala</span>
          </a>
          <a
            href="tel:117"
            className="p-3 rounded-2xl bg-[#f2fcf2] border border-[#e1ebe1] flex flex-col items-center text-center hover:bg-[#ecf6ed]"
          >
            <span className="font-bold text-[#151e18] text-sm">117</span>
            <span className="text-[11px] text-[#3e4942]">Police Secours</span>
          </a>
          <a
            href="tel:+237654475764"
            className="p-3 rounded-2xl bg-[#f2fcf2] border border-[#e1ebe1] flex flex-col items-center text-center hover:bg-[#ecf6ed]"
          >
            <span className="font-bold text-[#a06800] text-sm">654 47 57 64</span>
            <span className="text-[11px] text-[#3e4942]">Assistance Mboa</span>
          </a>
        </div>
      </div>

      {/* Données personnelles, Sécurité & Conformité */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#e1ebe1] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006946] text-[22px]">policy</span>
          <h2 className="text-sm font-bold text-[#151e18]">Sécurité, Vie Privée &amp; Conformité</h2>
        </div>
        <p className="text-xs text-[#6e7a72] leading-relaxed">
          Gérez vos préférences de confidentialité, vos droits RGPD / Loi camerounaise N°2010/012 et consultez les mentions légales.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onOpenLegalModal?.('confidentialite')}
            className="p-3 rounded-2xl bg-[#f2fcf2] hover:bg-[#ecf6ed] text-[#151e18] flex items-center justify-between border border-[#e1ebe1] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006946]">privacy_tip</span>
              <span>Politique de Confidentialité</span>
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#6e7a72]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenLegalModal?.('cookies')}
            className="p-3 rounded-2xl bg-[#f2fcf2] hover:bg-[#ecf6ed] text-[#151e18] flex items-center justify-between border border-[#e1ebe1] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006946]">cookie</span>
              <span>Gérer les cookies &amp; traceurs</span>
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#6e7a72]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenLegalModal?.('mentions')}
            className="p-3 rounded-2xl bg-[#f2fcf2] hover:bg-[#ecf6ed] text-[#151e18] flex items-center justify-between border border-[#e1ebe1] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006946]">info</span>
              <span>Mentions Légales</span>
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#6e7a72]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenLegalModal?.('cgu')}
            className="p-3 rounded-2xl bg-[#f2fcf2] hover:bg-[#ecf6ed] text-[#151e18] flex items-center justify-between border border-[#e1ebe1] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#006946]">gavel</span>
              <span>Conditions d'Utilisation (CGU)</span>
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#6e7a72]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};
