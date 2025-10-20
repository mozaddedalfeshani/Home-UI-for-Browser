"use client";

// Asset Cache Manager for background images and AI models
class AssetCache {
  private dbName = 'mclx-asset-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
      };
    });
  }

  // Check if asset is cached in localStorage
  isAssetCached(assetId: string): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`asset-cache-${assetId}`) === 'true';
  }

  // Mark asset as cached in localStorage
  markAssetCached(assetId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`asset-cache-${assetId}`, 'true');
  }

  // Fetch and cache an image from URL
  async cacheImage(assetId: string, imageUrl: string): Promise<string> {
    if (!this.db) await this.init();
    
    try {
      // Check if already cached
      if (this.isAssetCached(assetId)) {
        const cachedData = await this.getAsset(assetId);
        if (cachedData) {
          return cachedData;
        }
      }

      // Fetch image from URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const dataUrl = await this.blobToDataURL(blob);
      
      // Store in IndexedDB
      await this.storeAsset(assetId, dataUrl, blob.type, 'image');
      
      // Mark as cached
      this.markAssetCached(assetId);
      
      return dataUrl;
    } catch (error) {
      console.error(`Error caching image ${assetId}:`, error);
      throw error;
    }
  }

  // Cache Hugging Face model files
  async cacheModel(assetId: string, modelData: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.db) await this.init();
    
    try {
      // Check if already cached
      if (this.isAssetCached(assetId)) {
        const cachedData = await this.getAsset(assetId);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      }

      // Store model data in IndexedDB
      const modelJson = JSON.stringify(modelData);
      await this.storeAsset(assetId, modelJson, 'application/json', 'model');
      
      // Mark as cached
      this.markAssetCached(assetId);
      
      return modelData;
    } catch (error) {
      console.error(`Error caching model ${assetId}:`, error);
      throw error;
    }
  }

  // Store asset in IndexedDB
  private async storeAsset(id: string, data: string, type: string, category: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      const assetData = {
        id,
        data,
        type,
        category,
        timestamp: Date.now()
      };
      
      const request = store.put(assetData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get asset from IndexedDB
  async getAsset(id: string): Promise<string | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Convert blob to data URL
  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  // Clear specific asset cache
  async clearAsset(assetId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.delete(assetId);
      
      request.onsuccess = () => {
        // Remove from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`asset-cache-${assetId}`);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Clear all asset cache
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.clear();
      
      request.onsuccess = () => {
        // Clear all localStorage cache markers
        if (typeof window !== 'undefined') {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('asset-cache-')) {
              localStorage.removeItem(key);
            }
          });
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ totalAssets: number; totalSize: number }> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const assets = request.result;
        const totalSize = assets.reduce((sum, asset) => sum + asset.data.length, 0);
        resolve({
          totalAssets: assets.length,
          totalSize
        });
      };
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const assetCache = new AssetCache();

// Asset IDs constants
export const ASSET_IDS = {
  DEFAULT_IMAGE: 'default-bg-image',
  HF_MODEL: 'hf-model-distilgpt2'
} as const;
