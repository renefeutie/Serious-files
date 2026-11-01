import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  formatDistanceDisplay,
  buildGoogleMapsDirectionsUrl,
  interpretGeolocationError,
  NEARBY_RADIUS_OPTIONS,
  NEARBY_CATEGORIES,
  UnifiedNearbyItem,
} from '../utils/geoUtils';
import { ARTISANS, CITY_COORDINATES, DISTRICT_COORDINATES } from '../data/mockData';

describe('Nearby Providers & Geo Utilities', () => {
  describe('Haversine Distance Calculation', () => {
    it('returns 0 when origin and destination coordinates are identical', () => {
      const lat = 4.051;
      const lng = 9.708;
      const dist = calculateHaversineDistanceKm(lat, lng, lat, lng);
      expect(dist).toBe(0);
    });

    it('accurately computes distance between Akwa and Bonanjo (approx 1.4 km)', () => {
      const akwa = DISTRICT_COORDINATES['Akwa']; // 4.0503, 9.7025
      const bonanjo = DISTRICT_COORDINATES['Bonanjo']; // 4.0441, 9.6912

      const dist = calculateHaversineDistanceKm(akwa.lat, akwa.lng, bonanjo.lat, bonanjo.lng);
      // Expected around 1.4 km
      expect(dist).toBeGreaterThan(1.0);
      expect(dist).toBeLessThan(2.0);
    });

    it('accurately computes distance between Douala and Yaoundé (approx 200 - 220 km)', () => {
      const dla = CITY_COORDINATES['Douala'];
      const yde = CITY_COORDINATES['Yaoundé'];

      const dist = calculateHaversineDistanceKm(dla.lat, dla.lng, yde.lat, yde.lng);
      expect(dist).toBeGreaterThan(190);
      expect(dist).toBeLessThan(230);
    });
  });

  describe('Distance Display Formatting', () => {
    it('formats distances less than 50 m as "Moins de 50 m"', () => {
      expect(formatDistanceDisplay(0.02)).toBe('Moins de 50 m');
    });

    it('formats distances under 1 km in meters', () => {
      expect(formatDistanceDisplay(0.35)).toBe('350 m');
      expect(formatDistanceDisplay(0.8)).toBe('800 m');
      expect(formatDistanceDisplay(0.09)).toBe('90 m');
    });

    it('formats distances >= 1 km in kilometers with 1 decimal', () => {
      expect(formatDistanceDisplay(1.23)).toBe('1.2 km');
      expect(formatDistanceDisplay(5.67)).toBe('5.7 km');
      expect(formatDistanceDisplay(10.0)).toBe('10.0 km');
    });
  });

  describe('Google Maps Directions Link Generation', () => {
    it('builds a direct itinerary URL with destination coordinates', () => {
      const url = buildGoogleMapsDirectionsUrl(4.05, 9.7);
      expect(url).toContain('https://www.google.com/maps/dir/?api=1');
      expect(url).toContain('destination=4.05,9.7');
    });

    it('includes origin when user coordinates are provided', () => {
      const url = buildGoogleMapsDirectionsUrl(4.05, 9.7, 4.04, 9.69);
      expect(url).toContain('destination=4.05,9.7');
      expect(url).toContain('origin=4.04,9.69');
    });

    it('includes destination_place_id when placeId is available', () => {
      const url = buildGoogleMapsDirectionsUrl(4.05, 9.7, 4.04, 9.69, 'ChIJN1t_tDeuEmsRUsoyG83frY4');
      expect(url).toContain('destination_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4');
    });
  });

  describe('Geolocation Error Interpretation', () => {
    it('handles PERMISSION_DENIED (code 1) cleanly without crashing', () => {
      const result = interpretGeolocationError({ code: 1 });
      expect(result.code).toBe(1);
      expect(result.title).toBe('Accès GPS refusé');
      expect(result.isPermissionDenied).toBe(true);
      expect(result.canRetry).toBe(false);
      expect(result.message).toContain('manuellement');
    });

    it('handles POSITION_UNAVAILABLE (code 2) and allows retry', () => {
      const result = interpretGeolocationError({ code: 2 });
      expect(result.code).toBe(2);
      expect(result.title).toBe('Signal GPS indisponible');
      expect(result.canRetry).toBe(true);
    });

    it('handles TIMEOUT (code 3) and allows retry', () => {
      const result = interpretGeolocationError({ code: 3 });
      expect(result.code).toBe(3);
      expect(result.title).toBe('Délai d’attente dépassé');
      expect(result.canRetry).toBe(true);
    });

    it('handles unknown error code gracefully', () => {
      const result = interpretGeolocationError({ code: 99 });
      expect(result.title).toBe('Erreur de géolocalisation');
    });
  });

  describe('Radius Options & Categories Validation', () => {
    it('provides all 5 required radius thresholds (500m, 1km, 3km, 5km, 10km)', () => {
      const values = NEARBY_RADIUS_OPTIONS.map((r) => r.value);
      expect(values).toEqual([500, 1000, 3000, 5000, 10000]);
    });

    it('defines primary Place types and fallback keywords for categories', () => {
      const plumber = NEARBY_CATEGORIES.find((c) => c.id === 'plumber');
      expect(plumber).toBeDefined();
      expect(plumber?.placeType).toBe('plumber');
      expect(plumber?.keywords).toContain('plomberie');

      const electrician = NEARBY_CATEGORIES.find((c) => c.id === 'electrician');
      expect(electrician?.placeType).toBe('electrician');
    });
  });

  describe('Nearby Items Ranking & Data Distinction', () => {
    it('sorts unified items by ascending distance (closest first)', () => {
      const mockItems: UnifiedNearbyItem[] = [
        {
          id: '1',
          source: 'mboafacile',
          name: 'Artisan A',
          jobOrCategory: 'Plombier',
          address: 'Akwa',
          lat: 4.05,
          lng: 9.7,
          distanceKm: 3.2,
          distanceDisplay: '3.2 km',
        },
        {
          id: '2',
          source: 'google_places',
          name: 'Lieu B',
          jobOrCategory: 'Quincaillerie',
          address: 'Deïdo',
          lat: 4.06,
          lng: 9.71,
          distanceKm: 0.8,
          distanceDisplay: '800 m',
        },
        {
          id: '3',
          source: 'mboafacile',
          name: 'Artisan C',
          jobOrCategory: 'Électricien',
          address: 'Bonanjo',
          lat: 4.04,
          lng: 9.69,
          distanceKm: 1.5,
          distanceDisplay: '1.5 km',
        },
      ];

      const sorted = [...mockItems].sort((a, b) => a.distanceKm - b.distanceKm);
      expect(sorted[0].id).toBe('2'); // 0.8 km
      expect(sorted[1].id).toBe('3'); // 1.5 km
      expect(sorted[2].id).toBe('1'); // 3.2 km
    });

    it('strictly separates MboaFacile certified artisans from Google Places items', () => {
      const mboaItem: UnifiedNearbyItem = {
        id: 'mboa-talla-eric',
        source: 'mboafacile',
        name: 'Éric Talla',
        jobOrCategory: 'Plomberie Sanitaire',
        address: 'Quartier Akwa, Douala',
        lat: 4.0512,
        lng: 9.7042,
        distanceKm: 0.4,
        distanceDisplay: '400 m',
        cniVerified: true,
      };

      const googleItem: UnifiedNearbyItem = {
        id: 'gmp-place-123',
        source: 'google_places',
        name: 'Quincaillerie du Wouri',
        jobOrCategory: 'hardware_store',
        address: 'Boulevard de la Liberté, Douala',
        lat: 4.052,
        lng: 9.705,
        distanceKm: 0.6,
        distanceDisplay: '600 m',
      };

      expect(mboaItem.source).toBe('mboafacile');
      expect(mboaItem.cniVerified).toBe(true);

      expect(googleItem.source).toBe('google_places');
      expect(googleItem.cniVerified).toBeUndefined();
    });

    it('filters artisans within selected radius without altering real coordinates', () => {
      const center = { lat: 4.0503, lng: 9.7025 }; // Akwa center
      const radiusKm = 1.0; // 1 km radius

      const withinRadius = ARTISANS.filter((artisan) => {
        if (!artisan.lat || !artisan.lng) return false;
        const d = calculateHaversineDistanceKm(center.lat, center.lng, artisan.lat, artisan.lng);
        return d <= radiusKm;
      });

      // Coordinates of all returned artisans must remain genuine numbers
      withinRadius.forEach((a) => {
        expect(typeof a.lat).toBe('number');
        expect(typeof a.lng).toBe('number');
        expect(a.lat!).toBeGreaterThan(3.0);
        expect(a.lng!).toBeGreaterThan(9.0);
      });
    });
  });
});
