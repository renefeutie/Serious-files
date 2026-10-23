import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, artisanId?: string) => void;
  onOpenProModal: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenProModal,
}) => {
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
                onNavigate('carte');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-11 px-3 rounded-xl text-[#151e18] hover:bg-[#ecf6ed] text-sm font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#006946] text-[22px]">pin_drop</span>
              <span>Suivi technicien (Google Maps)</span>
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

            {/* Pro section */}
            <button
              type="button"
              onClick={() => {
                onOpenProModal();
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-11 px-3 rounded-xl bg-[#ffddb4]/40 text-[#7f5200] hover:bg-[#ffddb4]/70 text-sm font-bold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#a06800] text-[22px]">handyman</span>
              <span>Devenir prestataire certifié</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('compte');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 h-11 px-3 rounded-xl text-[#151e18] hover:bg-[#ecf6ed] text-sm font-semibold transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[#3d665a] text-[22px]">person</span>
              <span>Mon espace client</span>
            </button>

            <div className="py-2">
              <div className="h-px bg-[#e1ebe1] w-full" />
            </div>

            <div className="p-3 bg-[#f2fcf2] rounded-xl border border-[#dbe5dc]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#006946] mb-1">
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                Assistance MboaFacile
              </div>
              <p className="text-xs text-[#6e7a72] mb-2">
                Un problème avec une intervention ? Notre équipe à Akwa vous assiste 7j/7.
              </p>
              <a
                href="https://wa.me/237699452180?text=Bonjour%20MboaFacile,%20j'ai%20besoin%20d'aide"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006946] hover:underline"
              >
                <span>Contacter le support WhatsApp</span>
                <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
              </a>
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
