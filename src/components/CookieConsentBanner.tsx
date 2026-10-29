import React, { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean; // Always true
  preferences: boolean;
  analytics: boolean;
  timestamp: string;
  hasConsented: boolean;
}

const STORAGE_KEY = 'mboafacile_cookie_consent_v1';

export function getSavedCookieConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

export function saveCookieConsent(prefs: Partial<CookiePreferences>) {
  try {
    const payload: CookiePreferences = {
      essential: true,
      preferences: prefs.preferences ?? false,
      analytics: prefs.analytics ?? false,
      timestamp: new Date().toISOString(),
      hasConsented: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
  isOpenExplicitly?: boolean;
  onCloseExplicitModal?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacyPolicy,
  isOpenExplicitly = false,
  onCloseExplicitModal,
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [preferencesChecked, setPreferencesChecked] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  useEffect(() => {
    const existing = getSavedCookieConsent();
    if (!existing) {
      setShowBanner(true);
    } else {
      setPreferencesChecked(existing.preferences);
      setAnalyticsChecked(existing.analytics);
    }
  }, []);

  useEffect(() => {
    if (isOpenExplicitly) {
      const existing = getSavedCookieConsent();
      if (existing) {
        setPreferencesChecked(existing.preferences);
        setAnalyticsChecked(existing.analytics);
      }
      setShowCustomizeModal(true);
    }
  }, [isOpenExplicitly]);

  const handleAcceptAll = () => {
    saveCookieConsent({ preferences: true, analytics: true });
    setShowBanner(false);
    setShowCustomizeModal(false);
    onCloseExplicitModal?.();
  };

  const handleRefuseAll = () => {
    saveCookieConsent({ preferences: false, analytics: false });
    setShowBanner(false);
    setShowCustomizeModal(false);
    onCloseExplicitModal?.();
  };

  const handleSaveCustomized = () => {
    saveCookieConsent({ preferences: preferencesChecked, analytics: analyticsChecked });
    setShowBanner(false);
    setShowCustomizeModal(false);
    onCloseExplicitModal?.();
  };

  if (!showBanner && !showCustomizeModal) return null;

  return (
    <>
      {/* Banner docked at bottom if not yet answered */}
      {showBanner && !showCustomizeModal && (
        <aside
          role="region"
          aria-label="Gestion des cookies et données personnelles"
          className="fixed bottom-0 inset-x-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-[#dbe5dc] shadow-2xl transition-all animate-in slide-in-from-bottom-4"
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[22px]">cookie</span>
              </div>
              <div className="text-xs text-[#3e4942] leading-relaxed">
                <p className="font-bold text-sm text-[#151e18] mb-0.5">
                  Respect de votre vie privée &amp; gestion des cookies
                </p>
                <p>
                  MboaFacile utilise des technologies locales strictement nécessaires au bon fonctionnement de la plateforme
                  (mise en relation avec les artisans, mémorisation de vos devis). Nous vous laissons le plein contrôle sur les
                  préférences de localisation et la mesure d'audience anonymisée.{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacyPolicy}
                    className="text-[#006946] font-semibold underline hover:text-[#005236] focus-visible:ring-2 focus-visible:ring-[#006946] rounded-xs"
                  >
                    Consulter notre politique de confidentialité
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowCustomizeModal(true)}
                className="h-10 px-3.5 rounded-xl border border-[#dbe5dc] bg-white text-xs font-bold text-[#151e18] hover:bg-[#ecf6ed] transition-colors focus-visible:ring-2 focus-visible:ring-[#006946]"
              >
                Personnaliser
              </button>
              <button
                type="button"
                onClick={handleRefuseAll}
                className="h-10 px-3.5 rounded-xl border border-[#dbe5dc] bg-white text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors focus-visible:ring-2 focus-visible:ring-[#ba1a1a]"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="h-10 px-4 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#006946]"
              >
                Tout accepter
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Modal for granular customization */}
      {showCustomizeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-[#e1ebe1] max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1ebe1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h3 id="cookie-modal-title" className="text-base font-bold text-[#151e18]">
                    Centre de préférences des traceurs
                  </h3>
                  <p className="text-xs text-[#6e7a72]">Gérez vos consentements en toute transparence</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCustomizeModal(false);
                  onCloseExplicitModal?.();
                }}
                className="w-9 h-9 rounded-full bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e6f1e7] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#006946]"
                aria-label="Fermer la boîte de dialogue"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-[#3e4942]">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 rounded-2xl bg-[#f2fcf2] border border-[#dbe5dc] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#151e18] text-sm">Traceurs essentiels &amp; techniques</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#bfecdc] text-[#006946]">
                      Toujours actif
                    </span>
                  </div>
                  <p className="text-[#6e7a72] leading-relaxed">
                    Nécessaires au maintien de votre session sécurisée, à la mémorisation de vos demandes de devis et à la protection anti-CSRF / anti-abus. Ces témoins ne peuvent pas être désactivés.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  aria-label="Traceurs essentiels obligatoires"
                  className="w-4 h-4 rounded text-[#006946] accent-[#006946] cursor-not-allowed opacity-75 mt-1"
                />
              </div>

              {/* Category 2: Preferences */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#dbe5dc] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label htmlFor="pref-cookies" className="font-bold text-[#151e18] text-sm cursor-pointer">
                      Préférences de navigation
                    </label>
                  </div>
                  <p className="text-[#6e7a72] leading-relaxed">
                    Permet d'enregistrer votre quartier par défaut (Akwa, Bonapriso, Makepe...) et vos artisans favoris pour ne pas avoir à les ressaisir lors de vos prochaines visites.
                  </p>
                </div>
                <input
                  id="pref-cookies"
                  type="checkbox"
                  checked={preferencesChecked}
                  onChange={(e) => setPreferencesChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-[#006946] accent-[#006946] cursor-pointer mt-1 focus-visible:ring-2 focus-visible:ring-[#006946]"
                />
              </div>

              {/* Category 3: Privacy-Preserving Analytics */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#dbe5dc] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label htmlFor="analytics-cookies" className="font-bold text-[#151e18] text-sm cursor-pointer">
                      Mesure d'audience anonymisée
                    </label>
                  </div>
                  <p className="text-[#6e7a72] leading-relaxed">
                    Nous aide à mesurer anonymement le volume de devis consultés afin d'améliorer la disponibilité des artisans dans les quartiers de Douala et Yaoundé. Aucune donnée d'identification n'est transmise à des tiers publicitaires.
                  </p>
                </div>
                <input
                  id="analytics-cookies"
                  type="checkbox"
                  checked={analyticsChecked}
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-[#006946] accent-[#006946] cursor-pointer mt-1 focus-visible:ring-2 focus-visible:ring-[#006946]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#e1ebe1] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRefuseAll}
                className="h-10 px-3 rounded-xl text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
              >
                Tout refuser
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustomized}
                  className="h-10 px-4 rounded-xl border border-[#006946] text-[#006946] hover:bg-[#ecf6ed] text-xs font-bold transition-colors"
                >
                  Enregistrer mes choix
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="h-10 px-4 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
