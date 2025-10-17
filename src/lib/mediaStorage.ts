"use client";

// IndexedDB utility for storing large media files
class MediaStorage {
  private dbName = 'mclx-media-storage';
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
        if (!db.objectStoreNames.contains('media')) {
          db.createObjectStore('media', { keyPath: 'id' });
        }
      };
    });
  }

  async storeMedia(id: string, file: File): Promise<string> {
    if (!this.db) await this.init();
    
    try {
      // First, read the file data
      const fileData = await this.readFileAsDataURL(file);
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['media'], 'readwrite');
        const store = transaction.objectStore('media');
        
        const mediaData = {
          id,
          data: fileData,
          type: file.type,
          size: file.size,
          name: file.name,
          timestamp: Date.now()
        };
        
        const request = store.put(mediaData);
        request.onsuccess = () => resolve(`media://${id}`);
        request.onerror = () => reject(request.error);
        
        // Handle transaction errors
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(new Error('Transaction was aborted'));
      });
    } catch (error) {
      console.error('Error storing media:', error);
      throw error;
    }
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getMedia(id: string): Promise<string | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media'], 'readonly');
      const store = transaction.objectStore('media');
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
      
      // Handle transaction errors
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction was aborted'));
    });
  }

  async deleteMedia(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      // Handle transaction errors
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction was aborted'));
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media'], 'readwrite');
      const store = transaction.objectStore('media');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      // Handle transaction errors
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction was aborted'));
    });
  }

  // Generate unique ID for media
  generateId(): string {
    return `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if a string is a media reference
  isMediaReference(value: string): boolean {
    return value.startsWith('media://');
  }

  // Extract ID from media reference
  extractId(mediaRef: string): string {
    return mediaRef.replace('media://', '');
  }
}

export const mediaStorage = new MediaStorage();
