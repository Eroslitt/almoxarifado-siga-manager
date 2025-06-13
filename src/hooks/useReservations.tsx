
import { useState, useEffect, useCallback } from 'react';
import { reservationAdvancedService } from '@/services/reservationAdvancedService';

export const useReservations = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await reservationAdvancedService.getReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
      setError('Erro ao carregar reservas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCalendar = useCallback(async (startDate: string, endDate: string) => {
    try {
      const data = await reservationAdvancedService.getCalendar(startDate, endDate);
      setCalendar(data);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  }, []);

  const createReservation = useCallback(async (reservationData: any) => {
    try {
      await reservationAdvancedService.createReservation(reservationData);
      await loadReservations();
      return true;
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError('Erro ao criar reserva');
      return false;
    }
  }, [loadReservations]);

  const approveReservation = useCallback(async (reservationId: string, approvedBy: string) => {
    try {
      await reservationAdvancedService.approveReservation(reservationId, approvedBy);
      await loadReservations();
      return true;
    } catch (error) {
      console.error('Error approving reservation:', error);
      setError('Erro ao aprovar reserva');
      return false;
    }
  }, [loadReservations]);

  useEffect(() => {
    loadReservations();
    
    // Check for expiring reservations every 30 seconds
    const interval = setInterval(() => {
      reservationAdvancedService.checkExpiringReservations();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadReservations]);

  return {
    reservations,
    calendar,
    isLoading,
    error,
    loadReservations,
    loadCalendar,
    createReservation,
    approveReservation
  };
};
