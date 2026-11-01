import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  supabase,
  fetchUserProfileFromSupabase,
  createClientProfileInSupabase,
  createTechnicienProfileInSupabase,
  updateProfileInSupabase,
  translateSupabaseAuthError,
} from '../supabase';
import {
  UserProfile,
  UserRole,
  BusinessDocument,
  BusinessApplicationDocument,
} from '../types/auth';

export interface AuthUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsRoleSelection: boolean;
  userFavorites: Set<string>;
  merchantBusinesses: BusinessDocument[];
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole,
    city?: string,
    district?: string,
    phone?: string
  ) => Promise<void>;
  loginWithGoogle: (defaultRole?: UserRole) => Promise<void>;
  completeGoogleRoleSelection: (role: UserRole, city?: string, district?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleFavoriteInDb: (artisanId: string) => Promise<boolean>;
  registerNewBusiness: (
    businessData: Omit<BusinessDocument, 'id' | 'ownerId' | 'status' | 'cniVerified' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  submitMerchantApplication: (
    appData: Omit<BusinessApplicationDocument, 'id' | 'ownerId' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [merchantBusinesses, setMerchantBusinesses] = useState<BusinessDocument[]>([]);

  // Convertit un utilisateur Supabase en AuthUser normalisé compatible avec le frontend
  const buildAuthUser = (sbUser: any): AuthUser => {
    const meta = sbUser.user_metadata || {};
    return {
      id: sbUser.id,
      uid: sbUser.id,
      email: sbUser.email || '',
      displayName:
        meta.displayName ||
        meta.display_name ||
        meta.full_name ||
        meta.name ||
        (sbUser.email ? sbUser.email.split('@')[0] : 'Utilisateur'),
      photoURL: meta.avatar_url || meta.picture || meta.photoURL || null,
      emailVerified: !!(sbUser.email_confirmed_at || sbUser.confirmed_at),
    };
  };

  // Traite la session Supabase active (boot ou changement d'état)
  const processSessionUser = async (sbUser: any) => {
    const authUser = buildAuthUser(sbUser);
    setUser(authUser);

    // Charger les favoris sauvegardés localement pour cet utilisateur
    try {
      const storedFavs = localStorage.getItem(`mboafacile_favs_${authUser.id}`);
      if (storedFavs) {
        setUserFavorites(new Set(JSON.parse(storedFavs)));
      }
    } catch {
      // Ignorer les erreurs localStorage
    }

    // Charger les commerces enregistrés localement
    try {
      const storedBiz = localStorage.getItem(`mboafacile_biz_${authUser.id}`);
      if (storedBiz) {
        setMerchantBusinesses(JSON.parse(storedBiz));
      }
    } catch {
      // Ignorer les erreurs localStorage
    }

    try {
      // Vérification dans public.clients ou public.techniciens
      const profile = await fetchUserProfileFromSupabase(sbUser.id);
      if (profile) {
        setUserProfile(profile);
        setNeedsRoleSelection(false);
      } else {
        // Premier accès OAuth Google : demander le type de profil si non défini
        const metaRole = sbUser.user_metadata?.role as UserRole | undefined;
        if (metaRole) {
          await completeGoogleRoleSelection(
            metaRole,
            sbUser.user_metadata?.city || 'Douala',
            sbUser.user_metadata?.district || 'Akwa'
          );
        } else {
          setNeedsRoleSelection(true);
        }
      }
    } catch (err) {
      console.warn('Erreur vérification profil Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Initialisation et écoute de session Supabase (Persistance automatique)
  useEffect(() => {
    let isMounted = true;

    // Vérifier la session existante au chargement
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('Erreur récupération session Supabase:', error);
      }
      if (session?.user) {
        processSessionUser(session.user);
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Écouter les changements d'état d'authentification (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        await processSessionUser(session.user);
      } else {
        setUser(null);
        setUserProfile(null);
        setNeedsRoleSelection(false);
        setUserFavorites(new Set());
        setMerchantBusinesses([]);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Inscription par e-mail et mot de passe avec dispatch dans clients ou techniciens
  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole,
    city: string = 'Douala',
    district: string = 'Akwa',
    phone: string = ''
  ) => {
    const cleanEmail = email.trim();
    const cleanName = displayName.trim();
    const cleanPhone = phone.trim();
    const targetRole: UserRole = role === 'merchant' ? 'technicien' : role;

    // Inscription Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: {
          display_name: cleanName,
          full_name: cleanName,
          role: targetRole,
          city,
          district,
          phone: cleanPhone,
        },
      },
    });

    if (error) {
      throw new Error(translateSupabaseAuthError(error));
    }

    if (!data.user) {
      throw new Error('Échec de la création du compte. Veuillez réessayer.');
    }

    const userId = data.user.id;

    // Enregistrement du profil dans public.clients ou public.techniciens
    if (targetRole === 'client') {
      await createClientProfileInSupabase({
        id: userId,
        email: cleanEmail,
        nom: cleanName,
        telephone: cleanPhone,
        ville: city,
        quartier: district,
      });
    } else {
      await createTechnicienProfileInSupabase({
        id: userId,
        email: cleanEmail,
        nom: cleanName,
        telephone: cleanPhone,
        ville: city,
        quartier: district,
        metier: 'Artisan',
        statut: 'en_attente',
      });
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: userId,
      email: cleanEmail,
      displayName: cleanName,
      role: targetRole,
      phoneNumber: cleanPhone,
      city,
      district,
      createdAt: now,
      updatedAt: now,
    };

    setUser(buildAuthUser(data.user));
    setUserProfile(newProfile);
    setNeedsRoleSelection(false);
  };

  // 3. Connexion par e-mail et mot de passe
  const loginWithEmail = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      throw new Error(translateSupabaseAuthError(error));
    }

    if (data.user) {
      await processSessionUser(data.user);
    }
  };

  // 4. Connexion avec Google via Supabase Auth
  const loginWithGoogle = async (defaultRole?: UserRole) => {
    const redirectUrl = window.location.origin;
    const targetRole = defaultRole === 'merchant' ? 'technicien' : defaultRole;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account',
          ...(targetRole ? { role: targetRole } : {}),
        },
      },
    });

    if (error) {
      throw new Error(translateSupabaseAuthError(error));
    }
  };

  // 5. Finalisation du profil Google (création dans clients ou techniciens)
  const completeGoogleRoleSelection = async (
    role: UserRole,
    city: string = 'Douala',
    district: string = 'Akwa'
  ) => {
    if (!user) throw new Error('Aucun utilisateur connecté.');

    const targetRole: UserRole = role === 'merchant' ? 'technicien' : role;
    const displayName = user.displayName || 'Utilisateur';

    if (targetRole === 'client') {
      await createClientProfileInSupabase({
        id: user.id,
        email: user.email || '',
        nom: displayName,
        ville: city,
        quartier: district,
      });
    } else {
      await createTechnicienProfileInSupabase({
        id: user.id,
        email: user.email || '',
        nom: displayName,
        ville: city,
        quartier: district,
        metier: 'Artisan',
        statut: 'en_attente',
      });
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: user.id,
      email: user.email || '',
      displayName,
      role: targetRole,
      city,
      district,
      createdAt: now,
      updatedAt: now,
    };

    setUserProfile(newProfile);
    setNeedsRoleSelection(false);
  };

  // 6. Récupération de mot de passe via Supabase Auth
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}#mot-de-passe-oublie`,
    });

    if (error) {
      throw new Error(translateSupabaseAuthError(error));
    }
  };

  // 7. Renvoi de l'e-mail de vérification
  const resendVerificationEmail = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    });
    if (error) {
      throw new Error(translateSupabaseAuthError(error));
    }
  };

  // 8. Déconnexion
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setNeedsRoleSelection(false);
    setUserFavorites(new Set());
    setMerchantBusinesses([]);
  };

  // 9. Mise à jour des informations de profil
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) throw new Error('Aucun utilisateur connecté.');

    await updateProfileInSupabase(user.id, userProfile.role, data);
    setUserProfile((prev) =>
      prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null
    );
  };

  // 10. Gestion des favoris avec persistance
  const toggleFavoriteInDb = async (artisanId: string): Promise<boolean> => {
    if (!user) return false;
    const next = new Set(userFavorites);
    let isAdded = false;

    if (next.has(artisanId)) {
      next.delete(artisanId);
      isAdded = false;
    } else {
      next.add(artisanId);
      isAdded = true;
    }

    setUserFavorites(next);

    try {
      localStorage.setItem(`mboafacile_favs_${user.id}`, JSON.stringify(Array.from(next)));
    } catch {
      // Ignorer
    }

    // Tenter la synchronisation Supabase si la table favorites existe
    try {
      if (isAdded) {
        await supabase.from('favorites').upsert({
          id: `${user.id}_${artisanId}`,
          user_id: user.id,
          artisan_id: artisanId,
        });
      } else {
        await supabase.from('favorites').delete().eq('id', `${user.id}_${artisanId}`);
      }
    } catch {
      // Fallback silencieux si la table n'a pas été créée
    }

    return isAdded;
  };

  // 11. Inscription d'un commerce pour commerçant / technicien
  const registerNewBusiness = async (
    bizData: Omit<BusinessDocument, 'id' | 'ownerId' | 'status' | 'cniVerified' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) throw new Error('Connexion requise pour enregistrer un commerce.');
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const fullDoc: BusinessDocument = {
      ...bizData,
      id: businessId,
      ownerId: user.id,
      status: 'pending',
      cniVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    const nextList = [fullDoc, ...merchantBusinesses];
    setMerchantBusinesses(nextList);

    try {
      localStorage.setItem(`mboafacile_biz_${user.id}`, JSON.stringify(nextList));
    } catch {
      // Ignorer
    }

    try {
      await supabase.from('businesses').insert({
        id: businessId,
        owner_id: user.id,
        name: fullDoc.name,
        job: fullDoc.job,
        category: fullDoc.category,
        city: fullDoc.city,
        district: fullDoc.district,
        phone: fullDoc.phone,
        starting_price: fullDoc.startingPrice,
        status: 'pending',
        created_at: now,
        updated_at: now,
      });
    } catch {
      // Fallback
    }

    return businessId;
  };

  // 12. Soumission d'un dossier pro complet
  const submitMerchantApplication = async (
    appData: Omit<BusinessApplicationDocument, 'id' | 'ownerId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) throw new Error('Connexion requise.');
    const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const fullApp: BusinessApplicationDocument = {
      ...appData,
      id: appId,
      ownerId: user.id,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await supabase.from('business_applications').insert({
        id: appId,
        owner_id: user.id,
        business_name: fullApp.businessName,
        owner_name: fullApp.ownerName,
        phone: fullApp.phone,
        job: fullApp.job,
        category: fullApp.category,
        city: fullApp.city,
        district: fullApp.district,
        status: 'pending',
        created_at: now,
        updated_at: now,
      });
    } catch {
      // Fallback
    }

    return appId;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        needsRoleSelection,
        userFavorites,
        merchantBusinesses,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        completeGoogleRoleSelection,
        resetPassword,
        resendVerificationEmail,
        logout,
        updateProfileData,
        toggleFavoriteInDb,
        registerNewBusiness,
        submitMerchantApplication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé au sein d’un AuthProvider.');
  }
  return context;
};
