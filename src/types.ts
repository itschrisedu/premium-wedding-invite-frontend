import type { Request } from 'express';

export type GuestStatus = 'confirmado' | 'declinado' | 'pendiente';
export type GuestCategory = 'Familia' | 'Amigos' | 'VIP' | 'Trabajo';

export interface Guest {
  id: string;
  code: string; // Unique URL slug e.g. "familia-naranjo"
  name: string;
  category: GuestCategory;
  passesAllowed: number;
  passesConfirmed: number;
  status: GuestStatus;
  phone?: string;
  email?: string;
  notes?: string;
  dietaryRestrictions?: string;
  updatedAt: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
  location: string;
  description: string;
  iconName: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  locationTag: string;
  caption: string;
  aspectRatio: 'square' | 'portrait' | 'landscape' | 'tall';
}

export interface BankDetail {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  idNumber: string;
  email: string;
}

export interface EventVenue {
  name: string;
  type: 'civil' | 'eclesiastico' | 'ceremonia' | 'recepcion' | 'recepcion_civil' | 'recepcion_eclesiastico';
  time: string;
  address: string;
  city: string;
  googleMapsUrl: string;
  imageUrl: string;
  description: string;
}

export interface GalleryAlbum {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  photoCount: number;
}

export interface GalleryPhoto {
  id: string;
  albumId: string;
  title: string;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  contentUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    username: string;
    fullName: string;
    role: 'superadmin' | 'user';
  };
}
