export type UserRole = 'client' | 'merchant' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  city?: string;
  district?: string;
  createdAt: string;
  updatedAt: string;
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
