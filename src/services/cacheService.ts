
interface CacheItem {
  id: string;
  data: any;
  timestamp: number;
  version: string;
  expiry?: number;
}

interface QueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
}

class CacheService {
  private dbName = 'SIGA_Cache';
  private version = 1;
  private db: IDBDatabase | null = null;
  private stores = ['cache', 'queue', 'config'];

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Cache Service initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Cache store for general data
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'id' });
          cacheStore.createIndex('timestamp', 'timestamp');
          cacheStore.createIndex('version', 'version');
        }

        // Queue store for offline operations
        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp');
          queueStore.createIndex('action', 'action');
        }

        // Config store for app settings
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };
    });
  }

  async set(key: string, data: any, expiry?: number): Promise<void> {
    if (!this.db) await this.init();
    
    const item: CacheItem = {
      id: key,
      data: this.compress(data),
      timestamp: Date.now(),
      version: '1.0.0',
      expiry: expiry ? Date.now() + expiry : undefined
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(key: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result as CacheItem;
        
        if (!item) {
          resolve(null);
          return;
        }

        // Check expiry
        if (item.expiry && Date.now() > item.expiry) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(this.decompress(item.data));
      };
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async addToQueue(action: 'create' | 'update' | 'delete', table: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    const queueItem: QueueItem = {
      id: `${table}_${Date.now()}_${Math.random()}`,
      action,
      table,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.add(queueItem);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`📝 Queued ${action} operation for ${table}`);
        resolve();
      };
    });
  }

  async getQueue(): Promise<QueueItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readonly');
      const store = transaction.objectStore('queue');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async processQueue(): Promise<void> {
    const queue = await this.getQueue();
    console.log(`🔄 Processing ${queue.length} queued operations`);

    for (const item of queue) {
      try {
        // Here you would sync with actual Supabase
        // For demo mode, we just simulate success
        await this.removeFromQueue(item.id);
        console.log(`✅ Processed ${item.action} for ${item.table}`);
      } catch (error) {
        console.error(`❌ Failed to process ${item.id}:`, error);
        await this.incrementRetries(item.id);
      }
    }
  }

  async removeFromQueue(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async incrementRetries(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result as QueueItem;
        if (item) {
          item.retries += 1;
          
          // Remove if too many retries
          if (item.retries > 3) {
            store.delete(id);
          } else {
            store.put(item);
          }
        }
        resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(this.stores, 'readwrite');
    this.stores.forEach(storeName => {
      transaction.objectStore(storeName).clear();
    });

    console.log('🗑️ Cache cleared');
  }

  async getStats(): Promise<any> {
    if (!this.db) await this.init();

    const cacheCount = await this.getStoreCount('cache');
    const queueCount = await this.getStoreCount('queue');
    
    return {
      cacheItems: cacheCount,
      queueItems: queueCount,
      lastUpdate: await this.get('lastUpdate') || 'Never'
    };
  }

  private async getStoreCount(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private compress(data: any): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Compression error:', error);
      return '{}';
    }
  }

  private decompress(data: string): any {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Decompression error:', error);
      return null;
    }
  }
}

export const cacheService = new CacheService();
