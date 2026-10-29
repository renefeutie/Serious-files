/**
 * Utilitaires de sécurité, assainissement et validation pour MboaFacile
 * Conformes aux principes OWASP et aux exigences de protection des données (RGPD / Loi Camerounaise n° 2010/012)
 */

/**
 * Assainit une chaîne de caractères pour neutraliser les injections de scripts et balises HTML
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  // Suppression des caractères de contrôle nuls et dangereux
  let clean = input.replace(/\0/g, '').trim();

  // Échappement des caractères HTML sensibles
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Troncature à la longueur maximale autorisée pour prévenir les attaques DoS / buffer overflow
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
}

/**
 * Assainit le texte saisi dans un formulaire avant affichage sans altérer l'affichage visuel légitime
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Valide le format des numéros de téléphone mobiles au Cameroun (+237 ou direct)
 * Réseaux mobiles locaux : 6XX XXX XXX (Orange, MTN, Camtel)
 */
export function validateCameroonPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', error: 'Le numéro de téléphone est obligatoire.' };
  }

  // Nettoyer les espaces, tirets, points, parenthèses et signe plus
  let digits = phone.replace(/[\s\-\.\(\)\+]/g, '');

  if (digits.startsWith('00237')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('237') && (digits.length === 12 || digits.length === 11)) {
    // 237 + 9 chiffres (12 chiffres au total) ou 237 + 8 chiffres historique (11 chiffres)
    digits = digits.slice(3);
  } else if (digits.startsWith('0') && digits.length === 10 && digits.charAt(1) === '6') {
    // Cas où l'utilisateur saisit un zéro initial (ex: 0699452180)
    digits = digits.slice(1);
  }

  // Vérifier qu'il s'agit d'un numéro à 9 chiffres commençant par 6 (GSM Cameroun)
  const phoneRegex = /^6[0-9]{8}$/;
  if (!phoneRegex.test(digits)) {
    return {
      isValid: false,
      normalized: digits,
      error: 'Numéro invalide. Veuillez renseigner un numéro valide au Cameroun (ex: 686 94 26 22 ou +237 654 47 57 64).',
    };
  }

  return { isValid: true, normalized: `+237 ${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}` };
}

/**
 * Valide une adresse email si fournie (optionnelle mais doit respecter la RFC si saisie)
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { isValid: true }; // Champ optionnel
  }
  const cleanEmail = email.trim();
  // Regex standard robuste
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
    return { isValid: false, error: 'Format d’adresse email invalide.' };
  }
  return { isValid: true };
}

/**
 * Protection contre la soumission abusive / anti-spam côté client (détection de cadencement)
 */
const submissionTimestamps: Record<string, number> = {};

export function checkRateLimit(
  actionKey: string,
  minIntervalMs: number = 3000,
  autoRecord: boolean = true
): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const lastTime = submissionTimestamps[actionKey] || 0;
  const elapsed = now - lastTime;

  if (elapsed < minIntervalMs) {
    const waitSeconds = Math.ceil((minIntervalMs - elapsed) / 1000);
    return { allowed: false, waitSeconds };
  }

  if (autoRecord) {
    submissionTimestamps[actionKey] = now;
  }
  return { allowed: true };
}

export function recordActionTimestamp(actionKey: string): void {
  submissionTimestamps[actionKey] = Date.now();
}

export function resetRateLimit(actionKey?: string): void {
  if (actionKey) {
    delete submissionTimestamps[actionKey];
  } else {
    for (const key of Object.keys(submissionTimestamps)) {
      delete submissionTimestamps[key];
    }
  }
}
