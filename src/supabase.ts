import { createClient } from '@supabase/supabase-js';
import { UserProfile, UserRole, SupabaseClientRecord, SupabaseTechnicienRecord } from './types/auth';

/**
 * Configuration Supabase pour MboaFacile
 * Clé d'accès : Publishable Key frontend uniquement (aucune clé secrète/service_role dans le client).
 * Respect strict des politiques de sécurité RLS (Row Level Security).
 */

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  'sb_publishable_Wfk4jN9YcWSMw0Gk0krMSg_DdUmIuyl'
)?.trim();

/**
 * Normalise l'URL Supabase pour s'assurer qu'elle commence par https://
 * et éviter toute exception fatale au chargement si l'utilisateur a renseigné un identifiant brut.
 */
function normalizeSupabaseUrl(url?: string): string {
  if (!url) {
    return 'https://dn2f4rl1yj2m4owhyudqwg-qamxg-pd.supabase.co';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Si un identifiant de projet sans protocole a été saisi
  const cleanRef = url.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return `https://${cleanRef}.supabase.co`;
}

export const SUPABASE_URL = normalizeSupabaseUrl(rawUrl);
export const SUPABASE_ANON_KEY = rawKey;

/**
 * Client Supabase officiel configuré avec persistance de session
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'mboafacile-auth-token',
  },
});

/**
 * Récupère le profil utilisateur depuis public.clients ou public.techniciens
 * Associe le profil à l'identifiant auth.users.id
 */
export async function fetchUserProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    // 1. Recherche dans public.clients
    const { data: clientData, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!clientErr && clientData) {
      const c = clientData as SupabaseClientRecord;
      return {
        uid: c.id,
        email: c.email || '',
        displayName: c.nom || c.display_name || c.full_name || 'Client',
        role: 'client',
        phoneNumber: c.telephone || c.phone || '',
        city: c.ville || c.city || 'Douala',
        district: c.quartier || c.district || 'Akwa',
        createdAt: c.created_at || new Date().toISOString(),
        updatedAt: c.updated_at || new Date().toISOString(),
      };
    }

    // 2. Recherche dans public.techniciens
    const { data: techData, error: techErr } = await supabase
      .from('techniciens')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!techErr && techData) {
      const t = techData as SupabaseTechnicienRecord;
      return {
        uid: t.id,
        email: t.email || '',
        displayName: t.nom || t.display_name || t.full_name || 'Technicien / Artisan',
        role: 'technicien',
        phoneNumber: t.telephone || t.phone || '',
        city: t.ville || t.city || 'Douala',
        district: t.quartier || t.district || 'Akwa',
        job: t.metier || t.job || 'Artisan',
        status: t.statut || t.status || 'en_attente',
        createdAt: t.created_at || new Date().toISOString(),
        updatedAt: t.updated_at || new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    console.warn('Erreur lors de la récupération du profil Supabase:', err);
    return null;
  }
}

/**
 * Enregistre le profil d'un CLIENT dans public.clients
 * Empêche l'attribution à un autre utilisateur via RLS (auth.uid() = id).
 */
export async function createClientProfileInSupabase(params: {
  id: string; // auth.users.id
  email: string;
  nom: string;
  telephone?: string;
  ville?: string;
  quartier?: string;
}): Promise<void> {
  const now = new Date().toISOString();

  // Payload avec variantes de colonnes pour résister aux schémas SQL existants
  const payload: Record<string, any> = {
    id: params.id,
    email: params.email,
    nom: params.nom,
    display_name: params.nom,
    full_name: params.nom,
    telephone: params.telephone || '',
    phone: params.telephone || '',
    ville: params.ville || 'Douala',
    city: params.ville || 'Douala',
    quartier: params.quartier || 'Akwa',
    district: params.quartier || 'Akwa',
    created_at: now,
    updated_at: now,
  };

  const { error } = await supabase
    .from('clients')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    // Si une colonne non reconnue a provoqué une erreur PostgREST, tentative avec un format minimal
    if (error.code === 'PGRST204' || error.message?.includes('column')) {
      const minimalPayload = {
        id: params.id,
        email: params.email,
        nom: params.nom,
        telephone: params.telephone || '',
        ville: params.ville || 'Douala',
        quartier: params.quartier || 'Akwa',
      };
      const { error: retryErr } = await supabase
        .from('clients')
        .upsert(minimalPayload, { onConflict: 'id' });
      if (retryErr) throw retryErr;
      return;
    }
    throw error;
  }
}

