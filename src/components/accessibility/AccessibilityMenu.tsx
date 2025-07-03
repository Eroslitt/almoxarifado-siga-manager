
import React, { useState, useEffect } from 'react';
import { Accessibility, Eye, Type, Contrast, Volume2, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNav: boolean;
  fontSize: number;
  voiceSpeed: number;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNav: true,
  fontSize: 100,
  voiceSpeed: 1
};

export const AccessibilityMenu: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Apply settings to document
    applySettings(settings);
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.style.fontSize = `${settings.fontSize}%`;

    // Keyboard navigation
    if (settings.keyboardNav) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const announceChange = (message: string) => {
    if (settings.screenReader) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-4 left-4 z-50 rounded-full h-12 w-12 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Menu de Acessibilidade"
        >
          <Accessibility className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start" side="top">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Acessibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex items-center gap-2">
                  <Contrast className="h-4 w-4" />
                  Alto Contraste
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => {
                    updateSetting('highContrast', checked);
                    announceChange(`Alto contraste ${checked ? 'ativado' : 'desativado'}`);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="large-text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Texto Grande
                </Label>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => {
                    updateSetting('largeText', checked);
                    announceChange(`Texto grande ${checked ? 'ativado' : 'desativado'}`);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Reduzir Animações
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => {
                    updateSetting('reducedMotion', checked);
                    announceChange(`Animações reduzidas ${checked ? 'ativadas' : 'desativadas'}`);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-nav" className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Navegação por Teclado
                </Label>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNav}
                  onCheckedChange={(checked) => {
                    updateSetting('keyboardNav', checked);
                    announceChange(`Navegação por teclado ${checked ? 'ativada' : 'desativada'}`);
                  }}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">
                  Tamanho da Fonte: {settings.fontSize}%
                </Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={75}
                  max={150}
                  step={5}
                  className="mt-2"
                />
              </div>

              {settings.screenReader && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Velocidade da Voz: {settings.voiceSpeed}x
                  </Label>
                  <Slider
                    value={[settings.voiceSpeed]}
                    onValueChange={([value]) => updateSetting('voiceSpeed', value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="flex-1"
              >
                Resetar
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
