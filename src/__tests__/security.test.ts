import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeText,
  sanitizeInput,
  validateCameroonPhone,
  validateEmail,
  checkRateLimit,
  recordActionTimestamp,
  resetRateLimit,
} from '../utils/security';

describe('Security Utilities', () => {
  describe('validateCameroonPhone', () => {
    it('accepts valid 9-digit numbers starting with 6', () => {
      const res = validateCameroonPhone('699452180');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+237 699 45 21 80');
    });

    it('accepts numbers with international prefix +237', () => {
      const res = validateCameroonPhone('+237 654 47 57 64');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+237 654 47 57 64');
    });

    it('accepts numbers with 237 prefix without plus sign (12 digits)', () => {
      const res = validateCameroonPhone('237686942622');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+237 686 94 26 22');
    });

    it('accepts numbers with 00237 prefix', () => {
      const res = validateCameroonPhone('00237699452180');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+237 699 45 21 80');
    });

    it('accepts numbers with leading 0 prefix (10 digits starting with 06)', () => {
      const res = validateCameroonPhone('0699452180');
      expect(res.isValid).toBe(true);
      expect(res.normalized).toBe('+237 699 45 21 80');
    });

    it('rejects numbers not starting with 6', () => {
      const res = validateCameroonPhone('555123456');
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });

    it('rejects numbers that are too short or too long', () => {
      expect(validateCameroonPhone('69945218').isValid).toBe(false);
      expect(validateCameroonPhone('69945218000').isValid).toBe(false);
    });

    it('rejects empty or non-string inputs', () => {
      expect(validateCameroonPhone('').isValid).toBe(false);
      // @ts-expect-error test invalid type
      expect(validateCameroonPhone(null).isValid).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('escapes dangerous HTML script tags and characters', () => {
      const input = '<script>alert("xss")</script>&\'/';
      const sanitized = sanitizeText(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&#x27;');
      expect(sanitized).toContain('&#x2F;');
    });

    it('strips null control bytes', () => {
      const input = 'hello\0world';
      expect(sanitizeText(input)).toBe('helloworld');
    });

    it('truncates inputs longer than maxLength', () => {
      const longInput = 'a'.repeat(2000);
      const sanitized = sanitizeText(longInput, 50);
      expect(sanitized.length).toBe(50);
    });

    it('returns empty string for null or non-string inputs', () => {
      // @ts-expect-error test invalid type
      expect(sanitizeText(null)).toBe('');
      // @ts-expect-error test invalid type
      expect(sanitizeText(undefined)).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('trims whitespace and truncates safely', () => {
      expect(sanitizeInput('   bonjour   ', 10)).toBe('bonjour');
      expect(sanitizeInput('un texte très long', 5)).toBe('un te');
    });
  });

  describe('validateEmail', () => {
    it('accepts empty email when optional', () => {
      expect(validateEmail('').isValid).toBe(true);
      expect(validateEmail('   ').isValid).toBe(true);
    });

    it('validates standard email formats', () => {
      expect(validateEmail('sylvie.kamga@gmail.com').isValid).toBe(true);
      expect(validateEmail('artisan@mboafacile.cm').isValid).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('notanemail').isValid).toBe(false);
      expect(validateEmail('@missinguser.com').isValid).toBe(false);
      expect(validateEmail('user@').isValid).toBe(false);
    });
  });

  describe('checkRateLimit and recordActionTimestamp', () => {
    beforeEach(() => {
      resetRateLimit();
    });

    it('allows initial action', () => {
      const check = checkRateLimit('test_action', 2000, true);
      expect(check.allowed).toBe(true);
    });

    it('blocks rapid subsequent action if recorded', () => {
      checkRateLimit('test_action', 2000, true);
      const immediateNext = checkRateLimit('test_action', 2000, false);
      expect(immediateNext.allowed).toBe(false);
      expect(immediateNext.waitSeconds).toBeGreaterThan(0);
    });

    it('does not block subsequent action if autoRecord is false and no timestamp recorded', () => {
      checkRateLimit('test_action_dry', 2000, false);
      const next = checkRateLimit('test_action_dry', 2000, false);
      expect(next.allowed).toBe(true);
    });

    it('allows action after resetRateLimit', () => {
      recordActionTimestamp('action_to_reset');
      expect(checkRateLimit('action_to_reset', 2000, false).allowed).toBe(false);
      resetRateLimit('action_to_reset');
      expect(checkRateLimit('action_to_reset', 2000, false).allowed).toBe(true);
    });
  });
});
