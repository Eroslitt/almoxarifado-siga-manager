
interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  actions?: NotificationAction[];
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private registration: ServiceWorkerRegistration | null = null;
  private subscribers: Map<string, (notification: any) => void> = new Map();

  async init(): Promise<void> {
    console.log('🔔 Initializing Notification Service...');

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    // Request permission
    this.permission = await this.requestPermission();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Listen for messages from service worker
    navigator.serviceWorker?.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (this.permission === 'granted') return this.permission;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
      } else {
        console.warn('❌ Notification permission denied');
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  async show(config: NotificationConfig): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notifications not permitted');
      return;
    }

    try {
      if (this.registration) {
        // Use service worker notification
        await this.registration.showNotification(config.title, {
          body: config.body,
          icon: config.icon || '/favicon.ico',
          badge: config.badge || '/favicon.ico',
          tag: config.tag || `siga-${Date.now()}`,
          data: config.data,
          actions: config.actions,
          requireInteraction: config.requireInteraction || false,
          silent: config.silent || false,
          vibrate: [200, 100, 200]
        });
      } else {
        // Fallback to regular notification
        const notification = new Notification(config.title, {
          body: config.body,
          icon: config.icon || '/favicon.ico',
          tag: config.tag || `siga-${Date.now()}`,
          data: config.data,
          requireInteraction: config.requireInteraction || false,
          silent: config.silent || false
        });

        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          notification.close();
          
          if (config.data?.url) {
            window.location.href = config.data.url;
          }
        };
      }

      console.log('📧 Notification sent:', config.title);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Predefined notification types for SIGA
  async showStockAlert(item: string, currentStock: number, minStock: number): Promise<void> {
    await this.show({
      title: '⚠️ Estoque Crítico',
      body: `${item}: ${currentStock} unidades (mín: ${minStock})`,
      tag: 'stock-alert',
      requireInteraction: true,
      data: { type: 'stock-alert', item, currentStock, minStock, url: '/?module=stock' },
      actions: [
        { action: 'view', title: 'Ver Estoque', icon: '/icons/view.png' },
        { action: 'ignore', title: 'Ignorar', icon: '/icons/close.png' }
      ]
    });
  }

  async showToolMovement(toolName: string, user: string, action: 'checkout' | 'checkin'): Promise<void> {
    const actionText = action === 'checkout' ? 'Retirada' : 'Devolução';
    
    await this.show({
      title: `🔧 ${actionText} de Ferramenta`,
      body: `${toolName} - ${user}`,
      tag: 'tool-movement',
      data: { type: 'tool-movement', toolName, user, action, url: '/?module=tools-qr' },
      actions: [
        { action: 'view', title: 'Ver Detalhes', icon: '/icons/view.png' }
      ]
    });
  }

  async showMaintenanceAlert(toolName: string, type: 'due' | 'overdue'): Promise<void> {
    const title = type === 'due' ? '🔧 Manutenção Programada' : '⚠️ Manutenção Atrasada';
    
    await this.show({
      title,
      body: `${toolName} precisa de manutenção`,
      tag: 'maintenance-alert',
      requireInteraction: type === 'overdue',
      data: { type: 'maintenance-alert', toolName, maintenanceType: type, url: '/?module=tools-qr&tab=maintenance' },
      actions: [
        { action: 'schedule', title: 'Agendar', icon: '/icons/calendar.png' },
        { action: 'view', title: 'Ver Detalhes', icon: '/icons/view.png' }
      ]
    });
  }

  async showReservationReminder(toolName: string, reservedUntil: string): Promise<void> {
    await this.show({
      title: '⏰ Lembrete de Reserva',
      body: `${toolName} reservado até ${reservedUntil}`,
      tag: 'reservation-reminder',
      data: { type: 'reservation-reminder', toolName, reservedUntil, url: '/?module=tools-qr&tab=reservations' },
      actions: [
        { action: 'extend', title: 'Estender', icon: '/icons/clock.png' },
        { action: 'return', title: 'Devolver', icon: '/icons/return.png' }
      ]
    });
  }

  subscribe(eventType: string, callback: (notification: any) => void): void {
    this.subscribers.set(eventType, callback);
  }

  unsubscribe(eventType: string): void {
    this.subscribers.delete(eventType);
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    if (this.subscribers.has(type)) {
      const callback = this.subscribers.get(type);
      callback?.(data);
    }
  }

  async clearAll(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
      console.log(`🗑️ Cleared ${notifications.length} notifications`);
    }
  }

  async getNotifications(): Promise<Notification[]> {
    if (this.registration) {
      return await this.registration.getNotifications();
    }
    return [];
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = new NotificationService();
