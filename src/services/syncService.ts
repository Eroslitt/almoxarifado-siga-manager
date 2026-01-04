import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { unifiedStorage, QueueItem } from '@/lib/unifiedStorage';

/**
 * Sync Service
 * Handles automatic synchronization between IndexedDB and Supabase
 */
class SyncService {
  private syncInterval: number | null = null;
  private isSyncing: boolean = false;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_BATCH_SIZE = 10;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  /**
   * Start automatic synchronization
   */
  startAutoSync(intervalMs: number = this.SYNC_INTERVAL_MS): void {
    if (this.syncInterval) {
      console.warn('⚠️ Auto-sync already running');
      return;
    }

    console.log(`🔄 Starting auto-sync (interval: ${intervalMs}ms)`);
    
    // Initial sync
    this.sync();

    // Setup interval
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, intervalMs);

    // Sync on online event
    window.addEventListener('online', this.handleOnline);
  }

  /**
   * Stop automatic synchronization
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      window.removeEventListener('online', this.handleOnline);
      console.log('⏸️ Auto-sync stopped');
    }
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    console.log('🌐 Connection restored, triggering sync...');
    this.sync();
  };

  /**
   * Add sync status listener
   */
  addListener(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify listeners of sync status
   */
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Perform synchronization
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress, skipping...');
      return { success: false, message: 'Sync already in progress', synced: 0, failed: 0 };
    }

    // Check online status
    if (!navigator.onLine) {
      console.log('📴 Offline, skipping sync');
      this.notifyListeners({ status: 'offline', message: 'Device is offline' });
      return { success: false, message: 'Device is offline', synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing', message: 'Synchronizing...' });

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get queued items
      const queue = await unifiedStorage.getQueue();
      
      if (queue.length === 0) {
        this.notifyListeners({ status: 'idle', message: 'No items to sync' });
        return { ...result, message: 'No items to sync' };
      }

      console.log(`🔄 Syncing ${queue.length} queued operations...`);

      // Sort by priority and timestamp
      const sortedQueue = this.prioritizeQueue(queue);

      // Process in batches
      const batches = this.createBatches(sortedQueue, this.MAX_BATCH_SIZE);

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(
          batch.map(item => this.syncItem(item))
        );

        batchResults.forEach((batchResult, index) => {
          if (batchResult.status === 'fulfilled' && batchResult.value.success) {
            result.synced++;
          } else {
            result.failed++;
            const error = batchResult.status === 'rejected' 
              ? batchResult.reason 
              : (batchResult.value as SyncItemResult).error;
            result.errors?.push({
              item: batch[index],
              error: error || 'Unknown error',
            });
          }
        });
      }

      // Update last sync timestamp
      await unifiedStorage.setPreference('lastSyncTimestamp', new Date().toISOString());

      const message = `Synced ${result.synced}/${queue.length} items`;
      console.log(`✅ ${message}`);
      
      this.notifyListeners({
        status: result.failed > 0 ? 'partial' : 'success',
        message,
        synced: result.synced,
        failed: result.failed,
      });

      return { ...result, message };

    } catch (error) {
      console.error('❌ Sync failed:', error);
      result.success = false;
      result.message = error instanceof Error ? error.message : 'Sync failed';
      
      this.notifyListeners({
        status: 'error',
        message: result.message,
      });

      return result;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: QueueItem): Promise<SyncItemResult> {
    try {
      let response;
      const table = item.table as keyof Database['public']['Tables'] & string;

      switch (item.action) {
        case 'create':
          response = await supabase.from(table).insert(item.data).select();
          break;

        case 'update':
          const updateId = item.data.id;
          if (!updateId) throw new Error('Update requires an id');
          response = await supabase
            .from(table)
            .update(item.data)
            .eq('id', updateId)
            .select();
          break;

        case 'delete':
          const deleteId = item.data.id;
          if (!deleteId) throw new Error('Delete requires an id');
          response = await supabase
            .from(table)
            .delete()
            .eq('id', deleteId);
          break;

        default:
          throw new Error(`Unknown action: ${item.action}`);
      }

      if (response.error) {
        throw response.error;
      }

      // Remove from queue on success
      await unifiedStorage.removeFromQueue(item.id);
      
      console.log(`✅ Synced ${item.action} for ${item.table}`);
      
      return { success: true, item };

    } catch (error) {
      console.error(`❌ Failed to sync item ${item.id}:`, error);

      // Increment retries
      const shouldRetry = await unifiedStorage.incrementRetries(item.id);

      return {
        success: false,
        item,
        error: error instanceof Error ? error.message : 'Unknown error',
        shouldRetry,
      };
    }
  }

  /**
   * Prioritize queue items
   */
  private prioritizeQueue(queue: QueueItem[]): QueueItem[] {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    
    return queue.sort((a, b) => {
      // First by priority
      const priorityA = priorityOrder[a.priority || 'medium'];
      const priorityB = priorityOrder[b.priority || 'medium'];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Create batches from array
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<SyncResult> {
    console.log('🚀 Force sync triggered');
    return this.sync();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): { isActive: boolean; isSyncing: boolean } {
    return {
      isActive: this.syncInterval !== null,
      isSyncing: this.isSyncing,
    };
  }
}

// Types
interface SyncResult {
  success: boolean;
  message?: string;
  synced: number;
  failed: number;
  errors?: { item: QueueItem; error: string }[];
}

interface SyncItemResult {
  success: boolean;
  item: QueueItem;
  error?: string;
  shouldRetry?: boolean;
}

interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'partial' | 'error' | 'offline';
  message: string;
  synced?: number;
  failed?: number;
}

// Export singleton
export const syncService = new SyncService();

// Export types
export type { SyncResult, SyncStatus };
