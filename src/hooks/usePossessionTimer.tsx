
import { useState, useEffect } from 'react';

interface PossessionTimerProps {
  startTime: string | null;
  isActive: boolean;
}

export const usePossessionTimer = ({ startTime, isActive }: PossessionTimerProps) => {
  const [timeDisplay, setTimeDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!startTime || !isActive) {
      setTimeDisplay(null);
      return;
    }

    const updateTimer = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      
      const horas = Math.floor(diffMs / (1000 * 60 * 60));
      const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (horas > 0) {
        setTimeDisplay(`${horas}h ${minutos}min`);
      } else {
        setTimeDisplay(`${minutos}min`);
      }
    };

    // Atualizar imediatamente
    updateTimer();
    
    // Atualizar a cada minuto
    const interval = setInterval(updateTimer, 60000);
    
    return () => clearInterval(interval);
  }, [startTime, isActive]);

  return timeDisplay;
};
