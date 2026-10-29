import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ARTISANS, CITY_COORDINATES, DISTRICT_COORDINATES, Artisan } from '../data/mockData';
import { checkRateLimit, recordActionTimestamp, sanitizeInput } from '../utils/security';
import { removeAccents } from '../utils/textUtils';

export interface GooglePlaceResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  phone?: string;
  isOpenNow?: boolean;
  googleMapsUri?: string;
  categoryLabel?: string;
}

interface NeighborhoodMapExplorerProps {
  currentCity: string;
  currentDistrict: string;
  onSelectArtisan: (artisanId: string) => void;
  onStartQuote: (artisan?: Artisan) => void;
  onShowToast: (msg: string) => void;
  onOpenCitySelector?: () => void;
}

const CATEGORY_SHORTCUTS = [
  { label: 'Tous les services', query: 'services commerces artisanat' },
  { label: '🔧 Plomberie & Sanitaire', query: 'plombier sanitaire tuyauterie' },
  { label: '⚡ Électricité & Climatisation', query: 'electricien depannage climatisation' },
  { label: '🚗 Garages & Auto', query: 'garage automobile mecanique carrosserie' },
  { label: '💇 Coiffure & Salons', query: 'salon de coiffure beaute esthetique' },
  { label: '🔩 Quincailleries', query: 'quincaillerie materiaux outillage' },
  { label: '🛒 Boutiques & Marchés', query: 'superette boutique alimentation' },
];