/**
 * Enregistre le profil d'un TECHNICIEN dans public.techniciens
 * Empêche l'attribution à un autre utilisateur via RLS (auth.uid() = id).
 */
export async function createTechnicienProfileInSupabase(params: {
  id: string; // auth.users.id
  email: string;
  nom: string;
  telephone?: string;
  ville?: string;
  quartier?: string;
  metier?: string;
  statut?: string;
}): Promise<void> {
  const now = new Date().toISOString();

  const payload: Record<string, any> = {
    id: params.id,
    email: params.email,
    nom: params.nom,
    display_name: params.nom,
    full_name: params.nom,
    telephone: params.telephone || '',
    phone: params.telephone || '',
    ville: params.ville || 'Douala',
    city: params.ville || 'Douala',
    quartier: params.quartier || 'Akwa',
    district: params.quartier || 'Akwa',
    metier: params.metier || 'Artisan',
    job: params.metier || 'Artisan',
    statut: params.statut || 'en_attente',
    status: params.statut || 'en_attente',
    created_at: now,
    updated_at: now,
  };

  const { error } = await supabase
    .from('techniciens')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    // Si une colonne non reconnue a provoqué une erreur PostgREST, tentative avec un format minimal
    if (error.code === 'PGRST204' || error.message?.includes('column')) {
      const minimalPayload = {
        id: params.id,
        email: params.email,
        nom: params.nom,
        telephone: params.telephone || '',
        ville: params.ville || 'Douala',
        quartier: params.quartier || 'Akwa',
        metier: params.metier || 'Artisan',
        statut: params.statut || 'en_attente',
      };
      const { error: retryErr } = await supabase
        .from('techniciens')
        .upsert(minimalPayload, { onConflict: 'id' });
      if (retryErr) throw retryErr;
      return;
    }
    throw error;
  }
}

/**
 * Met à jour les informations du profil connecté
 */
export async function updateProfileInSupabase(
  userId: string,
  role: UserRole,
  updates: Partial<UserProfile>
): Promise<void> {
  const tableName = role === 'technicien' || role === 'merchant' ? 'techniciens' : 'clients';
  const now = new Date().toISOString();

  const payload: Record<string, any> = {
    updated_at: now,
  };
  if (updates.displayName) {
    payload.nom = updates.displayName;
    payload.display_name = updates.displayName;
    payload.full_name = updates.displayName;
  }
  if (updates.phoneNumber !== undefined) {
    payload.telephone = updates.phoneNumber;
    payload.phone = updates.phoneNumber;
  }
  if (updates.city) {
    payload.ville = updates.city;
    payload.city = updates.city;
  }
  if (updates.district) {
    payload.quartier = updates.district;
    payload.district = updates.district;
  }

  const { error } = await supabase
    .from(tableName)
    .update(payload)
    .eq('id', userId);

  if (error) {
    // Retenter avec champs français stricts en cas d'erreur de colonne
    const safePayload: Record<string, any> = { updated_at: now };
    if (updates.displayName) safePayload.nom = updates.displayName;
    if (updates.phoneNumber !== undefined) safePayload.telephone = updates.phoneNumber;
    if (updates.city) safePayload.ville = updates.city;
    if (updates.district) safePayload.quartier = updates.district;

    const { error: retryErr } = await supabase
      .from(tableName)
      .update(safePayload)
      .eq('id', userId);

    if (retryErr) throw retryErr;
  }
}

/**
 * Traduction des erreurs d'authentification Supabase en messages clairs en français
 */
export function translateSupabaseAuthError(err: any): string {
  if (!err) return 'Une erreur est survenue.';
  const msg = (err.message || String(err)).toLowerCase();

  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'Cette adresse e-mail est déjà associée à un compte MboaFacile. Veuillez vous connecter.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Adresse e-mail ou mot de passe incorrect.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Votre adresse e-mail n’a pas encore été confirmée. Veuillez vérifier votre boîte de réception.';
  }
  if (msg.includes('password should be at least')) {
    return 'Le mot de passe doit comporter au moins 6 caractères.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Trop de tentatives en peu de temps. Veuillez patienter avant de réessayer.';
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Impossible de joindre le serveur Supabase. Vérifiez votre connexion Internet ou la configuration de l’URL.';
  }
  return err.message || 'Une erreur est survenue lors de l’opération.';
}
