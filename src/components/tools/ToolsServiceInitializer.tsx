import React, { useEffect, useState, useCallback } from 'react';
import { MobileLoading } from '@/components/ui/mobile-loading';
import { cacheService } from '@/services/cacheService';
import { notificationService } from '@/services/notificationService';

interface ToolsServiceInitializerProps {
  children: React.ReactNode;
}

export const ToolsServiceInitializer: React.FC<ToolsServiceInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing Tools Services...');
      
      // Initialize services in parallel with timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      await Promise.race([
        Promise.all([
          cacheService.init().catch(err => {
            console.warn('Cache init failed (continuing):', err);
          }),
          notificationService.init().catch(err => {
            console.warn('Notification init failed (continuing):', err);
          })
        ]),
        timeout
      ]);

      console.log('✅ Tools services initialized successfully');
      setIsInitialized(true);

    } catch (err) {
      console.error('❌ Error initializing tools services:', err);
      // Still allow the app to work even if services fail
      setIsInitialized(true);
      setError(null); // Don't show error, just log it
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  if (isLoading && !isInitialized) {
    return (
      <div className="p-4 lg:p-6 min-h-screen flex items-center justify-center">
        <MobileLoading 
          size="lg"
          text="Carregando sistema..."
        />
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div className="p-4 lg:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-destructive text-xl mb-4">⚠️ Erro de Inicialização</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={initializeServices}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};