
import { useEffect, useCallback } from 'react';
import { useToolsContext } from '@/contexts/ToolsContext';
import { webSocketService } from '@/services/webSocketService';
import { notificationService } from '@/services/notificationService';

export const useRealTimeUpdates = () => {
  const { state, actions } = useToolsContext();

  const handleToolMovement = useCallback((data: any) => {
    console.log('🔧 Real-time tool movement:', data);
    
    // Update tool status in context
    if (data.tool && data.user && data.type) {
      actions.updateToolStatus(data.tool.id, {
        ferramenta: data.tool.name,
        status: data.type === 'checkout' ? 'EM USO' : 'DISPONÍVEL',
        responsavel_atual: data.type === 'checkout' ? data.user.name : null,
        retirada_em: data.type === 'checkout' ? new Date().toLocaleString('pt-BR') : null,
        tempo_posse: null
      });

      // Show notification
      notificationService.showToolMovement(
        data.tool.name, 
        data.user.name, 
        data.type
      );
    }
  }, [actions]);

  const handleStockAlert = useCallback((data: any) => {
    console.log('📦 Real-time stock alert:', data);
    
    notificationService.showStockAlert(
      data.item, 
      data.currentStock, 
      data.minStock
    );
  }, []);

  const connectWebSocket = useCallback(async () => {
    try {
      await webSocketService.connect();
      
      // Subscribe to real-time events
      webSocketService.subscribe('tool_movement', handleToolMovement);
      webSocketService.subscribe('stock_alert', handleStockAlert);
      
      console.log('🌐 WebSocket connected for real-time updates');
    } catch (error) {
      console.error('❌ Error connecting WebSocket:', error);
    }
  }, [handleToolMovement, handleStockAlert]);

  const disconnectWebSocket = useCallback(() => {
    webSocketService.disconnect();
    console.log('🌐 WebSocket disconnected');
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  return {
    isConnected: true, // WebSocket service manages connection state
    connectWebSocket,
    disconnectWebSocket
  };
};
