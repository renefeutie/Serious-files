/**
 * Utilitaires de recherche insensible aux accents et caractères spéciaux
 * Permet de rechercher "deido" pour trouver "Deïdo", "makepe" pour "Maképè", "bepanda" pour "Bépanda"
 */

export function removeAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function normalizeSearchTerm(str: string): string {
  return removeAccents(str)
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function matchesDistrict(district: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  const normDistrict = removeAccents(district);
  const normQuery = removeAccents(query.trim());
  return normDistrict.includes(normQuery);
}

export function filterDistricts(districts: string[], query: string): string[] {
  if (!query || !query.trim()) return districts;
  const q = removeAccents(query.trim());
  return districts.filter((d) => removeAccents(d).includes(q));
}

export const POPULAR_DOUALA_DISTRICTS = [
  'Akwa',
  'Bonapriso',
  'Bonanjo',
  'Deïdo',
  'Bonamoussadi',
  'Maképè',
  'Kotto',
  'Logpom',
  'Bépanda',
  'Bonabéri',
  'New-Bell',
  'Bassa',
  'Yassa',
  'Japoma',
];
