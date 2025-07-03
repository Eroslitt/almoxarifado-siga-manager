
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobile } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show installer after 30 seconds if not installed
    const timer = setTimeout(() => {
      if (!isInstalled && !isVisible) {
        setIsVisible(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled, isVisible]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Show again in 24 hours
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              Instalar SIGA
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Instale o SIGA em seu dispositivo para acesso rápido e funcionalidades offline.
          </p>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              📱 Acesso offline
            </Badge>
            <Badge variant="secondary" className="text-xs">
              🔔 Notificações
            </Badge>
            <Badge variant="secondary" className="text-xs">
              ⚡ Mais rápido
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Instalar
            </Button>
            <Button variant="outline" onClick={handleDismiss} size="sm">
              Depois
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
