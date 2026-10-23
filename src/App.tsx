import React, { useState } from 'react';
import { ARTISANS, INITIAL_USER_REQUESTS, Artisan, UserRequest } from './data/mockData';
import { Header } from './components/Header';
import { Drawer } from './components/Drawer';
import { BottomNav } from './components/BottomNav';
import { Toast, ToastMessage } from './components/Toast';
import { CitySelectorModal } from './components/CitySelectorModal';
import { ProRegistrationModal } from './components/ProRegistrationModal';
import { HomeView } from './views/HomeView';
import { ExplorerView } from './views/ExplorerView';
import { ArtisanDetailView } from './views/ArtisanDetailView';
import { DevisWizardView } from './views/DevisWizardView';
import { DemandesView } from './views/DemandesView';
import { CompteView } from './views/CompteView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('accueil');
  const [selectedArtisanId, setSelectedArtisanId] = useState<string>('talla-eric');
  const [currentCity, setCurrentCity] = useState<string>('Douala');
  const [currentDistrict, setCurrentDistrict] = useState<string>('Akwa');

  // Favorites state (initialize with Talla Éric in favorites as shown in mockups)
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['talla-eric']));

  // User requests state
  const [requests, setRequests] = useState<UserRequest[]>(INITIAL_USER_REQUESTS);

  // Modals & Drawers state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
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

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const handleToggleFavorite = (artisanId: string) => {
    setFavorites((prev) => {
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
  };

  const handleNavigate = (tab: string, artisanId?: string) => {
    if (artisanId) {
      setSelectedArtisanId(artisanId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuote = (artisan?: Artisan, categoryId?: string, urgency?: string) => {
    setQuotePreset({ artisan, categoryId, urgency });
    setCurrentTab('devis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen bg-[#f2fcf2] text-[#151e18] flex flex-col font-sans">
      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Global Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenCitySelector={() => setIsCityModalOpen(true)}
        currentDistrict={currentDistrict}
        currentCity={currentCity}
        favoritesCount={favorites.size}
      />

      {/* Slide-in Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
        onOpenProModal={() => setIsProModalOpen(true)}
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

      {/* Pro Registration Modal */}
      <ProRegistrationModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onSubmitSuccess={(artisanName) => {
          showToast(`Merci ${artisanName} ! Votre dossier a été transmis à l'équipe de vérification de Douala.`);
        }}
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
            favorites={favorites}
            onStartQuote={handleStartQuote}
            onSearch={handleSearchFromHome}
          />
        )}

        {currentTab === 'explorer' && (
          <ExplorerView
            initialQuery={searchQuery}
            initialDistrict={searchDistrict}
            onNavigate={handleNavigate}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            onStartQuote={handleStartQuote}
            onShowToast={(msg) => showToast(msg)}
          />
        )}

        {currentTab === 'artisan' && (
          <ArtisanDetailView
            artisan={selectedArtisan}
            onBack={() => handleNavigate('explorer')}
            onStartQuote={handleStartQuote}
            onShowToast={(msg) => showToast(msg)}
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

        {currentTab === 'compte' && (
          <CompteView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
            onOpenCitySelector={() => setIsCityModalOpen(true)}
            onOpenProModal={() => setIsProModalOpen(true)}
            currentCity={currentCity}
            currentDistrict={currentDistrict}
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
  );
}
