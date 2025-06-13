
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccess: number;
}

interface CacheStrategy {
  name: 'memory' | 'localStorage' | 'indexedDB';
  maxSize: number;
  defaultTTL: number;
}

class AdvancedCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private strategy: CacheStrategy = {
    name: 'memory',
    maxSize: 100,
    defaultTTL: 300 // 5 minutes
  };

  private metrics = {
    hits: 0,
    misses: 0,
    writes: 0,
    evictions: 0
  };

  async init(strategy?: Partial<CacheStrategy>) {
    if (strategy) {
      this.strategy = { ...this.strategy, ...strategy };
    }

    console.log('🗄️ Advanced Cache Service initialized:', this.strategy);
    
    // Cleanup expired entries on startup
    this.cleanup();
    
    // Set up periodic cleanup (every 5 minutes)
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.memoryCache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Update access tracking
    entry.hits++;
    entry.lastAccess = Date.now();
    this.metrics.hits++;
    
    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.strategy.defaultTTL,
      hits: 0,
      lastAccess: Date.now()
    };

    // Check cache size limit
    if (this.memoryCache.size >= this.strategy.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.memoryCache.set(key, entry);
    this.metrics.writes++;
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    this.resetMetrics();
    console.log('🗑️ Cache cleared completely');
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  private cleanup(): void {
    const before = this.memoryCache.size;
    const expired: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        expired.push(key);
      }
    }

    expired.forEach(key => this.memoryCache.delete(key));
    
    if (expired.length > 0) {
      console.log(`🧹 Cleaned up ${expired.length} expired cache entries`);
    }
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      writes: 0,
      evictions: 0
    };
  }

  getMetrics() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.memoryCache.size,
      maxSize: this.strategy.maxSize
    };
  }

  generateReport(): string {
    const metrics = this.getMetrics();
    return `
📊 Advanced Cache Report:
- Hit Rate: ${metrics.hitRate}%
- Size: ${metrics.size}/${metrics.maxSize}
- Hits: ${metrics.hits}
- Misses: ${metrics.misses}
- Writes: ${metrics.writes}
- Evictions: ${metrics.evictions}
    `.trim();
  }
}

export const advancedCacheService = new AdvancedCacheService();
