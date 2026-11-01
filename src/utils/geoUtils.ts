/**
 * Utility functions for geolocation, Haversine distance calculations,
 * and Google Maps Places Nearby Search (New) integration.
 */

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface NearbyCategoryOption {
  id: string;
  label: string;
  icon: string;
  placeType?: string; // Places API (New) primary type
  keywords: string[]; // For filtering MboaFacile artisans
}

export const NEARBY_CATEGORIES: NearbyCategoryOption[] = [
  {
    id: 'all',
    label: 'Tous les services',
    icon: 'apps',
    placeType: undefined,
    keywords: [],
  },
  {
    id: 'plumber',
    label: '🔧 Plomberie',
    icon: 'plumbing',
    placeType: 'plumber',
    keywords: ['plombier', 'plomberie', 'sanitaire', 'tuyauterie', 'fuite'],
  },
  {
    id: 'electrician',
    label: '⚡ Électricité',
    icon: 'bolt',
    placeType: 'electrician',
    keywords: ['electricien', 'electricite', 'depannage', 'climatisation', 'clim'],
  },
  {
    id: 'locksmith',
    label: '🔩 Serrurerie',
    icon: 'key',
    placeType: 'locksmith',
    keywords: ['serrurier', 'serrurerie', 'cle', 'verrou'],
  },
  {
    id: 'car_repair',
    label: '🚗 Garages & Auto',
    icon: 'car_repair',
    placeType: 'car_repair',
    keywords: ['garage', 'mecanique', 'auto', 'carrosserie', 'vidange', 'pneu'],
  },
  {
    id: 'hair_salon',
    label: '💇 Salons & Beauté',
    icon: 'content_cut',
    placeType: 'hair_care',
    keywords: ['coiffure', 'salon', 'beaute', 'barbier', 'esthetique', 'tresse'],
  },
  {
    id: 'hardware_store',
    label: '🔨 Quincailleries',
    icon: 'handyman',
    placeType: 'hardware_store',
    keywords: ['quincaillerie', 'materiaux', 'peinture', 'outillage', 'fer'],
  },
  {
    id: 'store',
    label: '🛒 Boutiques & Marchés',
    icon: 'storefront',
    placeType: 'store',
    keywords: ['boutique', 'magasin', 'marche', 'alimentation', 'superette'],
  },
  {
    id: 'pharmacy',
    label: '🩺 Pharmacies',
    icon: 'local_pharmacy',
    placeType: 'pharmacy',
    keywords: ['pharmacie', 'sante', 'medicament'],
  },
];

export const NEARBY_RADIUS_OPTIONS = [
  { value: 500, label: '500 m', km: 0.5 },
  { value: 1000, label: '1 km', km: 1.0 },
  { value: 3000, label: '3 km', km: 3.0 },
  { value: 5000, label: '5 km', km: 5.0 },
  { value: 10000, label: '10 km', km: 10.0 },
];

export interface UnifiedNearbyItem {
  id: string;
  source: 'mboafacile' | 'google_places';
  name: string;
  jobOrCategory: string;
  address: string;
  city?: string;
  district?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  distanceDisplay: string;
  rating?: number;
  reviewsCount?: number;
  phone?: string;
  whatsapp?: string;
  isOpenNow?: boolean;
  googleMapsUri?: string;
  cniVerified?: boolean;
  startingPrice?: number;
  avatar?: string;
  rawArtisanId?: string;
}

/**
 * Calculates great-circle distance between two geographic coordinates using Haversine formula.
 * Returns distance in kilometers (rounded to 2 decimals).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const R = 6371; // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places for accuracy
  return Math.round(distance * 100) / 100;
}

/**
 * Formats a distance in kilometers into a human-readable string.
 * e.g. 0.42 km -> "420 m", 2.34 km -> "2.3 km"
 */
export function formatDistanceDisplay(distanceKm: number): string {
  if (distanceKm < 0.05) {
    return 'Moins de 50 m';
  }
  if (distanceKm < 1.0) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Builds a direct Google Maps directions URL.
 */
export function buildGoogleMapsDirectionsUrl(
  destinationLat: number,
  destinationLng: number,
  originLat?: number,
  originLng?: number,
  placeId?: string
): string {
  const baseUrl = 'https://www.google.com/maps/dir/?api=1';
  const destParam = `destination=${destinationLat},${destinationLng}`;
  const originParam =
    originLat !== undefined && originLng !== undefined ? `&origin=${originLat},${originLng}` : '';
  const placeIdParam = placeId ? `&destination_place_id=${encodeURIComponent(placeId)}` : '';

  return `${baseUrl}&${destParam}${originParam}${placeIdParam}`;
}

/**
 * Interprets navigator.geolocation error codes into helpful user feedback.
 */
export function interpretGeolocationError(error: GeolocationPositionError | { code: number; message?: string }): {
  code: number;
  title: string;
  message: string;
  isPermissionDenied: boolean;
  canRetry: boolean;
} {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return {
        code: 1,
        title: 'Accès GPS refusé',
        message:
          'L’accès à votre position a été refusé dans votre navigateur. Vous pouvez sélectionner votre quartier manuellement pour explorer les prestataires locaux.',
        isPermissionDenied: true,
        canRetry: false,
      };
    case 2: // POSITION_UNAVAILABLE
      return {
        code: 2,
        title: 'Signal GPS indisponible',
        message:
          'Votre position actuelle n’a pas pu être déterminée par le récepteur GPS. Vérifiez que la localisation de votre appareil est activée, ou sélectionnez un quartier.',
        isPermissionDenied: false,
        canRetry: true,
      };
    case 3: // TIMEOUT
      return {
        code: 3,
        title: 'Délai d’attente dépassé',
        message:
          'La recherche de votre position exacte a pris trop de temps. Vous pouvez réessayer avec une meilleure connexion ou choisir un quartier.',
        isPermissionDenied: false,
        canRetry: true,
      };
    default:
      return {
        code: 0,
        title: 'Erreur de géolocalisation',
        message:
          'Impossible d’obtenir votre position pour le moment. La recherche manuelle par quartier reste active.',
        isPermissionDenied: false,
        canRetry: true,
      };
  }
}
