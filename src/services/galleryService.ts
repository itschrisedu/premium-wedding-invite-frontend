import { apiService, type GalleryAlbum, type GalleryPhoto } from './apiService';

class GalleryService {
  public async getPhotosByDefaultAlbum(): Promise<GalleryPhoto[]> {
    const albums = await apiService.listAlbums();
    const album = albums.find(entry => entry.slug === 'preboda') ?? albums[0];
    if (!album) return [];
    return apiService.listAlbumPhotos(album.id);
  }

  public async getAlbums(): Promise<GalleryAlbum[]> {
    return apiService.listAlbums();
  }

  public async uploadPhotos(token: string, albumId: string, files: File[]): Promise<GalleryPhoto[]> {
    return apiService.uploadAlbumPhotos(token, albumId, files);
  }
}

export const galleryService = new GalleryService();