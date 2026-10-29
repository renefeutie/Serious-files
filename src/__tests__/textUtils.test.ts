import { describe, it, expect } from 'vitest';
import {
  removeAccents,
  normalizeSearchTerm,
  matchesDistrict,
  filterDistricts,
  POPULAR_DOUALA_DISTRICTS,
} from '../utils/textUtils';
import { DOUALA_DISTRICTS } from '../data/mockData';

describe('Text and Search Utilities', () => {
  describe('removeAccents', () => {
    it('normalizes common French accents and special characters', () => {
      expect(removeAccents('Maképè')).toBe('makepe');
      expect(removeAccents('Deïdo')).toBe('deido');
      expect(removeAccents('Bépanda')).toBe('bepanda');
      expect(removeAccents('Électricien')).toBe('electricien');
      expect(removeAccents('Ça marche !')).toBe('ca marche !');
    });

    it('handles empty and null values gracefully', () => {
      expect(removeAccents('')).toBe('');
      // @ts-expect-error test invalid type
      expect(removeAccents(null)).toBe('');
    });
  });

  describe('normalizeSearchTerm', () => {
    it('strips non-alphanumeric punctuation and collapses whitespace', () => {
      expect(normalizeSearchTerm('  New-Bell  TSF  ')).toBe('new bell tsf');
      expect(normalizeSearchTerm('Akwa/Nord')).toBe('akwa nord');
    });
  });

  describe('matchesDistrict', () => {
    it('matches districts ignoring accents and case', () => {
      expect(matchesDistrict('Maképè', 'makepe')).toBe(true);
      expect(matchesDistrict('Deïdo', 'deido')).toBe(true);
      expect(matchesDistrict('Bépanda Bonamoussongo', 'bepanda')).toBe(true);
      expect(matchesDistrict('Bonapriso', 'bonapriso')).toBe(true);
    });

    it('returns true on empty query', () => {
      expect(matchesDistrict('Akwa', '')).toBe(true);
      expect(matchesDistrict('Akwa', '   ')).toBe(true);
    });
  });

  describe('filterDistricts', () => {
    it('filters districts case-insensitively and accent-insensitively', () => {
      const results = filterDistricts(DOUALA_DISTRICTS, 'makepe');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((d) => removeAccents(d).includes('makepe'))).toBe(true);
    });

    it('returns all districts when query is empty', () => {
      const all = filterDistricts(DOUALA_DISTRICTS, '');
      expect(all.length).toBe(DOUALA_DISTRICTS.length);
    });
  });

  describe('POPULAR_DOUALA_DISTRICTS', () => {
    it('contains all key districts in DOUALA_DISTRICTS list', () => {
      for (const pop of POPULAR_DOUALA_DISTRICTS) {
        expect(
          DOUALA_DISTRICTS.includes(pop),
          `Expected ${pop} to be present in DOUALA_DISTRICTS`
        ).toBe(true);
      }
    });
  });
});
