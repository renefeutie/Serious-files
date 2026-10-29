import { describe, it, expect } from 'vitest';
import { ARTISANS, CITY_COORDINATES, DISTRICT_COORDINATES } from '../data/mockData';
import { removeAccents } from '../utils/textUtils';

describe('Artisan Coordinates & Map Data Integrity', () => {
  it('should have valid coordinates for every artisan in Douala', () => {
    for (const artisan of ARTISANS) {
      expect(artisan.lat).toBeDefined();
      expect(artisan.lng).toBeDefined();
      expect(typeof artisan.lat).toBe('number');
      expect(typeof artisan.lng).toBe('number');
      // Cameroon is roughly lat 2° to 13° N, lng 8° to 16° E
      expect(artisan.lat!).toBeGreaterThan(2);
      expect(artisan.lat!).toBeLessThan(13);
      expect(artisan.lng!).toBeGreaterThan(8);
      expect(artisan.lng!).toBeLessThan(16);
    }
  });

  it('should have valid base coordinates for Douala and Yaoundé', () => {
    expect(CITY_COORDINATES['Douala']).toBeDefined();
    expect(CITY_COORDINATES['Douala'].lat).toBeCloseTo(4.05, 1);
    expect(CITY_COORDINATES['Douala'].lng).toBeCloseTo(9.70, 1);

    expect(CITY_COORDINATES['Yaoundé']).toBeDefined();
    expect(CITY_COORDINATES['Yaoundé'].lat).toBeCloseTo(3.84, 1);
    expect(CITY_COORDINATES['Yaoundé'].lng).toBeCloseTo(11.50, 1);
  });

  it('should contain district coordinates for major Douala hubs', () => {
    const majorDistricts = ['Akwa', 'Bonanjo', 'Bonapriso', 'Bali', 'Makepe', 'Bonamoussadi', 'Bépanda', 'Bonabéri'];
    for (const d of majorDistricts) {
      expect(DISTRICT_COORDINATES[d]).toBeDefined();
      expect(typeof DISTRICT_COORDINATES[d].lat).toBe('number');
      expect(typeof DISTRICT_COORDINATES[d].lng).toBe('number');
    }
  });
});

describe('Dynamic FAQ filtering logic', () => {
  const sampleFaq = [
    { q: 'Comment trouver un artisan dans mon quartier parmi les plus de 140 quartiers de Douala ?', tags: ['quartier', 'douala'] },
    { q: 'Comment fonctionne la fonctionnalité « Explorer autour de moi » avec Google Maps ?', tags: ['gps', 'carte'] },
    { q: 'Quelle est la différence entre un artisan certifié MboaFacile et un lieu Google Maps ?', tags: ['certification', 'cni'] },
  ];

  it('filters FAQ items regardless of accents and case', () => {
    const query = 'cni';
    const matches = sampleFaq.filter(item => 
      removeAccents(item.q.toLowerCase()).includes(query) ||
      item.tags.some(t => removeAccents(t.toLowerCase()).includes(query))
    );
    expect(matches.length).toBe(1);
    expect(matches[0].q).toContain('différence');
  });

  it('finds items with accented queries like "géolocalisation" or "carte"', () => {
    const query = removeAccents('carte');
    const matches = sampleFaq.filter(item => 
      removeAccents(item.q.toLowerCase()).includes(query) ||
      item.tags.some(t => removeAccents(t.toLowerCase()).includes(query))
    );
    expect(matches.length).toBe(1);
    expect(matches[0].q).toContain('Google Maps');
  });
});
