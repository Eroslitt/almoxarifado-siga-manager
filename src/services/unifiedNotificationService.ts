
import { eventBus } from './eventBus';
import { advancedCacheService } from './advancedCacheService';
import { AppNotification } from '@/types/global';

class UnifiedNotificationService {
  private notificationQueue: AppNotification[] = [];
  private isProcessing = false;

  async init(): Promise<void> {
    console.log('🔔 Initializing Unified Notification Service...');
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Set up event listeners
    this.setupEventListeners();
    
    // Process any queued notifications
    this.processQueue();
  }

  private setupEventListeners(): void {
    // Listen to all events that should trigger notifications
    eventBus.on('tool:checkout', (data) => {
      this.createNotification({
        type: 'info',
        title: 'Ferramenta Retirada',
        message: `${data.toolId} retirada por ${data.userId}`,
        priority: 'medium'
      });
    });

    eventBus.on('tool:checkin', (data) => {
      this.createNotification({
        type: 'success',
        title: 'Ferramenta Devolvida',
        message: `${data.toolId} devolvida por ${data.userId}`,
        priority: 'low'
      });
    });

    eventBus.on('maintenance:scheduled', (data) => {
      this.createNotification({
        type: 'info',
        title: 'Manutenção Agendada',
        message: `Manutenção de ${data.toolId} agendada para ${data.date.toLocaleDateString('pt-BR')}`,
        priority: 'medium'
      });
    });

    eventBus.on('anomaly:detected', (data) => {
      this.createNotification({
        type: data.severity === 'high' ? 'error' : 'warning',
        title: 'Anomalia Detectada',
        message: `${data.type} - Severidade: ${data.severity}`,
        priority: data.severity,
        actionUrl: data.toolId ? `/tools/${data.toolId}` : undefined
      });
    });

    eventBus.on('reservation:created', (data) => {
      this.createNotification({
        type: 'info',
        title: 'Nova Reserva',
        message: `Reserva criada para ${data.toolId}`,
        priority: 'medium',
        actionUrl: `/reservations/${data.reservationId}`
      });
    });

    eventBus.on('stock:low', (data) => {
      this.createNotification({
        type: 'warning',
        title: 'Estoque Baixo',
        message: `${data.itemId}: ${data.currentStock} unidades (mín: ${data.minStock})`,
        priority: 'high'
      });
    });
  }

  private createNotification(params: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const notification: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...params
    };

    this.notificationQueue.push(notification);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift()!;
        
        // Add to global state via event bus
        eventBus.emit('system:notification:created', notification);
        
        // Show browser notification if permitted and enabled
        await this.showBrowserNotification(notification);
        
        // Cache notification
        await this.cacheNotification(notification);
        
        // Small delay to prevent spam
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error processing notification queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async showBrowserNotification(notification: AppNotification): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        data: {
          id: notification.id,
          actionUrl: notification.actionUrl
        }
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close low priority notifications
      if (notification.priority === 'low') {
        setTimeout(() => browserNotification.close(), 5000);
      }

    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  private async cacheNotification(notification: AppNotification): Promise<void> {
    try {
      const cached = await advancedCacheService.get<AppNotification[]>('recent-notifications') || [];
      const updated = [notification, ...cached.slice(0, 99)]; // Keep last 100
      await advancedCacheService.set('recent-notifications', updated, 86400); // 24 hours
    } catch (error) {
      console.error('Error caching notification:', error);
    }
  }

  async getRecentNotifications(): Promise<AppNotification[]> {
    try {
      return await advancedCacheService.get<AppNotification[]>('recent-notifications') || [];
    } catch (error) {
      console.error('Error loading recent notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const cached = await advancedCacheService.get<AppNotification[]>('recent-notifications') || [];
      const updated = cached.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await advancedCacheService.set('recent-notifications', updated, 86400);
      
      // Emit event for global state update
      eventBus.emit('system:notification:read', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await advancedCacheService.invalidate('recent-notifications');
      eventBus.emit('system:notifications:cleared', {});
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}

export const unifiedNotificationService = new UnifiedNotificationService();
