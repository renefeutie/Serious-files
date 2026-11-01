import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  supabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  fetchUserProfileFromSupabase,
  createClientProfileInSupabase,
  createTechnicienProfileInSupabase,
  updateProfileInSupabase,
  translateSupabaseAuthError,
} from '../supabase';

describe('Supabase Client Configuration & Security', () => {
  it('initializes Supabase client with valid HTTPS URL', () => {
    expect(SUPABASE_URL).toMatch(/^https:\/\//);
  });

  it('uses Publishable/Anon key and never exposes secret_role in client', () => {
    expect(SUPABASE_ANON_KEY).toBeDefined();
    expect(SUPABASE_ANON_KEY).toContain('sb_publishable_');
    expect(SUPABASE_ANON_KEY).not.toContain('service_role');
  });

  it('translates common Supabase auth errors into French', () => {
    expect(translateSupabaseAuthError({ message: 'User already registered' })).toContain(
      'Cette adresse e-mail est déjà associée à un compte'
    );
    expect(translateSupabaseAuthError({ message: 'Invalid login credentials' })).toContain(
      'Adresse e-mail ou mot de passe incorrect'
    );
    expect(translateSupabaseAuthError({ message: 'Email not confirmed' })).toContain(
      'Votre adresse e-mail n’a pas encore été confirmée'
    );
    expect(translateSupabaseAuthError({ message: 'Password should be at least 6 characters' })).toContain(
      'Le mot de passe doit comporter au moins 6 caractères'
    );
    expect(translateSupabaseAuthError({ message: 'Rate limit exceeded' })).toContain(
      'Trop de tentatives'
    );
  });
});

describe('Supabase Profiles & Tables Dispatch (public.clients vs public.techniciens)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('createClientProfileInSupabase targets public.clients and binds to auth user ID', async () => {
    const upsertSpy = vi.fn().mockResolvedValue({ data: null, error: null });
    const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: upsertSpy,
    } as any);

    const testUid = 'usr_client_12345';
    await createClientProfileInSupabase({
      id: testUid,
      email: 'client@mboafacile.cm',
      nom: 'Jean Talla',
      telephone: '699112233',
      ville: 'Douala',
      quartier: 'Akwa',
    });

    expect(fromSpy).toHaveBeenCalledWith('clients');
    expect(upsertSpy).toHaveBeenCalled();
    const payload = upsertSpy.mock.calls[0][0];
    expect(payload.id).toBe(testUid);
    expect(payload.email).toBe('client@mboafacile.cm');
    expect(payload.nom).toBe('Jean Talla');
    expect(payload.ville).toBe('Douala');
    expect(payload.quartier).toBe('Akwa');
  });

  it('createTechnicienProfileInSupabase targets public.techniciens and binds to auth user ID', async () => {
    const upsertSpy = vi.fn().mockResolvedValue({ data: null, error: null });
    const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
      upsert: upsertSpy,
    } as any);

    const testUid = 'usr_tech_67890';
    await createTechnicienProfileInSupabase({
      id: testUid,
      email: 'pro@mboafacile.cm',
      nom: 'Mbarga Plomberie',
      telephone: '677889900',
      ville: 'Yaoundé',
      quartier: 'Bastos',
      metier: 'Plombier',
      statut: 'en_attente',
    });

    expect(fromSpy).toHaveBeenCalledWith('techniciens');
    expect(upsertSpy).toHaveBeenCalled();
    const payload = upsertSpy.mock.calls[0][0];
    expect(payload.id).toBe(testUid);
    expect(payload.email).toBe('pro@mboafacile.cm');
    expect(payload.nom).toBe('Mbarga Plomberie');
    expect(payload.metier).toBe('Plombier');
    expect(payload.statut).toBe('en_attente');
  });

  it('fetchUserProfileFromSupabase detects client in public.clients', async () => {
    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'clients') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'client_uid_1',
                  email: 'test@client.cm',
                  nom: 'Alice Doe',
                  telephone: '699000000',
                  ville: 'Douala',
                  quartier: 'Bonanjo',
                },
                error: null,
              }),
            }),
          }),
        } as any;
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      } as any;
    });

    const profile = await fetchUserProfileFromSupabase('client_uid_1');
    expect(profile).not.toBeNull();
    expect(profile?.role).toBe('client');
    expect(profile?.displayName).toBe('Alice Doe');
    expect(profile?.district).toBe('Bonanjo');
  });

  it('fetchUserProfileFromSupabase detects technicien in public.techniciens', async () => {
    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'clients') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        } as any;
      }
      if (table === 'techniciens') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'tech_uid_2',
                  email: 'tech@artisan.cm',
                  nom: 'Paul Climatisation',
                  telephone: '655443322',
                  ville: 'Douala',
                  quartier: 'Deïdo',
                  metier: 'Frigoriste',
                  statut: 'actif',
                },
                error: null,
              }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const profile = await fetchUserProfileFromSupabase('tech_uid_2');
    expect(profile).not.toBeNull();
    expect(profile?.role).toBe('technicien');
    expect(profile?.displayName).toBe('Paul Climatisation');
    expect(profile?.job).toBe('Frigoriste');
    expect(profile?.district).toBe('Deïdo');
  });

  it('updateProfileInSupabase routes update to the appropriate table', async () => {
    const eqSpy = vi.fn().mockResolvedValue({ data: null, error: null });
    const updateSpy = vi.fn().mockReturnValue({ eq: eqSpy });
    const fromSpy = vi.spyOn(supabase, 'from').mockReturnValue({
      update: updateSpy,
    } as any);

    await updateProfileInSupabase('usr_123', 'client', { displayName: 'Nouveau Nom', city: 'Yaoundé' });
    expect(fromSpy).toHaveBeenCalledWith('clients');
    expect(eqSpy).toHaveBeenCalledWith('id', 'usr_123');

    await updateProfileInSupabase('usr_456', 'technicien', { displayName: 'Technicien Pro' });
    expect(fromSpy).toHaveBeenCalledWith('techniciens');
    expect(eqSpy).toHaveBeenCalledWith('id', 'usr_456');
  });
});

