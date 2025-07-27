import { Gallery, GalleryListItem } from '../types/Gallery';

const DB_NAME = 'PhotoGalleryDB';
const DB_VERSION = 1;
const GALLERY_STORE = 'galleries';
const IMAGE_CACHE_STORE = 'imageCache';

interface CachedImage {
  id: string;
  originalName: string;
  processedUrl: string;
  thumbnailUrl: string;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  timestamp: number;
  fileSize: number;
}

class IndexedDBStorage {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  // Initialize the database
  private static async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create galleries store
          if (!db.objectStoreNames.contains(GALLERY_STORE)) {
            const galleryStore = db.createObjectStore(GALLERY_STORE, { keyPath: 'id' });
            galleryStore.createIndex('name', 'name', { unique: false });
            galleryStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          }

          // Create image cache store
          if (!db.objectStoreNames.contains(IMAGE_CACHE_STORE)) {
            const cacheStore = db.createObjectStore(IMAGE_CACHE_STORE, { keyPath: 'id' });
            cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
            cacheStore.createIndex('originalName', 'originalName', { unique: false });
          }
        };
      });
    }
    return this.dbPromise;
  }

  // Gallery operations
  static async saveGallery(gallery: Gallery): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([GALLERY_STORE], 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put(gallery);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  static async getGallery(id: string): Promise<Gallery | null> {
    const db = await this.getDB();
    const transaction = db.transaction([GALLERY_STORE], 'readonly');
    const store = transaction.objectStore(GALLERY_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  static async getAllGalleries(): Promise<GalleryListItem[]> {
    const db = await this.getDB();
    const transaction = db.transaction([GALLERY_STORE], 'readonly');
    const store = transaction.objectStore(GALLERY_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const galleries = request.result.map((gallery: Gallery) => ({
          id: gallery.id,
          name: gallery.name,
          description: gallery.description,
          createdAt: gallery.createdAt,
          updatedAt: gallery.updatedAt,
          metadata: gallery.metadata
        }));
        resolve(galleries);
      };
      request.onerror = () => reject(request.error);
    });
  }

  static async deleteGallery(id: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([GALLERY_STORE], 'readwrite');
    const store = transaction.objectStore(GALLERY_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Image cache operations
  static async cacheImage(cachedImage: CachedImage): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([IMAGE_CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(IMAGE_CACHE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put(cachedImage);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  static async getCachedImage(id: string): Promise<CachedImage | null> {
    const db = await this.getDB();
    const transaction = db.transaction([IMAGE_CACHE_STORE], 'readonly');
    const store = transaction.objectStore(IMAGE_CACHE_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  static async clearOldCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const db = await this.getDB();
    const transaction = db.transaction([IMAGE_CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(IMAGE_CACHE_STORE);
    const index = store.index('timestamp');
    
    const cutoffTime = Date.now() - maxAgeMs;
    let deletedCount = 0;
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`Cleared ${deletedCount} old cache entries`);
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  static async clearAllCache(): Promise<number> {
    const db = await this.getDB();
    const transaction = db.transaction([IMAGE_CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(IMAGE_CACHE_STORE);
    
    return new Promise((resolve, reject) => {
      // First count the entries
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        const count = countRequest.result;
        
        // Then clear all entries
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          console.log(`Cleared ALL ${count} cache entries`);
          resolve(count);
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      };
      countRequest.onerror = () => reject(countRequest.error);
    });
  }

  // Storage usage information
  static async getStorageUsage(): Promise<{ used: number; available: number; cacheEntries: number; galleries: number }> {
    try {
      const estimate = await navigator.storage.estimate();
      const db = await this.getDB();
      
      // Count galleries
      const galleryTransaction = db.transaction([GALLERY_STORE], 'readonly');
      const galleryStore = galleryTransaction.objectStore(GALLERY_STORE);
      const galleryCount = await new Promise<number>((resolve, reject) => {
        const request = galleryStore.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Count cache entries
      const cacheTransaction = db.transaction([IMAGE_CACHE_STORE], 'readonly');
      const cacheStore = cacheTransaction.objectStore(IMAGE_CACHE_STORE);
      const cacheCount = await new Promise<number>((resolve, reject) => {
        const request = cacheStore.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
        cacheEntries: cacheCount,
        galleries: galleryCount
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { used: 0, available: 0, cacheEntries: 0, galleries: 0 };
    }
  }

  // Migration helper - move data from localStorage to IndexedDB
  static async migrateFromLocalStorage(): Promise<void> {
    console.log('Migrating data from localStorage to IndexedDB...');
    
    try {
      // Migrate galleries
      const galleryListKey = 'photo-gallery-galleries';
      const galleryListData = localStorage.getItem(galleryListKey);
      
      if (galleryListData) {
        const galleryList: GalleryListItem[] = JSON.parse(galleryListData);
        
        for (const galleryItem of galleryList) {
          const galleryKey = `photo-gallery-gallery-${galleryItem.id}`;
          const galleryData = localStorage.getItem(galleryKey);
          
          if (galleryData) {
            const gallery: Gallery = JSON.parse(galleryData);
            await this.saveGallery(gallery);
            console.log(`Migrated gallery: ${gallery.name}`);
          }
        }
        
        // Clear localStorage after successful migration
        localStorage.removeItem(galleryListKey);
        galleryList.forEach(item => {
          localStorage.removeItem(`photo-gallery-gallery-${item.id}`);
        });
      }
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
    }
  }
}

export default IndexedDBStorage;
export type { CachedImage };
