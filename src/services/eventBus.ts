
import { AppEvents } from '@/types/global';

type EventCallback<T = any> = (data: T) => void;
type EventType = keyof AppEvents;

class EventBusService {
  private listeners: Map<string, EventCallback[]> = new Map();
  private eventHistory: Array<{ type: string; data: any; timestamp: Date }> = [];
  private maxHistorySize = 100;

  // Subscribe to events
  on<K extends EventType>(event: K, callback: EventCallback<AppEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const callbacks = this.listeners.get(event)!;
    callbacks.push(callback);

    console.log(`📡 EventBus: Subscribed to '${event}' (${callbacks.length} listeners)`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          console.log(`📡 EventBus: Unsubscribed from '${event}'`);
        }
      }
    };
  }

  // Emit events
  emit<K extends EventType>(event: K, data: AppEvents[K]): void {
    const callbacks = this.listeners.get(event) || [];
    
    console.log(`📡 EventBus: Emitting '${event}' to ${callbacks.length} listeners`, data);

    // Store in history
    this.eventHistory.push({
      type: event,
      data,
      timestamp: new Date()
    });

    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify all listeners
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`📡 EventBus: Error in listener for '${event}':`, error);
      }
    });
  }

  // Get event history
  getHistory(eventType?: EventType): Array<{ type: string; data: any; timestamp: Date }> {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  // Clear all listeners
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
    console.log('📡 EventBus: Cleared all listeners and history');
  }

  // Get listener count for debugging
  getListenerCount(event?: EventType): number {
    if (event) {
      return this.listeners.get(event)?.length || 0;
    }
    return Array.from(this.listeners.values()).reduce((total, callbacks) => total + callbacks.length, 0);
  }
}

export const eventBus = new EventBusService();
