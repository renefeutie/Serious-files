import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase';
import { UserProfile, UserRole, BusinessDocument, BusinessApplicationDocument } from '../types/auth';

interface AuthContextType {
  user: User | null;
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
    district?: string
  ) => Promise<void>;
  loginWithGoogle: (defaultRole?: UserRole) => Promise<void>;
  completeGoogleRoleSelection: (role: UserRole, city?: string, district?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  toggleFavoriteInDb: (artisanId: string) => Promise<boolean>;
  registerNewBusiness: (businessData: Omit<BusinessDocument, 'id' | 'ownerId' | 'status' | 'cniVerified' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  submitMerchantApplication: (appData: Omit<BusinessApplicationDocument, 'id' | 'ownerId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [merchantBusinesses, setMerchantBusinesses] = useState<BusinessDocument[]>([]);

  // Test Firestore connectivity on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
            setNeedsRoleSelection(false);
          } else {
            // New Google user who hasn't selected their role yet
            setNeedsRoleSelection(true);
          }
        } catch (err) {
          console.error('Erreur de chargement du profil utilisateur:', err);
        }
      } else {
        setUserProfile(null);
        setNeedsRoleSelection(false);
        setUserFavorites(new Set());
        setMerchantBusinesses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Favorites when user is signed in
  useEffect(() => {
    if (!user) {
      setUserFavorites(new Set());
      return;
    }

    const favQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      favQuery,
      (snapshot) => {
        const ids = new Set<string>();
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.artisanId) ids.add(data.artisanId);
        });
        setUserFavorites(ids);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'favorites');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to Merchant businesses
  useEffect(() => {
    if (!user || userProfile?.role !== 'merchant') {
      setMerchantBusinesses([]);
      return;
    }

    const bizQuery = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(
      bizQuery,
      (snapshot) => {
        const list: BusinessDocument[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as BusinessDocument);
        });
        setMerchantBusinesses(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'businesses');
      }
    );

    return () => unsubscribe();
  }, [user, userProfile?.role]);

  // Login with Email & Password
  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  // Register with Email & Password
  const registerWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    role: UserRole,
    city: string = 'Douala',
    district: string = 'Akwa'
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, { displayName: displayName.trim() });

    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn("Impossible d'envoyer l'e-mail de vérification immédiatement:", e);
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email.trim(),
      displayName: displayName.trim(),
      role,
      city,
      district,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
    }
  };

  // Login with Google Popup
  const loginWithGoogle = async (defaultRole?: UserRole) => {
    const res = await signInWithPopup(auth, googleProvider);
    const userDocRef = doc(db, 'users', res.user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      setUserProfile(userSnap.data() as UserProfile);
      setNeedsRoleSelection(false);
    } else if (defaultRole) {
      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || 'Utilisateur',
        role: defaultRole,
        city: 'Douala',
        district: 'Akwa',
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
      setNeedsRoleSelection(false);
    } else {
      setNeedsRoleSelection(true);
    }
  };

  // Complete Google Role Selection on first login
  const completeGoogleRoleSelection = async (
    role: UserRole,
    city: string = 'Douala',
    district: string = 'Akwa'
  ) => {
    if (!user) throw new Error('Aucun utilisateur connecté.');
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Utilisateur',
      role,
      city,
      district,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      setNeedsRoleSelection(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  // Reset password via email
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setNeedsRoleSelection(false);
  };

  // Update profile
  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    const now = new Date().toISOString();
    const updated = {
      ...data,
      updatedAt: now,
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), updated);
      setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Toggle favorite in Firestore
  const toggleFavoriteInDb = async (artisanId: string): Promise<boolean> => {
    if (!user) return false;
    const favId = `${user.uid}_${artisanId}`;
    const favDocRef = doc(db, 'favorites', favId);

    try {
      if (userFavorites.has(artisanId)) {
        await deleteDoc(favDocRef);
        return false;
      } else {
        await setDoc(favDocRef, {
          id: favId,
          userId: user.uid,
          artisanId,
          createdAt: new Date().toISOString(),
        });
        return true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `favorites/${favId}`);
      return false;
    }
  };

  // Register a new business for merchant
  const registerNewBusiness = async (
    bizData: Omit<BusinessDocument, 'id' | 'ownerId' | 'status' | 'cniVerified' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) throw new Error('Connexion requise pour enregistrer un commerce.');
    const businessId = `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const fullDoc: BusinessDocument = {
      ...bizData,
      id: businessId,
      ownerId: user.uid,
      status: 'pending',
      cniVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'businesses', businessId), fullDoc);
      return businessId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `businesses/${businessId}`);
    }
  };

  // Submit formal merchant application dossier
  const submitMerchantApplication = async (
    appData: Omit<BusinessApplicationDocument, 'id' | 'ownerId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!user) throw new Error('Connexion requise.');
    const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const fullApp: BusinessApplicationDocument = {
      ...appData,
      id: appId,
      ownerId: user.uid,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'businessApplications', appId), fullApp);
      return appId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `businessApplications/${appId}`);
    }
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
