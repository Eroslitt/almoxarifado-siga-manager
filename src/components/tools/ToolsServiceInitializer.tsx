
import React, { useEffect } from 'react';
import { useToolsServices } from '@/hooks/useToolsServices';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { MobileLoading } from '@/components/ui/mobile-loading';

interface ToolsServiceInitializerProps {
  children: React.ReactNode;
}

export const ToolsServiceInitializer: React.FC<ToolsServiceInitializerProps> = ({ children }) => {
  const { initializeServices, isInitialized, state } = useToolsServices();
  const { isConnected } = useRealTimeUpdates();

  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  if (!isInitialized || state.isLoading) {
    return (
      <div className="p-4 lg:p-6 min-h-screen flex items-center justify-center">
        <MobileLoading 
          size="lg"
          text="Inicializando SGF-QR Avançado... Carregando cache, notificações e serviços em tempo real"
        />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="p-4 lg:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️ Erro de Inicialização</div>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={initializeServices}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
