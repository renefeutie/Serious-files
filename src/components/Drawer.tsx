import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LegalTab } from './LegalModal';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, artisanId?: string) => void;
  onOpenProModal: () => void;
  onOpenLegalModal: (tab: LegalTab) => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenProModal,
  onOpenLegalModal,
}) => {
  const { user, userProfile, logout } = useAuth();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-[#29332c]/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[84%] max-w-[340px] z-50 bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out pt-safe pb-safe ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu latéral"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-[#e1ebe1]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#006946] text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">handyman</span>
              </div>
              <span className="font-extrabold text-lg text-[#006946]">
                Mboa<span className="text-[#a06800]">Facile</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#3e4942] hover:bg-[#ecf6ed] transition-colors"
              aria-label="Fermer le menu"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Badge */}
          <div className="px-4 py-2.5 bg-[#ecf6ed]/60">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#bfecdc] text-[#436c5f] text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px] text-[#006946]">verified</span>
              Services certifiés Douala &amp; Yaoundé
            </span>
          </div>

          {/* Links list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                onNavigate('accueil');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-11 px-3 rounded-xl text-[#151e18] hover:bg-[#ecf6ed] text-sm font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[22px]">home</span>
              <span>Accueil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('explorer');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-11 px-3 rounded-xl text-[#151e18] hover:bg-[#ecf6ed] text-sm font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[22px]">engineering</span>
              <span>Trouver un professionnel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('devis');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-11 px-3 rounded-xl text-[#151e18] hover:bg-[#ecf6ed] text-sm font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#a06800] text-[22px]">request_quote</span>
              <span>Demander un devis en ligne</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('demandes');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-11 px-3 rounded-xl text-[#151e18] hover:bg-[#ecf6ed] text-sm font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[22px]">assignment</span>
              <span>Mes demandes en cours</span>
            </button>

            <div className="py-2">
              <div className="h-px bg-[#e1ebe1] w-full" />
            </div>

            {/* Account & Pro section */}
            {user ? (
              <div className="space-y-1.5 p-2 bg-[#f2fcf2] rounded-2xl border border-[#dbe5dc]">
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-[#006946] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#151e18] truncate">
                      {userProfile?.displayName || user.displayName}
                    </p>
                    <p className="text-[10px] text-[#6e7a72] truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('mon-profil');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-[#151e18] hover:bg-[#e1ebe1] text-xs font-semibold text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[#006946] text-[18px]">account_circle</span>
                  <span>Mon profil &amp; favoris</span>
                </button>

                {userProfile?.role === 'merchant' && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('espace-commercant');
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-[#006946] bg-[#bfecdc]/50 hover:bg-[#bfecdc] text-xs font-bold text-left transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                    <span>Mon Espace Commerçant</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('inscrire-mon-commerce');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-[#3e4942] hover:bg-[#e1ebe1] text-xs font-semibold text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[#a06800] text-[18px]">add_business</span>
                  <span>Inscrire un commerce</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-semibold text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 p-2 bg-[#f2fcf2] rounded-2xl border border-[#dbe5dc]">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('connexion');
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl bg-[#006946] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Se connecter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('inscription');
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-xl bg-white border border-[#dbe5dc] text-[#006946] text-xs font-bold hover:bg-[#e1ebe1] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Créer un compte</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('inscrire-mon-commerce');
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-[#a06800] hover:bg-[#ffddb4]/40 text-xs font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                  <span>Inscrire mon commerce</span>
                </button>
              </div>
            )}

            <div className="py-2">
              <div className="h-px bg-[#e1ebe1] w-full" />
            </div>

            {/* Conformité & Droits */}
            <div className="px-3 py-1 text-[11px] font-bold text-[#6e7a72] uppercase tracking-wider">
              Conformité &amp; Sécurité
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenLegalModal('confidentialite');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-10 px-3 rounded-xl text-[#3e4942] hover:bg-[#ecf6ed] text-xs font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[18px]">privacy_tip</span>
              <span>Politique de Confidentialité</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenLegalModal('mentions');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-10 px-3 rounded-xl text-[#3e4942] hover:bg-[#ecf6ed] text-xs font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[18px]">info</span>
              <span>Mentions Légales</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenLegalModal('cgu');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-10 px-3 rounded-xl text-[#3e4942] hover:bg-[#ecf6ed] text-xs font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[18px]">gavel</span>
              <span>Conditions d'Utilisation (CGU)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenLegalModal('litiges');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-10 px-3 rounded-xl text-[#3e4942] hover:bg-[#ecf6ed] text-xs font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[18px]">payments</span>
              <span>Paiements, Devis &amp; Litiges</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenLegalModal('cookies');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-10 px-3 rounded-xl text-[#3e4942] hover:bg-[#ecf6ed] text-xs font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[18px]">cookie</span>
              <span>Préférences des cookies</span>
            </button>

            <div className="py-2">
              <div className="h-px bg-[#e1ebe1] w-full" />
            </div>

            <div className="p-3.5 bg-[#f2fcf2] rounded-2xl border border-[#dbe5dc] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#006946]">
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                  <span>Assistance MboaFacile</span>
                </div>
                <span className="text-[10px] font-bold text-[#006946] bg-[#bfecdc] px-1.5 py-0.5 rounded-full">
                  7j/7 • 24h/24
                </span>
              </div>
              <p className="text-xs text-[#6e7a72] leading-tight">
                Une question ou urgence ? Notre service client à Douala vous répond immédiatement :
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="https://wa.me/237686942622?text=Bonjour%20MboaFacile,%20j'ai%20besoin%20d'aide"
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-2.5 rounded-xl bg-[#bfecdc] hover:bg-[#a4d0c0] text-[#006946] text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>686 94 26 22</span>
                </a>
                <a
                  href="tel:+237654475764"
                  className="h-9 px-2.5 rounded-xl bg-[#006946] hover:bg-[#005236] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>654 47 57 64</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-[#e1ebe1] text-[11px] text-[#6e7a72] flex items-center justify-between">
            <span>© 2025 MboaFacile Cameroun</span>
            <span className="font-semibold text-[#006946]">v2.4 Certifié</span>
          </div>
        </div>
      </aside>
    </>
  );
};
