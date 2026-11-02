import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ARTISANS, CITY_COORDINATES, DISTRICT_COORDINATES, Artisan } from '../data/mockData';
import { checkRateLimit, recordActionTimestamp, sanitizeInput } from '../utils/security';
import { removeAccents } from '../utils/textUtils';
import {
  NEARBY_CATEGORIES,
  NEARBY_RADIUS_OPTIONS,
  UnifiedNearbyItem,
  calculateHaversineDistanceKm,
  formatDistanceDisplay,
  buildGoogleMapsDirectionsUrl,
  interpretGeolocationError,
  NearbyCategoryOption,
} from '../utils/geoUtils';

interface NeighborhoodMapExplorerProps {
  currentCity: string;
  currentDistrict: string;
  onSelectArtisan: (artisanId: string) => void;
  onStartQuote: (artisan?: Artisan) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenCitySelector?: () => void;
}

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

  // Default coordinate calculation based on city and district
  const defaultCenter = useMemo(() => {
    if (currentDistrict && DISTRICT_COORDINATES[currentDistrict]) {
      return DISTRICT_COORDINATES[currentDistrict];
    }
    return CITY_COORDINATES[currentCity] || CITY_COORDINATES['Douala'];
  }, [currentCity, currentDistrict]);

  // 1. Geolocation State (Strictly triggered on user action, never automatically)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null); // in meters
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [geoErrorDetails, setGeoErrorDetails] = useState<{
    code?: number;
    title: string;
    message: string;
    isPermissionDenied: boolean;
    canRetry: boolean;
  } | null>(null);
  const [isGeoConsentModalOpen, setIsGeoConsentModalOpen] = useState(false);
  const [hasUserConsented, setHasUserConsented] = useState(false);

  // 2. Proximity Configuration: Radius & Category
  const [selectedRadiusMeters, setSelectedRadiusMeters] = useState<number>(3000); // 3 km default
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [textSearchQuery, setTextSearchQuery] = useState('');

  // 3. Search Results & Status
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'mboafacile' | 'google_places'>('all');

  // Results sets
  const [googlePlacesItems, setGooglePlacesItems] = useState<UnifiedNearbyItem[]>([]);
  const [firestoreApprovedBusinesses, setFirestoreApprovedBusinesses] = useState<UnifiedNearbyItem[]>([]);

  // Selected item on map (InfoWindow)
  const [selectedMarkerItem, setSelectedMarkerItem] = useState<UnifiedNearbyItem | null>(null);

  // Active anchor coordinates (either GPS position if granted, or district/city center)
  const activeAnchor = useMemo(() => {
    return userLocation || defaultCenter;
  }, [userLocation, defaultCenter]);

  // Active selected radius in kilometers
  const selectedRadiusKm = useMemo(() => {
    const opt = NEARBY_RADIUS_OPTIONS.find((r) => r.value === selectedRadiusMeters);
    return opt ? opt.km : 3.0;
  }, [selectedRadiusMeters]);

  // Active category definition
  const selectedCategory = useMemo(() => {
    return NEARBY_CATEGORIES.find((c) => c.id === selectedCategoryId) || NEARBY_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Pan to default center when city or district changes (if user hasn't located themselves)
  useEffect(() => {
    if (map && !userLocation && defaultCenter) {
      map.panTo(defaultCenter);
      map.setZoom(13);
    }
  }, [map, userLocation, defaultCenter]);

  // Load approved businesses from Firestore on mount or city change
  useEffect(() => {
    let isMounted = true;
    async function loadFirestoreBusinesses() {
      try {
        const q = query(collection(db, 'businesses'), where('status', '==', 'approved'));
        const snap = await getDocs(q);
        if (!isMounted) return;

        const list: UnifiedNearbyItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          // Find or fallback to district coordinates if lat/lng not specified
          const lat = typeof data.lat === 'number' ? data.lat : (data.district && DISTRICT_COORDINATES[data.district]?.lat);
          const lng = typeof data.lng === 'number' ? data.lng : (data.district && DISTRICT_COORDINATES[data.district]?.lng);

          if (lat && lng) {
            list.push({
              id: `fs-${docSnap.id}`,
              source: 'mboafacile',
              name: data.name || 'Commerce Certifié',
              jobOrCategory: data.job || data.category || 'Service Partenaire',
              address: data.address || `${data.district || ''}, ${data.city || currentCity}`,
              city: data.city || currentCity,
              district: data.district || '',
              lat,
              lng,
              distanceKm: 0, // computed dynamically
              distanceDisplay: '',
              phone: data.phone,
              whatsapp: data.whatsapp,
              cniVerified: Boolean(data.cniVerified),
              startingPrice: data.startingPrice,
              isOpenNow: true,
            });
          }
        });
        setFirestoreApprovedBusinesses(list);
      } catch (err) {
        // Unauthenticated or collection empty: continue gracefully
        console.debug('Firestore businesses query notice:', err);
      }
    }

    loadFirestoreBusinesses();
    return () => {
      isMounted = false;
    };
  }, [currentCity]);

  // Filter MboaFacile certified artisans & Firestore businesses based on anchor and radius
  const mboaFacileNearbyItems = useMemo(() => {
    const combined: UnifiedNearbyItem[] = [];

    // 1. Mock Artisans with coordinates
    ARTISANS.forEach((artisan) => {
      // Must match city
      const matchCity = removeAccents(artisan.city).includes(removeAccents(currentCity));
      if (!matchCity) return;

      const lat = artisan.lat || (artisan.district && DISTRICT_COORDINATES[artisan.district]?.lat);
      const lng = artisan.lng || (artisan.district && DISTRICT_COORDINATES[artisan.district]?.lng);

      if (!lat || !lng) return;

      // Category check
      if (selectedCategory.id !== 'all' && selectedCategory.keywords.length > 0) {
        const normJob = removeAccents(`${artisan.job} ${artisan.category} ${artisan.skills.join(' ')}`);
        const matchesCat = selectedCategory.keywords.some((k) => normJob.includes(removeAccents(k)));
        if (!matchesCat) return;
      }

      // Text query check
      if (textSearchQuery.trim()) {
        const q = removeAccents(textSearchQuery.trim());
        const matchesText =
          removeAccents(artisan.name).includes(q) ||
          removeAccents(artisan.job).includes(q) ||
          removeAccents(artisan.district).includes(q);
        if (!matchesText) return;
      }

      const distKm = calculateHaversineDistanceKm(activeAnchor.lat, activeAnchor.lng, lat, lng);

      // Radius filter: keep if within selectedRadiusKm
      if (distKm <= selectedRadiusKm) {
        combined.push({
          id: `mboa-${artisan.id}`,
          source: 'mboafacile',
          name: artisan.name,
          jobOrCategory: artisan.job,
          address: `Quartier ${artisan.district}, ${artisan.city}`,
          city: artisan.city,
          district: artisan.district,
          lat,
          lng,
          distanceKm: distKm,
          distanceDisplay: formatDistanceDisplay(distKm),
          rating: artisan.rating,
          reviewsCount: artisan.reviewsCount,
          phone: artisan.phone,
          whatsapp: artisan.whatsapp,
          isOpenNow: artisan.availableToday,
          cniVerified: artisan.cniVerified,
          startingPrice: artisan.startingPrice,
          avatar: artisan.avatar,
          rawArtisanId: artisan.id,
        });
      }
    });

    // 2. Firestore businesses
    firestoreApprovedBusinesses.forEach((biz) => {
      const distKm = calculateHaversineDistanceKm(activeAnchor.lat, activeAnchor.lng, biz.lat, biz.lng);
      if (distKm <= selectedRadiusKm) {
        combined.push({
          ...biz,
          distanceKm: distKm,
          distanceDisplay: formatDistanceDisplay(distKm),
        });
      }
    });

    return combined;
  }, [
    currentCity,
    activeAnchor,
    selectedRadiusKm,
    selectedCategory,
    textSearchQuery,
    firestoreApprovedBusinesses,
  ]);

  // Execute Google Places API (New) Nearby Search
  const executePlacesNearbySearch = useCallback(
    async (center: { lat: number; lng: number }, radiusMeters: number, category: NearbyCategoryOption) => {
      if (!placesLib) {
        return;
      }

      const rateCheck = checkRateLimit('gmp_places_nearby_search', 1200, false);
      if (!rateCheck.allowed) {
        return;
      }

      recordActionTimestamp('gmp_places_nearby_search');
      setIsSearching(true);
      setSearchError(null);

      try {
        if (placesLib.Place && typeof placesLib.Place.searchNearby === 'function') {
          // Strict field mask for cost-efficiency (Table A)
          const request: any = {
            fields: [
              'id',
              'displayName',
              'formattedAddress',
              'location',
              'rating',
              'userRatingCount',
              'primaryType',
              'types',
              'googleMapsURI',
              'nationalPhoneNumber',
              'regularOpeningHours',
            ],
            locationRestriction: {
              center: { lat: center.lat, lng: center.lng },
              radius: radiusMeters,
            },
            maxResultCount: 20,
            language: 'fr',
            region: 'cm',
          };

          // If a specific primary place type is chosen, supply includedPrimaryTypes
          if (category.placeType) {
            request.includedPrimaryTypes = [category.placeType];
          }

          const response = await placesLib.Place.searchNearby(request);
          const rawPlaces = response.places || [];

          const items: UnifiedNearbyItem[] = rawPlaces.map((p: any) => {
            const pLat = typeof p.location?.lat === 'function' ? p.location.lat() : p.location?.lat;
            const pLng = typeof p.location?.lng === 'function' ? p.location.lng() : p.location?.lng;
            const latVal = Number(pLat) || center.lat;
            const lngVal = Number(pLng) || center.lng;

            const nameStr =
              typeof p.displayName === 'string'
                ? p.displayName
                : p.displayName?.text || 'Commerce / Prestataire';

            const isOpen = p.regularOpeningHours?.isOpen
              ? typeof p.regularOpeningHours.isOpen === 'function'
                ? p.regularOpeningHours.isOpen()
                : p.regularOpeningHours.isOpen
              : undefined;

            const distKm = calculateHaversineDistanceKm(center.lat, center.lng, latVal, lngVal);

            return {
              id: `gmp-${p.id || Math.random()}`,
              source: 'google_places' as const,
              name: nameStr,
              jobOrCategory: p.types?.[0]?.replace(/_/g, ' ') || 'Point d’intérêt',
              address: p.formattedAddress || `${currentDistrict || currentCity}, Cameroun`,
              city: currentCity,
              district: currentDistrict,
              lat: latVal,
              lng: lngVal,
              distanceKm: distKm,
              distanceDisplay: formatDistanceDisplay(distKm),
              rating: p.rating,
              reviewsCount: p.userRatingCount,
              phone: p.nationalPhoneNumber,
              isOpenNow: isOpen,
              googleMapsUri: p.googleMapsURI,
            };
          });

          // Sort by distance ascending
          items.sort((a, b) => a.distanceKm - b.distanceKm);
          setGooglePlacesItems(items);
        } else {
          // Fallback if Place.searchNearby is not yet initialized
          console.warn('Place.searchNearby is loading...');
        }
      } catch (err: any) {
        console.warn('Places API Nearby Search error:', err);
        const errMsg = String(err?.message || err);

        if (errMsg.includes('OverQuotaMapError') || errMsg.includes('QuotaExceeded') || errMsg.includes('429')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setSearchError('Le quota d’évaluation Google Maps a été atteint pour aujourd’hui.');
        } else {
          setSearchError('Impossible d’actualiser les lieux Google Maps dans ce rayon.');
        }
      } finally {
        setIsSearching(false);
      }
    },
    [placesLib, currentCity, currentDistrict]
  );

  // Trigger Nearby Search on anchor, radius, or category change
  useEffect(() => {
    if (placesLib) {
      executePlacesNearbySearch(activeAnchor, selectedRadiusMeters, selectedCategory);
    }
  }, [placesLib, activeAnchor, selectedRadiusMeters, selectedCategory, executePlacesNearbySearch]);

  // Combined, sorted results based on active filter source
  const unifiedResults = useMemo(() => {
    let pool: UnifiedNearbyItem[] = [];

    if (filterSource === 'all') {
      pool = [...mboaFacileNearbyItems, ...googlePlacesItems];
    } else if (filterSource === 'mboafacile') {
      pool = [...mboaFacileNearbyItems];
    } else {
      pool = [...googlePlacesItems];
    }

    // Sort by increasing distance (closest first)
    return pool.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filterSource, mboaFacileNearbyItems, googlePlacesItems]);

  // Geolocation trigger: Open privacy consent modal first
  const handleOpenGeolocationModal = () => {
    setIsGeoConsentModalOpen(true);
  };

  // Perform actual navigator.geolocation.getCurrentPosition with high accuracy and full error handling
  const handlePerformGeolocation = () => {
    setIsGeoConsentModalOpen(false);
    setHasUserConsented(true);

    if (!('geolocation' in navigator)) {
      setGeoStatus('denied');
      setGeoErrorDetails({
        code: 0,
        title: 'Navigateur incompatible',
        message: 'Votre navigateur ne prend pas en charge la géolocalisation HTML5.',
        isPermissionDenied: true,
        canRetry: false,
      });
      onShowToast('Votre navigateur ne supporte pas la géolocalisation.', 'warning');
      return;
    }

    setGeoStatus('locating');
    setGeoErrorDetails(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const accuracyMeters = Math.round(position.coords.accuracy);

        setUserLocation(coords);
        setUserAccuracy(accuracyMeters);
        setGeoStatus('granted');
        setGeoErrorDetails(null);

        if (map) {
          map.panTo(coords);
          map.setZoom(14);
        }

        onShowToast(`Position détectée avec succès (±${accuracyMeters} m) !`, 'success');
      },
      (error) => {
        setGeoStatus('denied');
        const interpreted = interpretGeolocationError(error);
        setGeoErrorDetails(interpreted);
        onShowToast(interpreted.message, 'warning');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Reset to manual location
  const handleResetToManual = () => {
    setUserLocation(null);
    setUserAccuracy(null);
    setGeoStatus('idle');
    setGeoErrorDetails(null);
    if (map && defaultCenter) {
      map.panTo(defaultCenter);
      map.setZoom(13);
    }
    onShowToast('Retour au quartier par défaut.', 'info');
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Control Header: « Prestataires près de moi » Deck */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-[#dbe5dc] shadow-sm space-y-4">
        {/* Title & Geolocation Action Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecf6ed] text-[#006946] text-xs font-bold mb-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              <span>Prestataires près de moi • Places API (New)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#151e18] tracking-tight">
              Prestataires près de moi ({currentCity})
            </h2>
            <p className="text-xs text-[#6e7a72] mt-0.5 max-w-xl">
              Localisez les artisans certifiés MboaFacile et les services référencés sur Google Maps classés par distance à vol d’oiseau.
            </p>
          </div>

          {/* Action buttons: GPS Trigger & Manual City/District Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenGeolocationModal}
              disabled={geoStatus === 'locating'}
              className={`h-11 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 ${
                geoStatus === 'granted'
                  ? 'bg-[#006946] text-white ring-2 ring-[#006946]/30'
                  : 'bg-[#bfecdc] hover:bg-[#a3e2cd] text-[#006946]'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${geoStatus === 'locating' ? 'animate-spin' : ''}`}>
                {geoStatus === 'locating' ? 'progress_activity' : 'my_location'}
              </span>
              <span>
                {geoStatus === 'locating'
                  ? 'Localisation GPS...'
                  : geoStatus === 'granted'
                  ? 'Position active (GPS)'
                  : 'Me géolocaliser'}
              </span>
            </button>

            {onOpenCitySelector && (
              <button
                type="button"
                onClick={onOpenCitySelector}
                className="h-11 px-3.5 rounded-xl bg-[#f2fcf2] hover:bg-[#e1ebe1] text-[#151e18] text-xs font-semibold border border-[#dbe5dc] flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-[#006946]">location_city</span>
                <span>{currentDistrict || 'Choisir un quartier'}</span>
              </button>
            )}

            {userLocation && (
              <button
                type="button"
                onClick={handleResetToManual}
                className="h-11 px-3 rounded-xl bg-[#f2fcf2] text-[#ba1a1a] hover:bg-[#ffdad6] text-xs font-semibold border border-[#ffdad6] flex items-center gap-1"
                title="Désactiver la position GPS"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Position & Accuracy Live Badge */}
        {userLocation && (
          <div className="p-3 rounded-2xl bg-[#ecf6ed] border border-[#bfecdc] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006946] animate-pulse shrink-0" />
              <span className="font-semibold text-[#151e18]">
                Position GPS détectée :{' '}
                <strong className="text-[#006946]">
                  {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                </strong>
                {userAccuracy !== null && (
                  <span className="text-[#6e7a72] ml-1.5">
                    (Précision : ±{userAccuracy} m)
                  </span>
                )}
              </span>
            </div>
            <div className="text-[11px] text-[#006946] font-medium bg-white px-2.5 py-1 rounded-xl shadow-2xs">
              Distance à vol d'oiseau calculée en temps réel
            </div>
          </div>
        )}

        {/* Geolocation Error Alert with Manual Search Proposal */}
        {geoStatus === 'denied' && geoErrorDetails && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">
                location_disabled
              </span>
              <div>
                <p className="font-bold text-amber-950">{geoErrorDetails.title}</p>
                <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                  {geoErrorDetails.message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {geoErrorDetails.canRetry && (
                <button
                  type="button"
                  onClick={handlePerformGeolocation}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs"
                >
                  Réessayer
                </button>
              )}
              {onOpenCitySelector && (
                <button
                  type="button"
                  onClick={onOpenCitySelector}
                  className="px-3 py-1.5 rounded-xl bg-[#006946] text-white font-bold text-xs hover:bg-[#16845b] shadow-2xs"
                >
                  Recherche manuelle
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. Proximity Radius Selector: 500m, 1km, 3km, 5km, 10km */}
        <div className="space-y-1.5 pt-1 border-t border-[#e1ebe1]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#151e18] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#006946]">radar</span>
              <span>Rayon de recherche :</span>
              <span className="text-[#006946] font-black">{selectedRadiusKm} km</span>
            </label>
            <span className="text-[11px] text-[#6e7a72]">
              Point central : <strong>{userLocation ? 'Votre GPS' : `${currentDistrict || 'Akwa'}, ${currentCity}`}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {NEARBY_RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRadiusMeters(opt.value)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedRadiusMeters === opt.value
                    ? 'bg-[#006946] text-white shadow-xs'
                    : 'bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e1ebe1] border border-[#dbe5dc]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Category Selector Chips */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#151e18] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#006946]">category</span>
            <span>Catégories de services :</span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {NEARBY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-[#006946] text-white shadow-xs font-bold'
                    : 'bg-[#f2fcf2] text-[#3e4942] hover:bg-[#e1ebe1] border border-[#dbe5dc]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Text Filter + Source Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-[#e1ebe1]">
          {/* Quick text filter */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#006946]">
              search
            </span>
            <input
              type="search"
              value={textSearchQuery}
              onChange={(e) => setTextSearchQuery(e.target.value)}
              placeholder="Filtrer les résultats (ex: clim, dépannage, quincaillerie)..."
              className="w-full h-10 pl-9 pr-8 bg-[#f2fcf2] text-xs font-medium text-[#151e18] rounded-xl border border-[#dbe5dc] focus:outline-none focus:ring-2 focus:ring-[#006946]"
            />
            {textSearchQuery && (
              <button
                type="button"
                onClick={() => setTextSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#6e7a72] hover:text-[#151e18]"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          {/* Source Tabs: Tous / MboaFacile / Google */}
          <div className="inline-flex p-1 bg-[#f2fcf2] rounded-xl border border-[#dbe5dc] shrink-0">
            <button
              type="button"
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterSource === 'all'
                  ? 'bg-white text-[#151e18] shadow-2xs'
                  : 'text-[#6e7a72] hover:text-[#151e18]'
              }`}
            >
              Tous ({mboaFacileNearbyItems.length + googlePlacesItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource('mboafacile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filterSource === 'mboafacile'
                  ? 'bg-[#006946] text-white shadow-2xs'
                  : 'text-[#006946] hover:bg-white/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Certifiés ({mboaFacileNearbyItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterSource('google_places')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filterSource === 'google_places'
                  ? 'bg-[#2563eb] text-white shadow-2xs'
                  : 'text-[#2563eb] hover:bg-white/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Google ({googlePlacesItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map (Explicit height & DEMO_MAP_ID with Zero-Legacy Advanced Markers) */}
      <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] landscape:h-[280px] sm:landscape:h-[360px] md:landscape:h-[500px] rounded-3xl overflow-hidden border border-[#dbe5dc] shadow-sm bg-[#e8f0e9]">
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
            <AdvancedMarker position={userLocation} title="Votre position GPS">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px]">person_pin_circle</span>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* MboaFacile Certified Artisans Pins (Green) */}
          {(filterSource === 'all' || filterSource === 'mboafacile') &&
            mboaFacileNearbyItems.map((item) => (
              <AdvancedMarker
                key={item.id}
                position={{ lat: item.lat, lng: item.lng }}
                title={`${item.name} • ${item.jobOrCategory} (${item.distanceDisplay})`}
                onClick={() => setSelectedMarkerItem(item)}
              >
                <div className="cursor-pointer group flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-full bg-[#006946] text-white text-[10px] font-bold shadow-md flex items-center gap-1 border border-white">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span className="max-w-[110px] truncate">{item.name}</span>
                    <span className="text-[9px] bg-white/20 px-1 rounded-sm">{item.distanceDisplay}</span>
                  </div>
                  <Pin
                    background="#006946"
                    glyphColor="#ffffff"
                    borderColor="#00472e"
                    scale={1.1}
                  />
                </div>
              </AdvancedMarker>
            ))}

          {/* Google Places Results Pins (Blue) */}
          {(filterSource === 'all' || filterSource === 'google_places') &&
            googlePlacesItems.map((item) => (
              <AdvancedMarker
                key={item.id}
                position={{ lat: item.lat, lng: item.lng }}
                title={`${item.name} (Lieu Google • ${item.distanceDisplay})`}
                onClick={() => setSelectedMarkerItem(item)}
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
            ))}

          {/* Single Universal InfoWindow */}
          {selectedMarkerItem && (
            <InfoWindow
              position={{ lat: selectedMarkerItem.lat, lng: selectedMarkerItem.lng }}
              onCloseClick={() => setSelectedMarkerItem(null)}
            >
              <div className="p-1 max-w-[260px] text-[#151e18] space-y-2 font-sans">
                {/* Source Badge */}
                <div className="flex items-center justify-between">
                  {selectedMarkerItem.source === 'mboafacile' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#006946] bg-[#ecf6ed] px-2 py-0.5 rounded-full border border-[#bfecdc]">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      <span>Artisan Certifié MboaFacile</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      <span className="material-symbols-outlined text-[12px]">public</span>
                      <span>Lieu Référencé Google</span>
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-[#006946] bg-[#f2fcf2] px-1.5 py-0.5 rounded-md">
                    {selectedMarkerItem.distanceDisplay}
                  </span>
                </div>

                {/* Identity */}
                <div>
                  <h4 className="text-xs font-bold leading-tight">{selectedMarkerItem.name}</h4>
                  <p className="text-[11px] text-[#6e7a72] leading-tight">{selectedMarkerItem.jobOrCategory}</p>
                  <p className="text-[10px] text-[#3e4942] mt-0.5">{selectedMarkerItem.address}</p>
                </div>

                {/* Rating & Distance note */}
                <div className="text-[10px] text-[#6e7a72] bg-[#f2fcf2] p-1.5 rounded-lg border border-[#dbe5dc] space-y-0.5">
                  <p className="font-semibold text-[#151e18]">
                    ★ {selectedMarkerItem.rating || 4.5} ({selectedMarkerItem.reviewsCount || 0} avis)
                    {selectedMarkerItem.isOpenNow !== undefined && (
                      <span className={`ml-1.5 font-bold ${selectedMarkerItem.isOpenNow ? 'text-[#006946]' : 'text-amber-700'}`}>
                        • {selectedMarkerItem.isOpenNow ? 'Ouvert' : 'Fermé'}
                      </span>
                    )}
                  </p>
                  <p className="text-[9px] text-[#6e7a72] italic">
                    Distance à vol d'oiseau (peut différer du réseau routier)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 pt-1">
                  {/* Google Maps Itinerary Link */}
                  <a
                    href={buildGoogleMapsDirectionsUrl(
                      selectedMarkerItem.lat,
                      selectedMarkerItem.lng,
                      userLocation?.lat,
                      userLocation?.lng,
                      selectedMarkerItem.source === 'google_places' ? selectedMarkerItem.id.replace('gmp-', '') : undefined
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">directions</span>
                    <span>Itinéraire Google Maps</span>
                  </a>

                  {/* MboaFacile Specific Actions */}
                  {selectedMarkerItem.source === 'mboafacile' && (
                    <div className="flex items-center gap-1">
                      {selectedMarkerItem.rawArtisanId && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectArtisan(selectedMarkerItem.rawArtisanId!);
                            setSelectedMarkerItem(null);
                          }}
                          className="flex-1 py-1 rounded-lg bg-[#ecf6ed] text-[#006946] text-[11px] font-bold hover:bg-[#dbe5dc]"
                        >
                          Fiche & Avis
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const art = ARTISANS.find((a) => a.id === selectedMarkerItem.rawArtisanId);
                          onStartQuote(art);
                          setSelectedMarkerItem(null);
                        }}
                        className="flex-1 py-1 rounded-lg bg-[#006946] text-white text-[11px] font-bold hover:bg-[#16845b]"
                      >
                        Devis direct
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Loading Spinner for Nearby Search */}
        {isSearching && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-[#dbe5dc] flex items-center gap-2 text-xs font-semibold text-[#006946] z-10">
            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            <span>Recherche dans un rayon de {selectedRadiusKm} km...</span>
          </div>
        )}
      </div>

      {/* 3. Results Feed sorted by increasing distance */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-sm font-bold text-[#151e18]">
              {unifiedResults.length} prestataire{unifiedResults.length > 1 ? 's' : ''} à proximité (classés par distance)
            </h3>
            <p className="text-[11px] text-[#6e7a72]">
              Rayon : <strong>{selectedRadiusKm} km</strong> • Catégorie : <strong>{selectedCategory.label}</strong> • Distance à vol d'oiseau
            </p>
          </div>
          <span className="text-xs text-[#006946] font-semibold">
            {mboaFacileNearbyItems.length} certifié{mboaFacileNearbyItems.length > 1 ? 's' : ''} MboaFacile • {googlePlacesItems.length} lieu{googlePlacesItems.length > 1 ? 'x' : ''} Google
          </span>
        </div>

        {/* Search Warning Banner if any */}
        {searchError && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600">info</span>
            <span>{searchError}</span>
          </div>
        )}

        {/* Empty state when no providers match */}
        {unifiedResults.length === 0 && !isSearching && (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#dbe5dc] space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#ecf6ed] text-[#006946] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">radar</span>
            </div>
            <h4 className="text-base font-bold text-[#151e18]">
              Aucun prestataire dans un rayon de {selectedRadiusKm} km
            </h4>
            <p className="text-xs text-[#6e7a72] max-w-sm">
              Essayez d’élargir votre rayon de recherche à 5 km ou 10 km, ou de sélectionner « Tous les services ».
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedRadiusMeters(5000)}
                className="px-3.5 py-2 rounded-xl bg-[#ecf6ed] text-[#006946] text-xs font-bold hover:bg-[#dbe5dc]"
              >
                Élargir à 5 km
              </button>
              <button
                type="button"
                onClick={() => setSelectedRadiusMeters(10000)}
                className="px-3.5 py-2 rounded-xl bg-[#006946] text-white text-xs font-bold hover:bg-[#16845b]"
              >
                Élargir à 10 km
              </button>
            </div>
          </div>
        )}

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 lg:landscape:grid-cols-2 xl:landscape:grid-cols-3 gap-3.5">
          {unifiedResults.map((item) => (
            <article
              key={item.id}
              className={`p-4 rounded-2xl bg-white shadow-xs border transition-all flex flex-col justify-between ${
                item.source === 'mboafacile'
                  ? 'border-2 border-[#006946]/30 hover:border-[#006946]'
                  : 'border-[#dbe5dc] hover:border-[#2563eb]/40'
              }`}
            >
              <div>
                {/* Source Badge & Distance Row */}
                <div className="flex items-center justify-between mb-2">
                  {item.source === 'mboafacile' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#bfecdc] text-[#006946] text-[10px] font-extrabold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>Artisan Certifié MboaFacile</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb] text-[10px] font-bold flex items-center gap-1 border border-blue-200">
                      <span className="material-symbols-outlined text-[13px]">public</span>
                      <span>Lieu Référencé Google Maps</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-right">
                    <span className="text-xs font-black text-[#006946]">
                      📍 {item.distanceDisplay}
                    </span>
                    <span className="text-[10px] text-[#6e7a72]" title="Distance à vol d'oiseau (peut différer du réseau routier)">
                      (vol d'oiseau)
                    </span>
                  </div>
                </div>

                {/* Main Identity */}
                <div className="flex items-start gap-3">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#bfecdc] shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.source === 'mboafacile' ? 'bg-[#ecf6ed] text-[#006946]' : 'bg-blue-50 text-[#2563eb]'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">
                        {item.source === 'mboafacile' ? 'handyman' : 'storefront'}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[#151e18] truncate leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#6e7a72] truncate">{item.jobOrCategory}</p>
                    <p className="text-[11px] text-[#3e4942] truncate mt-0.5">{item.address}</p>

                    {item.rating && (
                      <div className="flex items-center gap-2 mt-1 text-[11px]">
                        <span className="font-bold text-[#ffb955] flex items-center gap-0.5">
                          ★ {item.rating} ({item.reviewsCount || 0} avis)
                        </span>
                        {item.isOpenNow !== undefined && (
                          <span className={`font-semibold ${item.isOpenNow ? 'text-[#006946]' : 'text-amber-700'}`}>
                            • {item.isOpenNow ? 'Ouvert' : 'Fermé'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing / Guarantee info for MboaFacile */}
                {item.source === 'mboafacile' && item.startingPrice && (
                  <div className="mt-2.5 pt-2 border-t border-[#e1ebe1] flex items-center justify-between text-xs">
                    <span className="text-[#6e7a72]">Intervention dès</span>
                    <span className="font-extrabold text-[#006946]">
                      {item.startingPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}

                {/* Google non-verified disclaimer */}
                {item.source === 'google_places' && (
                  <p className="text-[10px] text-gray-500 italic mt-2 leading-tight">
                    Information issue de Google Maps. Non certifié physiquement par MboaFacile.
                  </p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#e1ebe1]">
                {/* Google Maps Directions Deep Link */}
                <a
                  href={buildGoogleMapsDirectionsUrl(
                    item.lat,
                    item.lng,
                    userLocation?.lat,
                    userLocation?.lng,
                    item.source === 'google_places' ? item.id.replace('gmp-', '') : undefined
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3 rounded-xl bg-[#ecf6ed] hover:bg-[#dbe5dc] text-[#2563eb] text-xs font-bold flex items-center gap-1 shrink-0"
                  title="Ouvrir l'itinéraire dans Google Maps"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  <span className="hidden sm:inline">Itinéraire</span>
                </a>

                {/* MboaFacile direct contact & devis */}
                {item.source === 'mboafacile' ? (
                  <>
                    {item.whatsapp && (
                      <a
                        href={`https://wa.me/${item.whatsapp}?text=Bonjour%20${encodeURIComponent(
                          item.name
                        )},%20je%20vous%20contacte%20depuis%20MboaFacile`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-10 px-3 rounded-xl bg-[#ecf6ed] hover:bg-[#dbe5dc] text-[#151e18] text-xs font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#006946]">chat</span>
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const art = ARTISANS.find((a) => a.id === item.rawArtisanId);
                        onStartQuote(art);
                      }}
                      className="flex-1 h-10 px-3 rounded-xl bg-[#006946] hover:bg-[#16845b] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                      <span>Devis</span>
                    </button>
                  </>
                ) : (
                  <>
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="h-10 px-3 rounded-xl bg-[#ecf6ed] hover:bg-[#dbe5dc] text-[#006946] text-xs font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        <span>Appeler</span>
                      </a>
                    )}
                    {item.googleMapsUri && (
                      <a
                        href={item.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-10 px-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>Fiche Google</span>
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      </a>
                    )}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 4. Explicit Geolocation Privacy & Consent Modal */}
      {isGeoConsentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 landscape:p-3.5 shadow-2xl space-y-3 landscape:space-y-2 border border-[#e1ebe1] max-h-[92dvh] overflow-y-auto no-scrollbar">
            <div className="w-11 h-11 landscape:w-8 landscape:h-8 rounded-2xl bg-[#bfecdc] text-[#006946] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px] landscape:text-[18px]">my_location</span>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base landscape:text-sm font-bold text-[#151e18]">
                Autoriser l’accès à votre position géographique ?
              </h3>
              <p className="text-xs text-[#3e4942] leading-relaxed">
                MboaFacile utilise votre position uniquement pour rechercher les prestataires et artisans les plus proches de vous ({currentCity}) et calculer leur distance à vol d’oiseau.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#f2fcf2] border border-[#dbe5dc] text-[11px] text-[#3e4942] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#006946]">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Protection des données personnelles (RGPD & Cameroun)</span>
              </div>
              <p className="text-[11px] text-[#6e7a72] leading-relaxed">
                Votre position précise reste confinée dans votre session de navigation. Elle n’est jamais enregistrée sur nos serveurs ni partagée à des tiers sans consentement distinct.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsGeoConsentModalOpen(false);
                  setGeoStatus('denied');
                  setGeoErrorDetails({
                    code: 1,
                    title: 'Recherche manuelle sélectionnée',
                    message: 'Vous pouvez sélectionner manuellement votre quartier.',
                    isPermissionDenied: true,
                    canRetry: true,
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#ecf6ed] text-[#3e4942] font-semibold text-xs hover:bg-[#e1ebe1]"
              >
                Refuser / Choisir manuellement
              </button>
              <button
                type="button"
                onClick={handlePerformGeolocation}
                className="flex-1 py-2.5 rounded-xl bg-[#006946] text-white font-bold text-xs hover:bg-[#16845b] shadow-xs"
              >
                Autoriser la position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
