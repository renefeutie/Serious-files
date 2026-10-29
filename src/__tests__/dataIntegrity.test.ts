import { describe, it, expect } from 'vitest';
import { ARTISANS, CATEGORIES, DOUALA_DISTRICTS, ASSISTANCE_CONTACT } from '../data/mockData';
import { validateCameroonPhone } from '../utils/security';

describe('Data Integrity & Business Rules', () => {
  describe('DOUALA_DISTRICTS', () => {
    it('contains over 140 districts without duplicates', () => {
      expect(DOUALA_DISTRICTS.length).toBeGreaterThan(140);
      const unique = new Set(DOUALA_DISTRICTS);
      expect(unique.size).toBe(DOUALA_DISTRICTS.length);
    });

    it('contains iconic Douala hubs', () => {
      const hubs = ['Akwa', 'Bonanjo', 'Bonapriso', 'Deïdo', 'Maképè', 'Bonamoussadi', 'Bépanda', 'Bonabéri'];
      for (const hub of hubs) {
        expect(DOUALA_DISTRICTS).toContain(hub);
      }
    });
  });

  describe('CATEGORIES', () => {
    it('defines 8 certified trades with required UI metadata', () => {
      expect(CATEGORIES.length).toBe(8);
      for (const cat of CATEGORIES) {
        expect(cat.id).toBeDefined();
        expect(cat.name).toBeTruthy();
        expect(cat.icon).toBeTruthy();
        expect(cat.prosCount).toBeGreaterThan(0);
        expect(cat.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe('ARTISANS', () => {
    it('ensures every artisan has valid identifiers, location, and rating', () => {
      expect(ARTISANS.length).toBeGreaterThan(0);

      for (const a of ARTISANS) {
        expect(a.id).toBeTruthy();
        expect(a.name).toBeTruthy();
        expect(a.job).toBeTruthy();
        expect(a.category).toBeTruthy();
        expect(a.district).toBeTruthy();
        expect(a.city).toBe('Douala');
        expect(a.rating).toBeGreaterThanOrEqual(1.0);
        expect(a.rating).toBeLessThanOrEqual(5.0);
        expect(a.reviewsCount).toBeGreaterThanOrEqual(0);
        expect(a.startingPrice).toBeGreaterThan(0);
        expect(a.guaranteeDays).toBeGreaterThanOrEqual(7);
        expect(a.services.length).toBeGreaterThan(0);
        expect(a.coveredDistricts.length).toBeGreaterThan(0);

        // Every artisan must have a valid Cameroon phone number
        const phoneCheck = validateCameroonPhone(a.phone);
        expect(
          phoneCheck.isValid,
          `Artisan ${a.name} phone ${a.phone} should be valid Cameroon phone`
        ).toBe(true);
      }
    });
  });

  describe('ASSISTANCE_CONTACT', () => {
    it('has valid WhatsApp and Phone numbers matching project standards', () => {
      expect(ASSISTANCE_CONTACT.whatsapp).toBe('237686942622');
      expect(ASSISTANCE_CONTACT.phone).toBe('+237654475764');
      expect(validateCameroonPhone(ASSISTANCE_CONTACT.whatsapp).isValid).toBe(true);
      expect(validateCameroonPhone(ASSISTANCE_CONTACT.phone).isValid).toBe(true);
    });
  });
});
