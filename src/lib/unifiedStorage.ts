import { openDB, IDBPDatabase } from 'idb';

// Types
interface CacheItem<T = any> {
  id: string;
  data: T;
  timestamp: number;
  version: string;
  expiry?: number;
  metadata?: Record<string, any>;
}

interface QueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
  priority?: 'low' | 'medium' | 'high';
}

interface StorageStats {
  cacheItems: number;
  queueItems: number;
  preferences: number;
  totalSize: number;
  quota: number;
  lastSync?: string;
}

/**
 * Unified Storage Service
 * Combines offline storage, caching, and queue management
 * Built on IndexedDB with idb wrapper for better developer experience
 */
class UnifiedStorageService {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'SIGA_Unified_v2';
  private readonly DB_VERSION = 2;
  private readonly CACHE_VERSION = '2.0.0';
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database with all required stores
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
          upgrade(db, oldVersion, newVersion, transaction) {
            console.log(`🔄 Upgrading DB from v${oldVersion} to v${newVersion}`);

            // Cache store for general data
            if (!db.objectStoreNames.contains('cache')) {
              const cacheStore = db.createObjectStore('cache', { keyPath: 'id' });
              cacheStore.createIndex('timestamp', 'timestamp');
              cacheStore.createIndex('version', 'version');
              cacheStore.createIndex('expiry', 'expiry');
            }

            // Queue store for offline operations
            if (!db.objectStoreNames.contains('queue')) {
              const queueStore = db.createObjectStore('queue', { keyPath: 'id' });
              queueStore.createIndex('timestamp', 'timestamp');
              queueStore.createIndex('action', 'action');
              queueStore.createIndex('priority', 'priority');
              queueStore.createIndex('retries', 'retries');
            }

            // Preferences store for user settings
            if (!db.objectStoreNames.contains('preferences')) {
              db.createObjectStore('preferences', { keyPath: 'key' });
            }

            // API Response cache
            if (!db.objectStoreNames.contains('api_cache')) {
              const apiStore = db.createObjectStore('api_cache', { keyPath: 'url' });
              apiStore.createIndex('expires', 'expires');
              apiStore.createIndex('method', 'method');
            }
          },
          blocked() {
            console.warn('⚠️ Database upgrade blocked. Please close all tabs.');
          },
          blocking() {
            console.warn('⚠️ This connection is blocking a version upgrade.');
          },
        });

        console.log('✅ Unified Storage Service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize storage:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  // ==================== CACHE OPERATIONS ====================

  /**
   * Store data in cache with optional expiry
   */
  async setCache<T>(key: string, data: T, expiryMs?: number, metadata?: Record<string, any>): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const item: CacheItem<T> = {
      id: key,
      data,
      timestamp: Date.now(),
      version: this.CACHE_VERSION,
      expiry: expiryMs ? Date.now() + expiryMs : undefined,
      metadata,
    };

    await this.db.put('cache', item);
  }

  /**
   * Get data from cache
   */
  async getCache<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const item = await this.db.get('cache', key) as CacheItem<T> | undefined;

    if (!item) return null;

    // Check expiry
    if (item.expiry && Date.now() > item.expiry) {
      await this.deleteCache(key);
      return null;
    }

    return item.data;
  }

  /**
   * Delete item from cache
   */
  async deleteCache(key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('cache', key);
  }

  /**
   * Clear all expired cache items
   */
  async clearExpiredCache(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('cache', 'readwrite');
    const now = Date.now();
    let deleted = 0;

    for await (const cursor of tx.store) {
      const item = cursor.value as CacheItem;
      if (item.expiry && item.expiry < now) {
        await cursor.delete();
        deleted++;
      }
    }

    await tx.done;
    console.log(`🗑️ Cleared ${deleted} expired cache items`);
    return deleted;
  }

  // ==================== QUEUE OPERATIONS ====================

  /**
   * Add operation to queue for later synchronization
   */
  async addToQueue(
    action: 'create' | 'update' | 'delete',
    table: string,
    data: any,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = `${table}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queueItem: QueueItem = {
      id,
      action,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
      priority,
    };

    await this.db.add('queue', queueItem);
    console.log(`📝 Queued ${action} operation for ${table} (${priority} priority)`);
    return id;
  }

  /**
   * Get all queued operations
   */
  async getQueue(filterByPriority?: 'low' | 'medium' | 'high'): Promise<QueueItem[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    if (filterByPriority) {
      const index = this.db.transaction('queue', 'readonly').store.index('priority');
      return await index.getAll(filterByPriority);
    }

    return await this.db.getAll('queue');
  }

  /**
   * Remove item from queue
   */
  async removeFromQueue(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('queue', id);
  }

  /**
   * Increment retry counter for a queue item
   */
  async incrementRetries(id: string, maxRetries: number = 3): Promise<boolean> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const item = await this.db.get('queue', id);
    if (!item) return false;

    item.retries += 1;

    // Remove if too many retries
    if (item.retries >= maxRetries) {
      await this.db.delete('queue', id);
      console.warn(`⚠️ Queue item ${id} removed after ${maxRetries} retries`);
      return false;
    }

    await this.db.put('queue', item);
    return true;
  }

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('queue');
    console.log('🗑️ Queue cleared');
  }

  // ==================== PREFERENCES ====================

  /**
   * Store user preference
   */
  async setPreference<T>(key: string, value: T): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('preferences', { key, value });
  }

  /**
   * Get user preference
   */
  async getPreference<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const pref = await this.db.get('preferences', key);
    return pref?.value ?? defaultValue;
  }

  /**
   * Delete preference
   */
  async deletePreference(key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('preferences', key);
  }

  // ==================== API CACHE ====================

  /**
   * Cache API response
   */
  async cacheApiResponse(
    url: string,
    response: any,
    method: string = 'GET',
    ttlMs: number = 5 * 60 * 1000
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const expires = Date.now() + ttlMs;
    await this.db.put('api_cache', { url, response, method, expires, timestamp: Date.now() });
  }

  /**
   * Get cached API response
   */
  async getCachedApiResponse(url: string): Promise<any | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const cached = await this.db.get('api_cache', url);
    if (!cached || cached.expires < Date.now()) {
      if (cached) await this.db.delete('api_cache', url);
      return null;
    }

    return cached.response;
  }

  /**
   * Clear expired API cache
   */
  async clearExpiredApiCache(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('api_cache', 'readwrite');
    const index = tx.store.index('expires');
    const expired = await index.getAllKeys(IDBKeyRange.upperBound(Date.now()));

    for (const key of expired) {
      await tx.store.delete(key);
    }

    await tx.done;
    console.log(`🗑️ Cleared ${expired.length} expired API cache items`);
    return expired.length;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const [cacheItems, queueItems, preferences, storageEstimate] = await Promise.all([
      this.db.count('cache'),
      this.db.count('queue'),
      this.db.count('preferences'),
      this.getStorageEstimate(),
    ]);

    const lastSync = await this.getPreference<string>('lastSyncTimestamp');

    return {
      cacheItems,
      queueItems,
      preferences,
      totalSize: storageEstimate.usage,
      quota: storageEstimate.quota,
      lastSync,
    };
  }

  /**
   * Get storage estimate from browser
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }

  /**
   * Export all data
   */
  async exportData(): Promise<any> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const [cache, queue, preferences] = await Promise.all([
      this.db.getAll('cache'),
      this.db.getAll('queue'),
      this.db.getAll('preferences'),
    ]);

    return {
      cache,
      queue,
      preferences,
      exportedAt: new Date().toISOString(),
      version: this.CACHE_VERSION,
    };
  }

  /**
   * Import data
   */
  async importData(data: any): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(['cache', 'queue', 'preferences'], 'readwrite');

    if (data.cache) {
      for (const item of data.cache) {
        await tx.objectStore('cache').put(item);
      }
    }

    if (data.queue) {
      for (const item of data.queue) {
        await tx.objectStore('queue').put(item);
      }
    }

    if (data.preferences) {
      for (const pref of data.preferences) {
        await tx.objectStore('preferences').put(pref);
      }
    }

    await tx.done;
    console.log('✅ Data imported successfully');
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await Promise.all([
      this.db.clear('cache'),
      this.db.clear('queue'),
      this.db.clear('preferences'),
      this.db.clear('api_cache'),
    ]);

    console.log('🗑️ All storage cleared');
  }

  /**
   * Perform maintenance (clear expired items)
   */
  async performMaintenance(): Promise<{ cacheCleared: number; apiCacheCleared: number }> {
    console.log('🔧 Performing storage maintenance...');
    
    const [cacheCleared, apiCacheCleared] = await Promise.all([
      this.clearExpiredCache(),
      this.clearExpiredApiCache(),
    ]);

    console.log(`✅ Maintenance complete: ${cacheCleared + apiCacheCleared} items removed`);
    
    return { cacheCleared, apiCacheCleared };
  }
}

// Export singleton instance
export const unifiedStorage = new UnifiedStorageService();

// Export types for external use
export type { CacheItem, QueueItem, StorageStats };