describe('Supabase Authentication Workflows (Sign-up, Sign-in, Google, Sign-out)', () => {
  it('calls supabase.auth.signUp with email and options metadata', async () => {
    const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({
      data: { user: { id: 'new_uid_1', email: 'nouveau@mboafacile.cm' } as any, session: null },
      error: null,
    });

    const res = await supabase.auth.signUp({
      email: 'nouveau@mboafacile.cm',
      password: 'password123',
      options: {
        data: {
          display_name: 'Test Client',
          role: 'client',
        },
      },
    });

    expect(signUpSpy).toHaveBeenCalled();
    expect(res.data.user?.id).toBe('new_uid_1');
    expect(res.error).toBeNull();
  });

  it('calls supabase.auth.signInWithPassword for email/password login', async () => {
    const signInSpy = vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
      data: { user: { id: 'existing_uid' } as any, session: {} as any },
      error: null,
    });

    const res = await supabase.auth.signInWithPassword({
      email: 'user@mboafacile.cm',
      password: 'secretPassword123',
    });

    expect(signInSpy).toHaveBeenCalledWith({
      email: 'user@mboafacile.cm',
      password: 'secretPassword123',
    });
    expect(res.data.user).toBeDefined();
  });

  it('calls supabase.auth.signInWithOAuth for Google Sign-In with origin redirect', async () => {
    const oAuthSpy = vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2/v2/auth' },
      error: null,
    });

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });

    expect(oAuthSpy).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });
  });

  it('calls supabase.auth.signOut to end user session', async () => {
    const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });

    const res = await supabase.auth.signOut();
    expect(signOutSpy).toHaveBeenCalled();
    expect(res.error).toBeNull();
  });
});
