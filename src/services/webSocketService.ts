
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id: string;
}

interface ConnectionConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: ConnectionConfig;
  private reconnectAttempts = 0;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor() {
    this.config = {
      url: 'wss://demo-websocket.lovable.app/siga', // Demo WebSocket
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    };
  }

  async connect(): Promise<void> {
    try {
      console.log('🔌 Connecting to WebSocket...');
      
      // For demo mode, simulate WebSocket connection
      if (window.location.hostname === 'localhost' || !navigator.onLine) {
        this.simulateConnection();
        return;
      }

      this.ws = new WebSocket(this.config.url);
      this.setupEventListeners();
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.simulateConnection();
    }
  }

  private simulateConnection(): void {
    console.log('📡 Using simulated WebSocket for demo mode');
    this.isConnected = true;
    this.startHeartbeat();
    this.simulateRealTimeData();
    
    // Notify subscribers about connection
    this.notifySubscribers('connection', { status: 'connected', mode: 'demo' });
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.processMessageQueue();
      
      this.notifySubscribers('connection', { status: 'connected', mode: 'live' });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('❌ WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.stopHeartbeat();
      
      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
      
      this.notifySubscribers('connection', { status: 'disconnected', code: event.code });
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifySubscribers('error', { error: error.toString() });
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('📨 WebSocket message received:', message.type);
    
    switch (message.type) {
      case 'tool_movement':
        this.notifySubscribers('tool_movement', message.data);
        break;
      case 'stock_alert':
        this.notifySubscribers('stock_alert', message.data);
        break;
      case 'maintenance_alert':
        this.notifySubscribers('maintenance_alert', message.data);
        break;
      case 'reservation_update':
        this.notifySubscribers('reservation_update', message.data);
        break;
      case 'system_notification':
        this.notifySubscribers('system_notification', message.data);
        break;
      case 'heartbeat':
        // Acknowledge heartbeat
        this.send({ type: 'heartbeat_ack', data: {}, timestamp: new Date().toISOString(), id: this.generateId() });
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private simulateRealTimeData(): void {
    // Simulate real-time updates for demo
    setInterval(() => {
      // Simulate tool movements
      if (Math.random() > 0.7) {
        this.notifySubscribers('tool_movement', {
          id: this.generateId(),
          type: Math.random() > 0.5 ? 'checkout' : 'checkin',
          tool: {
            id: `FER-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
            name: `Ferramenta Demo ${Math.floor(Math.random() * 100)}`,
            category: 'Demonstração'
          },
          user: {
            name: `Usuário Demo ${Math.floor(Math.random() * 10)}`,
            department: 'Almoxarifado'
          },
          timestamp: new Date().toISOString(),
          location: `A-${Math.floor(Math.random() * 5)}-${Math.floor(Math.random() * 10)}`
        });
      }

      // Simulate stock alerts
      if (Math.random() > 0.9) {
        this.notifySubscribers('stock_alert', {
          id: this.generateId(),
          item: `Item Demo ${Math.floor(Math.random() * 100)}`,
          currentStock: Math.floor(Math.random() * 20),
          minStock: 50,
          timestamp: new Date().toISOString()
        });
      }
    }, 10000); // Every 10 seconds
  }

  send(message: WebSocketMessage): void {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
      console.log('📝 Message queued (not connected)');
    }
  }

  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  private notifySubscribers(eventType: string, data: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket subscriber callback:', error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'heartbeat',
          data: { timestamp: Date.now() },
          timestamp: new Date().toISOString(),
          id: this.generateId()
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
      this.connect();
    }, this.config.reconnectInterval);
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  sendToolMovement(movement: any): void {
    this.send({
      type: 'tool_movement',
      data: movement,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    });
  }

  sendStockUpdate(update: any): void {
    this.send({
      type: 'stock_update',
      data: update,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    });
  }

  sendReservationUpdate(reservation: any): void {
    this.send({
      type: 'reservation_update',
      data: reservation,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    });
  }

  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscribers.clear();
    this.messageQueue = [];
  }

  getConnectionStatus(): { connected: boolean; attempts: number; queueSize: number } {
    return {
      connected: this.isConnected,
      attempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length
    };
  }
}

export const webSocketService = new WebSocketService();
