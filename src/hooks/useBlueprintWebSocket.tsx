
import { useEffect, useState } from 'react';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';

// Hook para WebSocket em tempo real conforme blueprint
export const useBlueprintWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState<BlueprintLiveStatus[]>([]);

  useEffect(() => {
    // Simular WebSocket para modo demo
    // Em produção, conectaria ao WebSocket real
    const mockWebSocket = () => {
      setIsConnected(true);
      
      // Simular atualizações em tempo real
      const interval = setInterval(() => {
        // Mock de dados que chegam via WebSocket
        const mockUpdate: BlueprintLiveStatus = {
          ferramenta: 'Parafusadeira de Impacto Bosch GDX 18V',
          status: Math.random() > 0.5 ? 'DISPONÍVEL' : 'EM USO',
          responsavel_atual: Math.random() > 0.5 ? 'João Silva' : null,
          retirada_em: new Date().toLocaleString('pt-BR'),
          tempo_posse: '2h 15min'
        };

        setLiveData(prev => {
          const updated = [...prev];
          const index = updated.findIndex(item => item.ferramenta === mockUpdate.ferramenta);
          
          if (index >= 0) {
            updated[index] = mockUpdate;
          } else {
            updated.push(mockUpdate);
          }
          
          return updated;
        });
      }, 10000); // Atualizar a cada 10 segundos

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    };

    const cleanup = mockWebSocket();
    return cleanup;
  }, []);

  const sendMessage = (message: any) => {
    // Em produção, enviaria via WebSocket real
    console.log('📡 Enviando via WebSocket:', message);
  };

  return {
    isConnected,
    liveData,
    sendMessage
  };
};
