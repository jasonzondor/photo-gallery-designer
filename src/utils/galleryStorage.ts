import { Gallery, GalleryListItem } from '../types/Gallery';

const GALLERY_STORAGE_PREFIX = 'photo-gallery-';
const GALLERY_LIST_KEY = 'photo-gallery-list';

// Gallery storage utilities
export class GalleryStorage {
  // Get list of all galleries (metadata only)
  static getGalleryList(): GalleryListItem[] {
    try {
      const listData = localStorage.getItem(GALLERY_LIST_KEY);
      if (!listData) return [];
      
      const galleries: GalleryListItem[] = JSON.parse(listData);
      // Convert date strings back to Date objects
      return galleries.map(gallery => ({
        ...gallery,
        createdAt: new Date(gallery.createdAt),
        updatedAt: new Date(gallery.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading gallery list:', error);
      return [];
    }
  }

  // Save gallery list (metadata only)
  static saveGalleryList(galleries: GalleryListItem[]): void {
    try {
      localStorage.setItem(GALLERY_LIST_KEY, JSON.stringify(galleries));
    } catch (error) {
      console.error('Error saving gallery list:', error);
    }
  }

  // Load a specific gallery by ID
  static loadGallery(galleryId: string): Gallery | null {
    try {
      const galleryData = localStorage.getItem(`${GALLERY_STORAGE_PREFIX}${galleryId}`);
      if (!galleryData) return null;
      
      const gallery: Gallery = JSON.parse(galleryData);
      // Convert date strings back to Date objects
      return {
        ...gallery,
        createdAt: new Date(gallery.createdAt),
        updatedAt: new Date(gallery.updatedAt)
      };
    } catch (error) {
      console.error(`Error loading gallery ${galleryId}:`, error);
      return null;
    }
  }

  // Save a gallery
  static saveGallery(gallery: Gallery): void {
    try {
      // Save the full gallery data
      localStorage.setItem(`${GALLERY_STORAGE_PREFIX}${gallery.id}`, JSON.stringify(gallery));
      
      // Update the gallery list
      const galleries = this.getGalleryList();
      const existingIndex = galleries.findIndex(g => g.id === gallery.id);
      
      const listItem: GalleryListItem = {
        id: gallery.id,
        name: gallery.name,
        description: gallery.description,
        createdAt: gallery.createdAt,
        updatedAt: gallery.updatedAt,
        metadata: gallery.metadata
      };
      
      if (existingIndex >= 0) {
        galleries[existingIndex] = listItem;
      } else {
        galleries.push(listItem);
      }
      
      this.saveGalleryList(galleries);
    } catch (error) {
      console.error('Error saving gallery:', error);
      
      // If it's a quota exceeded error, try to free up space
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting to clear cache and retry...');
        
        // Try progressive cleanup strategies
        let retryAttempt = 0;
        const maxRetries = 3;
        
        while (retryAttempt < maxRetries) {
          retryAttempt++;
          
          if (retryAttempt === 1) {
            // First attempt: clear old cache entries
            this.clearOldCacheEntries();
          } else if (retryAttempt === 2) {
            // Second attempt: clear ALL cache
            console.warn('Clearing ALL cache entries...');
            this.clearAllCache();
          } else {
            // Third attempt: reduce image quality in gallery data
            console.warn('Attempting to reduce gallery data size...');
            this.optimizeGalleryData(gallery);
          }
          
          // Retry saving after cleanup
          try {
            localStorage.setItem(`${GALLERY_STORAGE_PREFIX}${gallery.id}`, JSON.stringify(gallery));
            
            const galleries = this.getGalleryList();
            const existingIndex = galleries.findIndex(g => g.id === gallery.id);
            
            const listItem: GalleryListItem = {
              id: gallery.id,
              name: gallery.name,
              description: gallery.description,
              createdAt: gallery.createdAt,
              updatedAt: gallery.updatedAt,
              metadata: gallery.metadata
            };
            
            if (existingIndex >= 0) {
              galleries[existingIndex] = listItem;
            } else {
              galleries.push(listItem);
            }
            
            this.saveGalleryList(galleries);
            console.log(`Gallery saved successfully after cleanup attempt ${retryAttempt}`);
            return; // Success, exit the retry loop
          } catch (retryError) {
            console.error(`Retry attempt ${retryAttempt} failed:`, retryError);
            if (retryAttempt === maxRetries) {
              throw new Error('Storage is full. Please delete some galleries or clear browser data.');
            }
          }
        }
      } else {
        throw error;
      }
    }
  }

  // Delete a gallery
  static deleteGallery(galleryId: string): void {
    try {
      // Remove the gallery data
      localStorage.removeItem(`${GALLERY_STORAGE_PREFIX}${galleryId}`);
      
      // Update the gallery list
      const galleries = this.getGalleryList();
      const filteredGalleries = galleries.filter(g => g.id !== galleryId);
      this.saveGalleryList(filteredGalleries);
    } catch (error) {
      console.error(`Error deleting gallery ${galleryId}:`, error);
    }
  }

  // Create a new empty gallery
  static createNewGallery(name: string, description?: string): Gallery {
    const now = new Date();
    const gallery: Gallery = {
      id: `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description?.trim(),
      createdAt: now,
      updatedAt: now,
      photos: [],
      imageLibrary: [],
      settings: {
        imageSize: 300
      },
      metadata: {
        photoCount: 0,
        libraryCount: 0
      }
    };
    
    this.saveGallery(gallery);
    return gallery;
  }

  // Generate a preview thumbnail for a gallery
  static generatePreviewThumbnail(gallery: Gallery): Promise<string | undefined> {
    return new Promise((resolve) => {
      if (gallery.photos.length === 0) {
        resolve(undefined);
        return;
      }

      // Use the first photo as preview
      const firstPhoto = gallery.photos[0];
      if (firstPhoto.thumbnailUrl) {
        resolve(firstPhoto.thumbnailUrl);
      } else {
        // Create a small thumbnail from the first photo
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(undefined);
            return;
          }

          // Create a 100x100 thumbnail
          canvas.width = 100;
          canvas.height = 100;
          
          ctx.drawImage(img, 0, 0, 100, 100);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        
        img.onerror = () => resolve(undefined);
        img.src = firstPhoto.url;
      }
    });
  }

  // Update gallery metadata (photo count, etc.)
  static async updateGalleryMetadata(gallery: Gallery): Promise<void> {
    gallery.metadata.photoCount = gallery.photos.length;
    gallery.metadata.libraryCount = gallery.imageLibrary.length;
    gallery.metadata.previewThumbnail = await this.generatePreviewThumbnail(gallery);
    gallery.updatedAt = new Date();
    
    this.saveGallery(gallery);
  }

  // Get storage usage information
  static getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    const total = 5 * 1024 * 1024; // Approximate localStorage limit (5MB)
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
    
    return {
      used,
      total,
      percentage: Math.round((used / total) * 100)
    };
  }

  // Clear old cache entries to free up space
  static clearOldCacheEntries(): void {
    const CACHE_PREFIX = 'photo-gallery-cache-';
    const CACHE_EXPIRY_DAYS = 3; // Reduced from 7 to 3 days
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const cachedData = JSON.parse(localStorage.getItem(key) || '{}');
          if (cachedData.timestamp) {
            const daysSinceCache = (now - cachedData.timestamp) / (1000 * 60 * 60 * 24);
            if (daysSinceCache > CACHE_EXPIRY_DAYS) {
              expiredKeys.push(key);
            }
          } else {
            // If no timestamp, consider it old and remove it
            expiredKeys.push(key);
          }
        } catch (error) {
          // If we can't parse the cached data, remove it
          expiredKeys.push(key);
        }
      }
    }
    
    // Remove expired entries
    expiredKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleared ${expiredKeys.length} expired cache entries`);
    
    // If still not enough space, be more aggressive with cache cleanup
    const cacheKeys: { key: string; timestamp: number; size: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const value = localStorage.getItem(key);
          const cachedData = JSON.parse(value || '{}');
          cacheKeys.push({ 
            key, 
            timestamp: cachedData.timestamp || 0,
            size: (value || '').length
          });
        } catch (error) {
          const value = localStorage.getItem(key);
          cacheKeys.push({ 
            key, 
            timestamp: 0,
            size: (value || '').length
          });
        }
      }
    }
    
    if (cacheKeys.length > 0) {
      // Sort by timestamp (oldest first) and remove oldest 50% when storage is critical
      cacheKeys.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.ceil(cacheKeys.length * 0.5); // Increased from 25% to 50%
      
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(cacheKeys[i].key);
      }
      
      console.log(`Cleared ${toRemove} oldest cache entries to free up space`);
    }
  }