export const NeighborhoodMapExplorer: React.FC<NeighborhoodMapExplorerProps> = ({
  currentCity,
  currentDistrict,
  onSelectArtisan,
  onStartQuote,
  onShowToast,
  onOpenCitySelector,
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  // Center coordinate calculation based on city and district
  const defaultCenter = useMemo(() => {
    if (currentDistrict && DISTRICT_COORDINATES[currentDistrict]) {
      return DISTRICT_COORDINATES[currentDistrict];
    }
    return CITY_COORDINATES[currentCity] || CITY_COORDINATES['Douala'];
  }, [currentCity, currentDistrict]);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeoConsentModalOpen, setIsGeoConsentModalOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [geoErrorMessage, setGeoErrorMessage] = useState<string | null>(null);

  // Search & Places state
  const [searchPlaceQuery, setSearchPlaceQuery] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [placesResults, setPlacesResults] = useState<GooglePlaceResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // Selected item on map (for InfoWindow / Card preview)
  const [selectedArtisanMarker, setSelectedArtisanMarker] = useState<Artisan | null>(null);
  const [selectedPlaceMarker, setSelectedPlaceMarker] = useState<GooglePlaceResult | null>(null);

  // Active filter layer
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showGooglePlaces, setShowGooglePlaces] = useState(true);

  // MboaFacile artisans matching the city
  const cityArtisans = useMemo(() => {
    return ARTISANS.filter((a) => {
      const matchCity = removeAccents(a.city).includes(removeAccents(currentCity));
      if (!matchCity) return false;
      if (showVerifiedOnly && !a.cniVerified) return false;
      return true;
    });
  }, [currentCity, showVerifiedOnly]);

  // Pan to center when city/district change
  useEffect(() => {
    if (map && defaultCenter) {
      map.panTo(defaultCenter);
      map.setZoom(13);
    }
  }, [map, defaultCenter]);

  // Places Search implementation with Places API (New)
  const searchGooglePlaces = useCallback(
    async (queryText: string, searchCenter?: { lat: number; lng: number }) => {
      if (!placesLib) return;

      const rateLimit = checkRateLimit('gmp_places_search', 1500, false);
      if (!rateLimit.allowed) {
        onShowToast('Veuillez patienter un instant avant la prochaine recherche de lieux.');
        return;
      }

      recordActionTimestamp('gmp_places_search');
      setIsSearchingPlaces(true);
      setPlacesError(null);

      const centerCoord = searchCenter || userLocation || defaultCenter;
      const combinedQuery = `${queryText} ${currentCity} Cameroun`.trim();

      try {
        if (placesLib.Place && typeof placesLib.Place.searchByText === 'function') {
          const response = await placesLib.Place.searchByText({
            textQuery: combinedQuery,
            fields: [
              'id',
              'displayName',
              'formattedAddress',
              'location',
              'rating',
              'userRatingCount',
              'googleMapsURI',
              'nationalPhoneNumber',
              'regularOpeningHours',
              'types',
            ],
            locationBias: {
              center: centerCoord,
              radius: 6000,
            },
            maxResultCount: 12,
          });

          const places = (response.places || []).map((p: any) => {
            const latVal = typeof p.location?.lat === 'function' ? p.location.lat() : p.location?.lat;
            const lngVal = typeof p.location?.lng === 'function' ? p.location.lng() : p.location?.lng;
            const nameStr =
              typeof p.displayName === 'string'
                ? p.displayName
                : p.displayName?.text || 'Commerce / Service';

            const isOpen = p.regularOpeningHours?.isOpen
              ? typeof p.regularOpeningHours.isOpen === 'function'
                ? p.regularOpeningHours.isOpen()
                : p.regularOpeningHours.isOpen
              : undefined;

            return {
              id: p.id || String(Math.random()),
              name: nameStr,
              address: p.formattedAddress || `${currentDistrict || currentCity}, Cameroun`,
              lat: Number(latVal) || centerCoord.lat,
              lng: Number(lngVal) || centerCoord.lng,
              rating: p.rating,
              userRatingCount: p.userRatingCount,
              phone: p.nationalPhoneNumber,
              isOpenNow: isOpen,
              googleMapsUri: p.googleMapsURI,
              categoryLabel: p.types?.[0]?.replace(/_/g, ' ') || 'Point d’intérêt',
            } as GooglePlaceResult;
          });

          setPlacesResults(places);
          if (places.length === 0) {
            setPlacesError(`Aucun lieu Google trouvé pour « ${queryText} » à ${currentCity}.`);
          } else {
            onShowToast(`${places.length} lieux trouvés autour de votre zone.`);
          }
        } else {
          // Graceful fallback if Places library is loading
          setPlacesError('Service de recherche de lieux en cours de chargement.');
        }
      } catch (err: any) {
        console.warn('Google Places search warning:', err?.message || err);
        setPlacesError('Recherche temporairement limitée ou indisponible.');
      } finally {
        setIsSearchingPlaces(false);
      }
    },
    [placesLib, userLocation, defaultCenter, currentCity, currentDistrict, onShowToast]
  );

  // Trigger search on category change
  useEffect(() => {
    const selectedCat = CATEGORY_SHORTCUTS[selectedCategoryIndex];
    if (selectedCat && placesLib) {
      searchGooglePlaces(selectedCat.query);
    }
  }, [selectedCategoryIndex, placesLib, searchGooglePlaces]);

  // Geolocation trigger handler with explicit modal
  const handleRequestGeolocation = () => {
    setIsGeoConsentModalOpen(true);
  };

  const handleConfirmGeolocation = () => {
    setIsGeoConsentModalOpen(false);
    if (!('geolocation' in navigator)) {
      setGeoStatus('denied');
      setGeoErrorMessage('La géolocalisation n’est pas supportée par votre navigateur.');
      onShowToast('Navigateur incompatible avec la géolocalisation.');
      return;
    }

    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setGeoStatus('granted');
        setGeoErrorMessage(null);
        if (map) {
          map.panTo(coords);
          map.setZoom(14);
        }
        onShowToast('Position détectée avec succès !');
        // Search places around user
        const currentQuery = CATEGORY_SHORTCUTS[selectedCategoryIndex]?.query || 'artisans commerces';
        searchGooglePlaces(currentQuery, coords);
      },
      (error) => {
        setGeoStatus('denied');
        let errDesc = 'Autorisation de géolocalisation refusée.';
        if (error.code === error.POSITION_UNAVAILABLE) {
          errDesc = 'Signal GPS introuvable. Sélection manuelle activée.';
        } else if (error.code === error.TIMEOUT) {
          errDesc = 'Délai d’attente dépassé. Sélection manuelle disponible.';
        }
        setGeoErrorMessage(errDesc);
        onShowToast(errDesc);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleTextSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeInput(searchPlaceQuery.trim(), 80);
    if (!clean) return;
    searchGooglePlaces(clean);
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Header & Controls Deck */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#dbe5dc] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecf6ed] text-[#006946] text-xs font-bold mb-1">
              <span className="material-symbols-outlined text-[16px]">explore</span>
              <span>Cartographie Interactive & Proximité</span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-[#151e18]">
              Explorer autour de moi ({currentCity})
            </h2>
            <p className="text-xs text-[#6e7a72]">
              Repérez les artisans certifiés MboaFacile et les services essentiels référencés sur Google Maps.
            </p>
          </div>

          {/* Action buttons: Around Me & City Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestGeolocation}
              disabled={geoStatus === 'locating'}
              className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                geoStatus === 'granted'
                  ? 'bg-[#006946] text-white'
                  : 'bg-[#bfecdc] hover:bg-[#a3e2cd] text-[#006946]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {geoStatus === 'locating' ? 'progress_activity' : 'my_location'}
              </span>
              <span>
                {geoStatus === 'locating'
                  ? 'Localisation...'
                  : geoStatus === 'granted'
                  ? 'Autour de moi (Actif)'
                  : 'Autour de moi'}
              </span>
            </button>

            {onOpenCitySelector && (
              <button
                type="button"
                onClick={onOpenCitySelector}
                className="h-10 px-3 rounded-xl bg-[#f2fcf2] hover:bg-[#e1ebe1] text-[#151e18] text-xs font-semibold border border-[#dbe5dc] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006946]">location_city</span>
                <span>Changer de ville</span>
              </button>
            )}
          </div>
        </div>

        {/* Fallback warning if geolocation was denied */}
        {geoStatus === 'denied' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-600">location_disabled</span>
              <span>
                {geoErrorMessage || 'Localisation non partagée.'} La carte reste centrée sur le quartier <strong>{currentDistrict || 'Akwa'} ({currentCity})</strong>.
              </span>
            </div>
            {onOpenCitySelector && (
              <button
                type="button"
                onClick={onOpenCitySelector}
                className="text-amber-800 font-bold underline shrink-0 hover:text-amber-900"
              >
                Choisir un quartier
              </button>
            )}
          </div>
        )}

        {/* Text Search Bar for Places & Services */}
        <form onSubmit={handleTextSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#006946]">
              search
            </span>
            <input
              type="search"
              value={searchPlaceQuery}
              onChange={(e) => setSearchPlaceQuery(e.target.value)}
              placeholder="Rechercher un service Google (ex: garage Bonanjo, boulangerie, quincaillerie)..."
              className="w-full h-10 pl-9 pr-20 bg-[#f2fcf2] text-xs font-medium text-[#151e18] rounded-xl border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946]"
            />
            {searchPlaceQuery && (
              <button
                type="button"
                onClick={() => setSearchPlaceQuery('')}
                className="absolute right-12 top-2.5 text-[#6e7a72] hover:text-[#151e18]"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isSearchingPlaces}
              className="absolute right-1.5 top-1.5 h-7 px-2.5 rounded-lg bg-[#006946] text-white text-[11px] font-bold hover:bg-[#16845b]"
            >
              {isSearchingPlaces ? '...' : 'Chercher'}
            </button>
          </div>
        </form>

        {/* Category Shortcut Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_SHORTCUTS.map((cat, idx) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setSelectedCategoryIndex(idx)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategoryIndex === idx
                  ? 'bg-[#006946] text-white shadow-xs'
                  : 'bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e1ebe1] border border-[#dbe5dc]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Layer Filters & Data Distinction Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#e1ebe1] text-xs">
          <div className="flex items-center gap-3">
            {/* MboaFacile Legend */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <span className="w-3 h-3 rounded-full bg-[#006946] border-2 border-white shadow-xs" />
              <span className="font-bold text-[#006946]">Artisans Certifiés MboaFacile ({cityArtisans.length})</span>
            </label>

            {/* Google Places Legend */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <span className="w-3 h-3 rounded-full bg-[#2563eb] border-2 border-white shadow-xs" />
              <span className="font-semibold text-[#2563eb]">Lieux Google Maps ({placesResults.length})</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showVerifiedOnly
                  ? 'bg-[#006946] text-white border-[#006946]'
                  : 'bg-[#f2fcf2] text-[#3e4942] border-[#dbe5dc]'
              }`}
            >
              CNI Vérifiée uniquement
            </button>
            <button
              type="button"
              onClick={() => setShowGooglePlaces(!showGooglePlaces)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showGooglePlaces
                  ? 'bg-[#2563eb] text-white border-[#2563eb]'
                  : 'bg-[#f2fcf2] text-[#3e4942] border-[#dbe5dc]'
              }`}
            >
              {showGooglePlaces ? 'Masquer lieux Google' : 'Afficher lieux Google'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Container (Strictly Zero-Legacy & Explicit Height) */}
      <div className="relative w-full h-[460px] md:h-[520px] rounded-3xl overflow-hidden border border-[#dbe5dc] shadow-sm bg-[#e8f0e9]">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* User Location Pulse Marker */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Votre position actuelle">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-7 h-7 rounded-full bg-blue-500/30 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[13px]">person_pin</span>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* MboaFacile Certified Artisans Markers (Green) */}
          {cityArtisans.map((artisan) => {
            if (!artisan.lat || !artisan.lng) return null;
            return (
              <AdvancedMarker
                key={artisan.id}
                position={{ lat: artisan.lat, lng: artisan.lng }}
                title={`${artisan.name} • ${artisan.job}`}
                onClick={() => {
                  setSelectedPlaceMarker(null);
                  setSelectedArtisanMarker(artisan);
                }}
              >
                <div className="cursor-pointer group flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-full bg-[#006946] text-white text-[10px] font-bold shadow-md flex items-center gap-1 border border-white">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span className="max-w-[100px] truncate">{artisan.name}</span>
                  </div>
                  <Pin
                    background="#006946"
                    glyphColor="#ffffff"
                    borderColor="#00472e"
                    scale={1.1}
                  />
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Google Places Results Markers (Blue) */}
          {showGooglePlaces &&
            placesResults.map((place) => {
              return (
                <AdvancedMarker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  title={`${place.name} (Lieu Google)`}
                  onClick={() => {
                    setSelectedArtisanMarker(null);
                    setSelectedPlaceMarker(place);
                  }}
                >
                  <div className="cursor-pointer flex flex-col items-center">
                    <Pin
                      background="#2563eb"
                      glyphColor="#ffffff"
                      borderColor="#1e40af"
                      scale={0.9}
                    />
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* InfoWindow for MboaFacile Artisan */}
          {selectedArtisanMarker && selectedArtisanMarker.lat && selectedArtisanMarker.lng && (
            <InfoWindow
              position={{
                lat: selectedArtisanMarker.lat,
                lng: selectedArtisanMarker.lng,
              }}
              onCloseClick={() => setSelectedArtisanMarker(null)}
            >
              <div className="p-1 max-w-[240px] text-[#151e18] space-y-1.5 font-sans">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#006946] uppercase">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Artisan Certifié MboaFacile</span>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={selectedArtisanMarker.avatar}
                    alt={selectedArtisanMarker.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#dbe5dc]"
                  />
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{selectedArtisanMarker.name}</h4>
                    <p className="text-[11px] text-[#6e7a72] leading-tight">{selectedArtisanMarker.job}</p>
                    <p className="text-[10px] text-[#3e4942] font-semibold mt-0.5">
                      ★ {selectedArtisanMarker.rating} ({selectedArtisanMarker.reviewsCount} avis vérifiés)
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-[#3e4942] bg-[#f2fcf2] p-1.5 rounded-lg border border-[#dbe5dc]">
                  Quartier : <strong>{selectedArtisanMarker.district}</strong> • Dès {selectedArtisanMarker.startingPrice.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectArtisan(selectedArtisanMarker.id);
                      setSelectedArtisanMarker(null);
                    }}
                    className="flex-1 py-1 rounded-lg bg-[#ecf6ed] text-[#006946] text-[11px] font-bold hover:bg-[#dbe5dc]"
                  >
                    Voir profil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onStartQuote(selectedArtisanMarker);
                      setSelectedArtisanMarker(null);
                    }}
                    className="flex-1 py-1 rounded-lg bg-[#006946] text-white text-[11px] font-bold hover:bg-[#16845b]"
                  >
                    Devis direct
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow for Google Places Result */}
          {selectedPlaceMarker && (
            <InfoWindow
              position={{
                lat: selectedPlaceMarker.lat,
                lng: selectedPlaceMarker.lng,
              }}
              onCloseClick={() => setSelectedPlaceMarker(null)}
            >
              <div className="p-1 max-w-[240px] text-[#151e18] space-y-1.5 font-sans">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#2563eb] uppercase">
                  <span className="material-symbols-outlined text-[13px]">place</span>
                  <span>Lieu Google Maps (Non vérifié)</span>
                </div>
                <h4 className="text-xs font-bold leading-tight">{selectedPlaceMarker.name}</h4>
                <p className="text-[11px] text-[#6e7a72] leading-tight">{selectedPlaceMarker.address}</p>
                {selectedPlaceMarker.rating && (
                  <p className="text-[10px] text-[#3e4942] font-semibold">
                    ★ {selectedPlaceMarker.rating} ({selectedPlaceMarker.userRatingCount || 0} avis Google)
                  </p>
                )}
                {selectedPlaceMarker.phone && (
                  <p className="text-[10px] text-[#006946] font-semibold">
                    📞 {selectedPlaceMarker.phone}
                  </p>
                )}
                {selectedPlaceMarker.googleMapsUri && (
                  <a
                    href={selectedPlaceMarker.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563eb] hover:underline pt-1"
                  >
                    <span>Ouvrir sur Google Maps</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Loading overlay for Places API */}
        {isSearchingPlaces && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-[#dbe5dc] flex items-center gap-2 text-xs font-semibold text-[#006946] z-10">
            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            <span>Recherche des lieux à proximité...</span>
          </div>
        )}
      </div>

      {/* 3. Combined Results Feed below the map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#151e18]">
            Résultats à proximité ({cityArtisans.length} artisans vérifiés • {placesResults.length} lieux Google)
          </h3>
          <span className="text-xs text-[#6e7a72]">
            Zone : <strong>{currentDistrict || 'Akwa'}, {currentCity}</strong>
          </span>
        </div>

        {placesError && (
          <div className="p-3 rounded-2xl bg-white border border-[#dbe5dc] text-xs text-[#6e7a72] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#006946]">info</span>
            <span>{placesError}</span>
          </div>
        )}

        {/* Carousel / Grid of places cards with strict distinction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* MboaFacile Verified Highlight Card */}
          {cityArtisans.slice(0, 2).map((artisan) => (
            <div
              key={artisan.id}
              className="p-3.5 rounded-2xl bg-white border-2 border-[#006946]/30 shadow-xs flex flex-col justify-between hover:border-[#006946] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#bfecdc] text-[#006946] text-[10px] font-extrabold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>Artisan Certifié MboaFacile</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#ffb955] flex items-center gap-0.5">
                    ★ {artisan.rating} ({artisan.reviewsCount})
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <img
                    src={artisan.avatar}
                    alt={artisan.name}
                    className="w-11 h-11 rounded-full object-cover border border-[#bfecdc]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#151e18]">{artisan.name}</h4>
                    <p className="text-[11px] text-[#6e7a72]">{artisan.job}</p>
                    <p className="text-[10px] text-[#006946] font-semibold mt-0.5">
                      📍 Quartier {artisan.district} • Dès {artisan.startingPrice.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#e1ebe1]">
                <button
                  type="button"
                  onClick={() => onSelectArtisan(artisan.id)}
                  className="flex-1 py-1.5 rounded-xl bg-[#ecf6ed] text-[#006946] text-xs font-bold hover:bg-[#dbe5dc]"
                >
                  Fiche & Avis
                </button>
                <button
                  type="button"
                  onClick={() => onStartQuote(artisan)}
                  className="flex-1 py-1.5 rounded-xl bg-[#006946] text-white text-xs font-bold hover:bg-[#16845b]"
                >
                  Devis direct
                </button>
              </div>
            </div>
          ))}

          {/* Google Places Cards with Google Attribution & Disclaimer */}
          {showGooglePlaces &&
            placesResults.slice(0, 4).map((place) => (
              <div
                key={place.id}
                className="p-3.5 rounded-2xl bg-white border border-[#dbe5dc] shadow-xs flex flex-col justify-between hover:border-[#2563eb]/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563eb] text-[10px] font-bold flex items-center gap-1 border border-blue-200">
                      <span className="material-symbols-outlined text-[13px]">public</span>
                      <span>Lieu Référencé Google Maps</span>
                    </span>
                    {place.rating && (
                      <span className="text-[11px] font-bold text-amber-500">
                        ★ {place.rating} ({place.userRatingCount || 0})
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#151e18]">{place.name}</h4>
                  <p className="text-[11px] text-[#6e7a72] mt-0.5 leading-snug">{place.address}</p>
                  <p className="text-[10px] text-gray-500 italic mt-1">
                    Point d’intérêt public • Non affilié ni garanti par MboaFacile
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#e1ebe1]">
                  {place.phone ? (
                    <span className="text-[11px] font-semibold text-[#006946]">
                      📞 {place.phone}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#6e7a72]">Téléphone non renseigné</span>
                  )}
                  {place.googleMapsUri ? (
                    <a
                      href={place.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline"
                    >
                      <span>Voir sur Google</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 4. Explicit Geolocation Privacy Modal */}
      {isGeoConsentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-[#e1ebe1]">
            <div className="w-12 h-12 rounded-2xl bg-[#bfecdc] text-[#006946] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">my_location</span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#151e18]">
                Autoriser l’accès à votre position ?
              </h3>
              <p className="text-xs text-[#3e4942] leading-relaxed">
                MboaFacile utilise votre position géographique uniquement dans votre navigateur pour centrer la carte sur votre quartier et calculer la distance des artisans les plus proches à Douala ou Yaoundé.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#f2fcf2] border border-[#dbe5dc] text-[11px] text-[#3e4942] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#006946]">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>Protection des données personnelles (RGPD & Cameroun)</span>
              </div>
              <p className="text-[11px] text-[#6e7a72]">
                Aucun historique de géolocalisation n’est enregistré sur nos serveurs. Vous pouvez révoquer cette autorisation à tout moment dans les paramètres de votre navigateur.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsGeoConsentModalOpen(false);
                  setGeoStatus('denied');
                  setGeoErrorMessage('Recherche manuelle sélectionnée.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#ecf6ed] text-[#3e4942] font-semibold text-xs hover:bg-[#e1ebe1]"
              >
                Refuser / Saisie manuelle
              </button>
              <button
                type="button"
                onClick={handleConfirmGeolocation}
                className="flex-1 py-2.5 rounded-xl bg-[#006946] text-white font-bold text-xs hover:bg-[#16845b] shadow-xs"
              >
                Autoriser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
