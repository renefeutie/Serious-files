import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ARTISANS, INITIAL_USER_REQUESTS, Artisan, UserRequest } from './data/mockData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Drawer } from './components/Drawer';
import { BottomNav } from './components/BottomNav';
import { Toast, ToastMessage } from './components/Toast';
import { CitySelectorModal } from './components/CitySelectorModal';
import { ProRegistrationModal } from './components/ProRegistrationModal';
import { LegalModal, LegalTab } from './components/LegalModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { RoleSelectionModal } from './components/RoleSelectionModal';
import { HomeView } from './views/HomeView';
import { ExplorerView } from './views/ExplorerView';
import { ArtisanDetailView } from './views/ArtisanDetailView';
import { DevisWizardView } from './views/DevisWizardView';
import { DemandesView } from './views/DemandesView';
import { ProfileView } from './views/ProfileView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { MerchantDashboardView } from './views/MerchantDashboardView';
import { RegisterBusinessView } from './views/RegisterBusinessView';

function AppContent() {
  const { user, userFavorites, toggleFavoriteInDb } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('accueil');
  const [selectedArtisanId, setSelectedArtisanId] = useState<string>('talla-eric');
  const [currentCity, setCurrentCity] = useState<string>('Douala');
  const [currentDistrict, setCurrentDistrict] = useState<string>('Akwa');

  // Local favorites fallback for guest users
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(new Set(['talla-eric']));

  // Merged favorites (uses Firestore userFavorites when logged in)
  const activeFavorites = user ? userFavorites : localFavorites;

  // User requests state
  const [requests, setRequests] = useState<UserRequest[]>(INITIAL_USER_REQUESTS);

  // Quota Defense state for Google Maps Demo Key
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Sync URL hash with routes (/connexion, /inscription, /mon-profil, /espace-commercant, /inscrire-mon-commerce, /mot-de-passe-oublie)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').replace('/', '');
      if (
        [
          'accueil',
          'explorer',
          'devis',
          'demandes',
          'compte',
          'mon-profil',
          'connexion',
          'inscription',
          'mot-de-passe-oublie',
          'espace-commercant',
          'inscrire-mon-commerce',
        ].includes(hash)
      ) {
        setCurrentTab(hash === 'compte' ? 'mon-profil' : hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Modals & Drawers state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('confidentialite');
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search carryover state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('Akwa');

  // Quote Wizard Preset
  const [quotePreset, setQuotePreset] = useState<{
    artisan?: Artisan;
    categoryId?: string;
    urgency?: string;
  }>({});

  const handleOpenLegalModal = (tab: LegalTab = 'confidentialite') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const handleToggleFavorite = async (artisanId: string) => {
    if (user) {
      const isFav = await toggleFavoriteInDb(artisanId);
      showToast(isFav ? 'Artisan ajouté à vos favoris !' : 'Artisan retiré des favoris', isFav ? 'success' : 'info');
    } else {
      setLocalFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(artisanId)) {
          next.delete(artisanId);
          showToast('Artisan retiré des favoris', 'info');
        } else {
          next.add(artisanId);
          showToast('Artisan ajouté à vos favoris !', 'success');
        }
        return next;
      });
    }
  };

  const handleNavigate = (tab: string, artisanId?: string) => {
    if (artisanId) {
      setSelectedArtisanId(artisanId);
    }
    const targetTab = tab === 'compte' ? 'mon-profil' : tab;
    setCurrentTab(targetTab);
    window.location.hash = `#${targetTab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuote = (artisan?: Artisan, categoryId?: string, urgency?: string) => {
    setQuotePreset({ artisan, categoryId, urgency });
    handleNavigate('devis');
  };

  const handleSearchFromHome = (query: string, district?: string) => {
    setSearchQuery(query);
    if (district) setSearchDistrict(district);
  };

  const handleAddRequest = (newReq: UserRequest) => {
    setRequests([newReq, ...requests]);
  };

  const handleUpdateRequestStatus = (
    id: string,
    newStatus: UserRequest['status'],
    newStatusLabel: string
  ) => {
    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, status: newStatus, statusLabel: newStatusLabel } : r
      )
    );
  };

  const selectedArtisan = ARTISANS.find((a) => a.id === selectedArtisanId) || ARTISANS[0];
  const activeDemandesCount = requests.filter((r) => r.status !== 'termine').length;

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      libraries={['places', 'marker', 'geometry', 'core']}
      language="fr"
      region="CM"
    >
      <div className="min-h-screen bg-[#f2fcf2] text-[#151e18] flex flex-col font-sans">
        {/* Tier 2 Quota Defense Sticky Amber Banner */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-between gap-3">
            <span className="flex-1 text-center">
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
            <button
              type="button"
              onClick={() => setQuotaExceeded(false)}
              className="text-amber-900 hover:text-amber-950 p-1 rounded-sm shrink-0"
              aria-label="Fermer l'alerte"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Toast notifications */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Role Selection Modal for first-time Google sign-in */}
        <RoleSelectionModal />

        {/* Global Header */}
        <Header
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenCitySelector={() => setIsCityModalOpen(true)}
          currentDistrict={currentDistrict}
          currentCity={currentCity}
          favoritesCount={activeFavorites.size}
        />

        {/* Slide-in Drawer */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={handleNavigate}
          onOpenProModal={() => setIsProModalOpen(true)}
          onOpenLegalModal={handleOpenLegalModal}
        />

        {/* City & District Selector Modal */}
        <CitySelectorModal
          isOpen={isCityModalOpen}
          onClose={() => setIsCityModalOpen(false)}
          currentDistrict={currentDistrict}
          onSelectDistrict={(district, city) => {
            setCurrentDistrict(district);
            setCurrentCity(city);
            setSearchDistrict(district);
            showToast(`Zone d’intervention mise à jour : ${district} (${city})`);
          }}
        />

        {/* Pro Registration Modal (Legacy shortcut preserved) */}
        <ProRegistrationModal
          isOpen={isProModalOpen}
          onClose={() => setIsProModalOpen(false)}
          onOpenPrivacyPolicy={() => handleOpenLegalModal('confidentialite')}
          onSubmitSuccess={(artisanName) => {
            showToast(`Merci ${artisanName} ! Votre dossier a été transmis à l'équipe de vérification de Douala.`);
          }}
        />

        {/* Legal & Compliance Modal */}
        <LegalModal
          isOpen={isLegalModalOpen}
          initialTab={legalModalTab}
          onClose={() => setIsLegalModalOpen(false)}
          onOpenCookiePreferences={() => setIsCookieModalOpen(true)}
        />

        {/* Cookie & Consent Manager Banner */}
        <CookieConsentBanner
          onOpenPrivacyPolicy={() => handleOpenLegalModal('confidentialite')}
          isOpenExplicitly={isCookieModalOpen}
          onCloseExplicitModal={() => setIsCookieModalOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full pt-16">
          {currentTab === 'accueil' && (
            <HomeView
              onNavigate={handleNavigate}
              onOpenCitySelector={() => setIsCityModalOpen(true)}
              currentDistrict={currentDistrict}
              currentCity={currentCity}
              onOpenProModal={() => setIsProModalOpen(true)}
              onToggleFavorite={handleToggleFavorite}
              favorites={activeFavorites}
              onStartQuote={handleStartQuote}
              onSearch={handleSearchFromHome}
              onOpenLegalModal={handleOpenLegalModal}
            />
          )}

          {currentTab === 'explorer' && (
            <ExplorerView
              initialQuery={searchQuery}
              initialDistrict={searchDistrict}
              currentCity={currentCity}
              currentDistrict={currentDistrict}
              onOpenCitySelector={() => setIsCityModalOpen(true)}
              onNavigate={handleNavigate}
              onToggleFavorite={handleToggleFavorite}
              favorites={activeFavorites}
              onStartQuote={handleStartQuote}
              onShowToast={(msg) => showToast(msg)}
              onOpenPrivacyPolicy={() => handleOpenLegalModal('confidentialite')}
            />
          )}

          {currentTab === 'artisan' && (
            <ArtisanDetailView
              artisan={selectedArtisan}
              onBack={() => handleNavigate('explorer')}
              onStartQuote={handleStartQuote}
              onShowToast={(msg) => showToast(msg)}
              onNavigate={handleNavigate}
              onOpenPrivacyPolicy={() => handleOpenLegalModal('confidentialite')}
            />
          )}

          {currentTab === 'devis' && (
            <DevisWizardView
              initialArtisan={quotePreset.artisan}
              initialCategory={quotePreset.categoryId}
              initialUrgency={quotePreset.urgency}
              onNavigate={handleNavigate}
              onAddRequest={handleAddRequest}
              onShowToast={(msg) => showToast(msg)}
              onOpenPrivacyPolicy={() => handleOpenLegalModal('confidentialite')}
            />
          )}

          {currentTab === 'demandes' && (
            <DemandesView
              requests={requests}
              onNavigate={handleNavigate}
              onShowToast={(msg) => showToast(msg)}
              onUpdateRequestStatus={handleUpdateRequestStatus}
            />
          )}

          {(currentTab === 'compte' || currentTab === 'mon-profil') && (
            <ProfileView
              onNavigate={handleNavigate}
              onShowToast={(msg, type) => showToast(msg, type)}
              onStartQuote={handleStartQuote}
            />
          )}

          {currentTab === 'connexion' && (
            <LoginView
              onNavigate={handleNavigate}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {currentTab === 'inscription' && (
            <RegisterView
              onNavigate={handleNavigate}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {currentTab === 'mot-de-passe-oublie' && (
            <ForgotPasswordView
              onNavigate={handleNavigate}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {currentTab === 'espace-commercant' && (
            <MerchantDashboardView
              onNavigate={handleNavigate}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}

          {currentTab === 'inscrire-mon-commerce' && (
            <RegisterBusinessView
              onNavigate={handleNavigate}
              onShowToast={(msg, type) => showToast(msg, type)}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onNavigate={handleNavigate}
          demandesCount={activeDemandesCount}
        />
      </div>
    </APIProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
