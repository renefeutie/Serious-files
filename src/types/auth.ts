export type UserRole = 'client' | 'merchant' | 'technicien' | 'admin';

export interface UserProfile {
  uid: string; // id auth.users
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  city?: string;
  district?: string;
  job?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Schéma Supabase table public.clients
 */
export interface SupabaseClientRecord {
  id: string; // FK -> auth.users.id
  email: string;
  nom?: string;
  display_name?: string;
  full_name?: string;
  telephone?: string;
  phone?: string;
  ville?: string;
  city?: string;
  quartier?: string;
  district?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Schéma Supabase table public.techniciens
 */
export interface SupabaseTechnicienRecord {
  id: string; // FK -> auth.users.id
  email: string;
  nom?: string;
  display_name?: string;
  full_name?: string;
  telephone?: string;
  phone?: string;
  ville?: string;
  city?: string;
  quartier?: string;
  district?: string;
  metier?: string;
  job?: string;
  categorie?: string;
  statut?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type BusinessStatus = 'pending' | 'approved' | 'rejected';

export interface BusinessDocument {
  id: string;
  ownerId: string;
  name: string;
  job: string;
  category: string;
  city: string;
  district: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone: string;
  whatsapp?: string;
  bio?: string;
  startingPrice: number;
  status: BusinessStatus;
  cniVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessApplicationDocument {
  id: string;
  ownerId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp?: string;
  job: string;
  category: string;
  city: string;
  district: string;
  experienceYears?: number;
  cniNumber?: string;
  status: BusinessStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
