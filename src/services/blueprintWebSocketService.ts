
interface BlueprintWebSocketMessage {
  type: 'tool_status_change' | 'heartbeat' | 'connection_status';
  data: any;
  timestamp: string;
}

class BlueprintWebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    try {
      console.log('🔌 Conectando ao WebSocket Blueprint SGF-QR v2.0...');
      
      // Para modo demo, simular conexão
      this.simulateRealTimeConnection();
      
    } catch (error) {
      console.error('Erro na conexão WebSocket:', error);
      this.simulateRealTimeConnection();
    }
  }

  private simulateRealTimeConnection(): void {
    console.log('📡 Simulando WebSocket em tempo real para Blueprint SGF-QR v2.0');
    this.isConnected = true;
    this.startHeartbeat();
    this.startRealTimeSimulation();
    
    this.notifySubscribers('connection_status', { 
      status: 'connected', 
      mode: 'blueprint_demo',
      timestamp: new Date().toISOString()
    });
  }

  private startRealTimeSimulation(): void {
    // Simular atualizações em tempo real conforme blueprint
    setInterval(() => {
      // Simular mudanças de status de ferramentas
      if (Math.random() > 0.8) {
        const toolStatuses = ['DISPONÍVEL', 'EM USO', 'EM MANUTENÇÃO'];
        const mockUpdate = {
          ferramenta_id: `FRM-${Math.floor(Math.random() * 9999).toString().padStart(6, '0')}`,
          ferramenta_nome: `Ferramenta Blueprint ${Math.floor(Math.random() * 100)}`,
          status_anterior: toolStatuses[Math.floor(Math.random() * toolStatuses.length)],
          status_novo: toolStatuses[Math.floor(Math.random() * toolStatuses.length)],
          colaborador_nome: `Colaborador ${Math.floor(Math.random() * 10)}`,
          timestamp: new Date().toISOString(),
          operacao: Math.random() > 0.5 ? 'RETIRADA' : 'DEVOLUÇÃO'
        };

        this.notifySubscribers('tool_status_change', mockUpdate);
      }
    }, 8000); // A cada 8 segundos
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.notifySubscribers('heartbeat', { 
          timestamp: new Date().toISOString(),
          status: 'alive'
        });
      }
    }, 30000); // A cada 30 segundos
  }

  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(callback);
    
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
          console.error('Erro no callback do WebSocket:', error);
        }
      });
    }
  }

  // Enviar mudança de status para outros clientes conectados
  broadcastStatusChange(data: any): void {
    const message: BlueprintWebSocketMessage = {
      type: 'tool_status_change',
      data,
      timestamp: new Date().toISOString()
    };

    if (this.isConnected) {
      console.log('📡 Broadcasting status change:', message);
      // Em produção, enviaria via WebSocket real
      this.notifySubscribers('tool_status_change', data);
    }
  }

  disconnect(): void {
    console.log('🔌 Desconectando WebSocket Blueprint...');
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscribers.clear();
  }

  getConnectionStatus(): { connected: boolean; mode: string } {
    return {
      connected: this.isConnected,
      mode: 'blueprint_demo'
    };
  }
}

export const blueprintWebSocketService = new BlueprintWebSocketService();
