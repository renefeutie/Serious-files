import { describe, it, expect } from 'vitest';
import blueprint from '../../firebase-blueprint.json';
import { sanitizeInput, sanitizeText, validateCameroonPhone } from '../utils/security';
import { OperationType, FirestoreErrorInfo } from '../firebase';

describe('Firebase Blueprint & Schema Validation', () => {
  it('defines User, Business, Favorite, and BusinessApplication entities', () => {
    expect(blueprint.entities.User).toBeDefined();
    expect(blueprint.entities.Business).toBeDefined();
    expect(blueprint.entities.Favorite).toBeDefined();
    expect(blueprint.entities.BusinessApplication).toBeDefined();
  });

  it('restricts User roles to client, merchant, and admin', () => {
    const roleProp = blueprint.entities.User.properties.role;
    expect(roleProp.enum).toEqual(['client', 'merchant', 'admin']);
  });

  it('declares paths in firestore with strict schemas', () => {
    expect(blueprint.firestore['/users/{userId}']).toBeDefined();
    expect(blueprint.firestore['/businesses/{businessId}']).toBeDefined();
    expect(blueprint.firestore['/favorites/{favoriteId}']).toBeDefined();
    expect(blueprint.firestore['/businessApplications/{applicationId}']).toBeDefined();
  });
});

describe('Security & Business Input Validation', () => {
  it('validates Cameroon phone numbers for merchant businesses', () => {
    expect(validateCameroonPhone('699452180').isValid).toBe(true);
    expect(validateCameroonPhone('+237670112233').isValid).toBe(true);
    expect(validateCameroonPhone('0123456789').isValid).toBe(false);
  });

  it('sanitizes business text inputs against XSS', () => {
    const raw = '<script>alert("hack")</script>Atelier de soudure';
    const clean = sanitizeText(raw, 100);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
    expect(clean).toContain('Atelier de soudure');
  });

  it('formats FirestoreErrorInfo correctly for diagnostic tracking', () => {
    const info: FirestoreErrorInfo = {
      error: 'Missing or insufficient permissions',
      operationType: OperationType.WRITE,
      path: 'users/test-uid',
      authInfo: {
        userId: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
      },
    };

    const json = JSON.stringify(info);
    const parsed = JSON.parse(json);
    expect(parsed.operationType).toBe('write');
    expect(parsed.path).toBe('users/test-uid');
    expect(parsed.authInfo.userId).toBe('test-uid');
  });
});
