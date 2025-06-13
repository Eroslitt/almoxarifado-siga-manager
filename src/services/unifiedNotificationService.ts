import { eventBus } from './eventBus';
import { AppNotification } from '@/types/global';

class UnifiedNotificationService {
  private notifications: AppNotification[] = [];
  private subscribers: ((notifications: AppNotification[]) => void)[] = [];
  private unreadCount: number = 0;

  constructor() {
    console.log('📢 Unified Notification Service started');
    this.loadFromLocalStorage();
  }

  private notifySubscribers() {
    this.subscribers.forEach(subscriber => subscriber([...this.notifications]));
  }

  public subscribe(callback: (notifications: AppNotification[]) => void): () => void {
    this.subscribers.push(callback);
    callback([...this.notifications]); // Emit initial value
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
      console.log('📢 Subscriber unsubscribed');
    };
  }

  public unsubscribe(callback: (notifications: AppNotification[]) => void): void {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  async create(notification: Omit<AppNotification, 'id' | 'timestamp'>): Promise<AppNotification> {
    const newNotification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    if (!newNotification.read) {
      this.unreadCount++;
    }

    this.notifySubscribers();

    // Emit event with correct payload structure
    eventBus.emit('system:notification:created', {
      notificationId: newNotification.id,
      type: newNotification.type,
      timestamp: newNotification.timestamp
    });

    console.log('📢 Notification created:', newNotification);
    return newNotification;
  }

  async getAll(): Promise<AppNotification[]> {
    return [...this.notifications];
  }

  async getUnread(): Promise<AppNotification[]> {
    return this.notifications.filter(notification => !notification.read);
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notifySubscribers();

      // Emit event with correct payload structure
      eventBus.emit('system:notification:read', {
        notificationId: id,
        timestamp: new Date()
      });
    }
  }

  async clearAll(): Promise<void> {
    const count = this.notifications.length;
    this.notifications = [];
    this.unreadCount = 0;
    this.notifySubscribers();

    // Emit event with correct payload structure
    eventBus.emit('system:notifications:cleared', {
      count,
      timestamp: new Date()
    });
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  async setSettings(settings: any): Promise<void> {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }

  async getSettings(): Promise<any> {
    const settings = localStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : {};
  }

  private async loadFromLocalStorage(): Promise<void> {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      this.notifications = JSON.parse(storedNotifications);
      this.unreadCount = this.notifications.filter(n => !n.read).length;
      this.notifySubscribers();
    }
  }

  private async saveToLocalStorage(): Promise<void> {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
}

export const unifiedNotificationService = new UnifiedNotificationService();
