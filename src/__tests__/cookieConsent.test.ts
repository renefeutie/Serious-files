import { describe, it, expect, beforeEach } from 'vitest';
import { getSavedCookieConsent, saveCookieConsent } from '../components/CookieConsentBanner';

describe('Cookie Consent Management', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    globalThis.localStorage = {
      getItem: (k: string) => mockStore[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStore[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStore[k];
      },
      clear: () => {
        mockStore = {};
      },
      key: () => null,
      length: 0,
    };
  });

  it('returns null when no consent has been given', () => {
    expect(getSavedCookieConsent()).toBeNull();
  });

  it('saves preferences with essential always true', () => {
    const saved = saveCookieConsent({ preferences: true, analytics: false });
    expect(saved).not.toBeNull();
    expect(saved?.essential).toBe(true);
    expect(saved?.preferences).toBe(true);
    expect(saved?.analytics).toBe(false);
    expect(saved?.hasConsented).toBe(true);
    expect(saved?.timestamp).toBeDefined();

    // Verify it persists and is retrieved properly
    const retrieved = getSavedCookieConsent();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.essential).toBe(true);
    expect(retrieved?.preferences).toBe(true);
    expect(retrieved?.analytics).toBe(false);
  });

  it('handles refuse all by setting non-essential to false', () => {
    saveCookieConsent({ preferences: false, analytics: false });
    const retrieved = getSavedCookieConsent();
    expect(retrieved?.essential).toBe(true);
    expect(retrieved?.preferences).toBe(false);
    expect(retrieved?.analytics).toBe(false);
  });
});
