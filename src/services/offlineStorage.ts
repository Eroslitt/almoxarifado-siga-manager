import { openDB, IDBPDatabase } from 'idb';

interface OfflineData {
  id: string;
  type: 'tool' | 'movement' | 'reservation' | 'stock';
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineStorageService {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'SIGA_Offline';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Store for offline data
        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', { keyPath: 'id' });
          store.createIndex('type', 'type');
          store.createIndex('synced', 'synced');
          store.createIndex('timestamp', 'timestamp');
        }

        // Store for cached API responses
        if (!db.objectStoreNames.contains('api_cache')) {
          const cacheStore = db.createObjectStore('api_cache', { keyPath: 'url' });
          cacheStore.createIndex('expires', 'expires');
        }

        // Store for user preferences
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
      },
    });
  }

  async storeOfflineData(data: Omit<OfflineData, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = `${data.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      ...data,
      timestamp: Date.now(),
      synced: false
    };

    await this.db.add('offline_data', offlineData);
    return id;
  }

  async getUnsyncedData(): Promise<OfflineData[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('offline_data', 'readonly');
    const index = tx.store.index('synced');
    const unsyncedData = await index.getAll(IDBKeyRange.only(false));
    await tx.done;
    
    return unsyncedData;
  }

  async markAsSynced(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const data = await this.db.get('offline_data', id);
    if (data) {
      data.synced = true;
      await this.db.put('offline_data', data);
    }
  }

  async cacheApiResponse(url: string, response: any, ttlMinutes: number = 60): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const expires = Date.now() + (ttlMinutes * 60 * 1000);
    await this.db.put('api_cache', { url, response, expires });
  }

  async getCachedResponse(url: string): Promise<any | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const cached = await this.db.get('api_cache', url);
    if (!cached || cached.expires < Date.now()) {
      return null;
    }

    return cached.response;
  }

  async clearExpiredCache(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('api_cache', 'readwrite');
    const index = tx.store.index('expires');
    const expired = await index.getAllKeys(IDBKeyRange.upperBound(Date.now()));
    
    await Promise.all(expired.map(key => tx.store.delete(key)));
    await tx.done;
  }

  async storePreference(key: string, value: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('preferences', { key, value });
  }

  async getPreference(key: string): Promise<any> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const pref = await this.db.get('preferences', key);
    return pref?.value;
  }

  async exportData(): Promise<any> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const offlineData = await this.db.getAll('offline_data');
    const preferences = await this.db.getAll('preferences');

    return {
      offlineData,
      preferences,
      exportedAt: new Date().toISOString()
    };
  }

  async importData(data: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(['offline_data', 'preferences'], 'readwrite');

    if (data.offlineData) {
      for (const item of data.offlineData) {
        await tx.objectStore('offline_data').put(item);
      }
    }

    if (data.preferences) {
      for (const pref of data.preferences) {
        await tx.objectStore('preferences').put(pref);
      }
    }

    await tx.done;
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate() as { used: number; quota: number };
    }
    return { used: 0, quota: 0 };
  }
}

export const offlineStorage = new OfflineStorageService();
