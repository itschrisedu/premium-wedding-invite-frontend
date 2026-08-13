import type { Guest, GuestCategory, GuestStatus } from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export type AuthRole = 'superadmin' | 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: AuthRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: AuthRole;
  createdAt: string;
  updatedAt: string;
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

export interface SiteSection {
  id: string;
  ownerUserId: string;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  body: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const request = async <T>(path: string, init: RequestInit = {}, token?: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload?.message === 'string' ? payload.message : `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const apiService = {
  login: (username: string, password: string) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  me: (token: string) => request<AuthUser>('/auth/me', {}, token),

  listGuests: (token?: string) => request<Guest[]>('/guests', {}, token),

  getGuestByCode: (code: string) => request<Guest>(`/guests/code/${encodeURIComponent(code)}`),

  updateGuestRSVP: (
    guestId: string,
    status: GuestStatus,
    passesConfirmed: number,
    dietaryRestrictions?: string,
    notes?: string
  ) =>
    request<Guest>(`/guests/${encodeURIComponent(guestId)}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status, passesConfirmed, dietaryRestrictions, notes })
    }),

  createGuest: (token: string, guest: Omit<Guest, 'id' | 'updatedAt'>) =>
    request<Guest>('/guests', {
      method: 'POST',
      body: JSON.stringify(guest)
    }, token),

  updateUserRole: (token: string, userId: string, role: AuthRole) =>
    request<AdminUser>(`/users/${encodeURIComponent(userId)}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    }, token),

  deleteUser: (token: string, userId: string) =>
    request<void>(`/users/${encodeURIComponent(userId)}`, { method: 'DELETE' }, token),

  updateGuest: (token: string, guest: Guest) =>
    request<Guest>(`/guests/${encodeURIComponent(guest.id)}`, {
      method: 'PUT',
      body: JSON.stringify(guest)
    }, token),

  deleteGuest: (token: string, guestId: string) =>
    request<void>(`/guests/${encodeURIComponent(guestId)}`, { method: 'DELETE' }, token),

  listUsers: (token: string) => request<AdminUser[]>('/users', {}, token),

  createUser: (
    token: string,
    payload: { username: string; password: string; fullName: string; role: AuthRole }
  ) =>
    request<AdminUser>('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token),

  listAlbums: () => request<GalleryAlbum[]>('/gallery/albums'),

  createAlbum: (token: string, payload: { slug: string; title: string; description?: string }) =>
    request<GalleryAlbum>('/gallery/albums', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token),

  listAlbumPhotos: (albumId: string) => request<GalleryPhoto[]>(`/gallery/albums/${encodeURIComponent(albumId)}/photos`),

  uploadAlbumPhotos: async (token: string, albumId: string, files: File[]): Promise<GalleryPhoto[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    const response = await fetch(`${API_BASE_URL}/gallery/albums/${encodeURIComponent(albumId)}/photos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message = typeof payload?.message === 'string' ? payload.message : `HTTP ${response.status}`;
      throw new Error(message);
    }

    return response.json() as Promise<GalleryPhoto[]>;
  }

  ,

  listSections: (token?: string) => request<SiteSection[]>('/site/sections', {}, token),

  createSection: (token: string, payload: { sectionKey: string; title: string; subtitle?: string | null; body: string; sortOrder?: number; isVisible?: boolean }) =>
    request<SiteSection>('/site/sections', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token),

  updateSection: (token: string, sectionId: string, payload: { title?: string; subtitle?: string | null; body?: string; sortOrder?: number; isVisible?: boolean }) =>
    request<SiteSection>(`/site/sections/${encodeURIComponent(sectionId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }, token),

  deleteSection: (token: string, sectionId: string) =>
    request<void>(`/site/sections/${encodeURIComponent(sectionId)}`, { method: 'DELETE' }, token),

  getUserSettings: (token: string, userId: string) =>
    request<{ userId: string; settings: any }>(`/users/${encodeURIComponent(userId)}/settings`, {}, token),

  updateUserSettings: (token: string, userId: string, settings: any) =>
    request<{ userId: string; settings: any }>(`/users/${encodeURIComponent(userId)}/settings`, { method: 'PUT', body: JSON.stringify({ settings }) }, token),
};