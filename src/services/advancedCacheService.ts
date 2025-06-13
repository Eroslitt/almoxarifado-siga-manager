
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in seconds
}

class AdvancedCacheService {
  private cache = new Map<string, CacheItem>();
  private maxSize = 100;
  private isSupported: boolean;

  constructor() {
    this.isSupported = this.checkSupport();
    this.loadFromStorage();
  }

  private checkSupport(): boolean {
    try {
      return typeof Storage !== 'undefined' && localStorage !== null;
    } catch {
      return false;
    }
  }

  private loadFromStorage(): void {
    if (!this.isSupported) return;

    try {
      const stored = localStorage.getItem('sgf-advanced-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as CacheItem);
        });
        console.log(`🗄️ Loaded ${this.cache.size} items from localStorage`);
      }
    } catch (error) {
      console.warn('Error loading cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (!this.isSupported) return;

    try {
      const cacheObj = Object.fromEntries(this.cache);
      localStorage.setItem('sgf-advanced-cache', JSON.stringify(cacheObj));
    } catch (error) {
      console.warn('Error saving cache to storage:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl * 1000) {
        this.cache.delete(key);
        removed++;
      }
    }

    // Remove oldest items if cache is too large
    if (this.cache.size > this.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = this.cache.size - this.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired/old cache items`);
      this.saveToStorage();
    }
  }

  async set<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, item);
    this.saveToStorage();
    
    // Cleanup periodically
    if (Math.random() < 0.1) { // 10% chance
      this.cleanup();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl * 1000) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return item.data as T;
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    this.saveToStorage();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    if (this.isSupported) {
      localStorage.removeItem('sgf-advanced-cache');
    }
  }

  getStats(): { size: number; memoryUsage: string } {
    const size = this.cache.size;
    const memoryUsage = `${Math.round(JSON.stringify(Object.fromEntries(this.cache)).length / 1024)}KB`;
    return { size, memoryUsage };
  }
}

export const advancedCacheService = new AdvancedCacheService();