  // Clear ALL cache entries (emergency cleanup)
  static clearAllCache(): void {
    const CACHE_PREFIX = 'photo-gallery-cache-';
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleared ALL ${keysToRemove.length} cache entries`);
  }

  // Optimize gallery data to reduce size (emergency measure)
  static optimizeGalleryData(gallery: Gallery): void {
    console.log('Optimizing gallery data to reduce size...');
    
    // Remove thumbnail URLs from image library to save space
    gallery.imageLibrary = gallery.imageLibrary.map(img => ({
      ...img,
      thumbnailUrl: undefined // Remove thumbnails to save space
    }));
    
    // Limit the number of photos on canvas if too many
    if (gallery.photos.length > 20) {
      console.warn('Too many photos on canvas, keeping only the first 20');
      gallery.photos = gallery.photos.slice(0, 20);
    }
    
    // Remove preview thumbnail from metadata
    if (gallery.metadata.previewThumbnail) {
      gallery.metadata.previewThumbnail = undefined;
    }
    
    console.log('Gallery data optimized');
  }

  // Get storage info for backwards compatibility
  static getStorageInfo(): { used: number; available: number; galleries: number } {
    const usage = this.getStorageUsage();
    const galleries = this.getGalleryList();
    
    return {
      used: usage.used,
      available: Math.max(0, usage.total - usage.used),
      galleries: galleries.length
    };
  }
}
