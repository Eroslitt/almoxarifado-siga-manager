
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type SyncCallback = (payload: any) => void;
type TableName = 'skus' | 'suppliers' | 'storage_locations' | 'categories' | 'stock_levels';

class RealTimeSyncService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Map<string, SyncCallback[]> = new Map();

  subscribeToTable(tableName: TableName, callback: SyncCallback): () => void {
    const channelKey = `realtime:${tableName}`;
    
    if (!this.channels.has(channelKey)) {
      const channel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName
          },
          (payload) => {
            console.log(`Real-time update for ${tableName}:`, payload);
            const callbacks = this.callbacks.get(channelKey) || [];
            callbacks.forEach(cb => cb(payload));
          }
        )
        .subscribe();

      this.channels.set(channelKey, channel);
      this.callbacks.set(channelKey, []);
    }

    const callbacks = this.callbacks.get(channelKey) || [];
    callbacks.push(callback);
    this.callbacks.set(channelKey, callbacks);

    // Return unsubscribe function
    return () => {
      const updatedCallbacks = this.callbacks.get(channelKey)?.filter(cb => cb !== callback) || [];
      this.callbacks.set(channelKey, updatedCallbacks);
      
      if (updatedCallbacks.length === 0) {
        const channel = this.channels.get(channelKey);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelKey);
          this.callbacks.delete(channelKey);
        }
      }
    };
  }

  subscribeToStockChanges(callback: SyncCallback): () => void {
    return this.subscribeToTable('stock_levels', callback);
  }

  subscribeToSKUChanges(callback: SyncCallback): () => void {
    return this.subscribeToTable('skus', callback);
  }

  subscribeToSupplierChanges(callback: SyncCallback): () => void {
    return this.subscribeToTable('suppliers', callback);
  }

  subscribeToLocationChanges(callback: SyncCallback): () => void {
    return this.subscribeToTable('storage_locations', callback);
  }

  // Broadcast custom events
  async broadcastUpdate(channel: string, event: string, payload: any): Promise<void> {
    const broadcastChannel = supabase.channel(channel);
    await broadcastChannel.send({
      type: 'broadcast',
      event,
      payload
    });
  }

  // Clean up all subscriptions
  cleanup(): void {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.callbacks.clear();
  }
}

export const realTimeSync = new RealTimeSyncService();
