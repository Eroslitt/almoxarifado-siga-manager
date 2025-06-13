
import { advancedCacheService } from './advancedCacheService';
import { notificationService } from './notificationService';

interface ToolReservation {
  id: string;
  toolId: string;
  toolName: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  purpose: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

interface ReservationCalendar {
  date: string;
  reservations: ToolReservation[];
  availability: {
    total: number;
    available: number;
    reserved: number;
  };
}

class ReservationAdvancedService {
  async createReservation(reservation: Omit<ToolReservation, 'id' | 'createdAt' | 'status'>): Promise<ToolReservation> {
    const newReservation: ToolReservation = {
      ...reservation,
      id: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Cache the reservation
    const existingReservations = await this.getReservations();
    await advancedCacheService.set('tool-reservations', [...existingReservations, newReservation], 3600);

    // Send notification to approvers
    await notificationService.show({
      title: '📅 Nova Reserva Pendente',
      body: `${reservation.userName} solicitou reserva de ${reservation.toolName}`,
      tag: 'reservation-approval',
      requireInteraction: true,
      data: { type: 'reservation-approval', reservationId: newReservation.id }
    });

    console.log('✅ Reservation created:', newReservation);
    return newReservation;
  }

  async approveReservation(reservationId: string, approvedBy: string): Promise<void> {
    const reservations = await this.getReservations();
    const updated = reservations.map(res => 
      res.id === reservationId 
        ? { ...res, status: 'approved' as const, approvedBy, approvedAt: new Date().toISOString() }
        : res
    );

    await advancedCacheService.set('tool-reservations', updated, 3600);

    const reservation = updated.find(r => r.id === reservationId);
    if (reservation) {
      await notificationService.show({
        title: '✅ Reserva Aprovada',
        body: `Sua reserva de ${reservation.toolName} foi aprovada`,
        tag: 'reservation-approved',
        data: { type: 'reservation-approved', reservationId }
      });
    }
  }

  async getReservations(): Promise<ToolReservation[]> {
    const cached = await advancedCacheService.get<ToolReservation[]>('tool-reservations');
    if (cached) return cached;

    // Mock data for demo
    const mockReservations: ToolReservation[] = [
      {
        id: 'RES-001',
        toolId: 'FER-08172',
        toolName: 'Furadeira de Impacto Makita',
        userId: 'USER-001',
        userName: 'João Silva',
        startDate: '2024-06-14T08:00:00Z',
        endDate: '2024-06-14T17:00:00Z',
        status: 'approved',
        purpose: 'Instalação de equipamentos',
        createdAt: '2024-06-13T10:00:00Z',
        approvedBy: 'ADMIN-001',
        approvedAt: '2024-06-13T11:00:00Z'
      }
    ];

    await advancedCacheService.set('tool-reservations', mockReservations, 3600);
    return mockReservations;
  }

  async getCalendar(startDate: string, endDate: string): Promise<ReservationCalendar[]> {
    const reservations = await this.getReservations();
    const calendar: ReservationCalendar[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      const dayReservations = reservations.filter(res => 
        res.startDate.startsWith(dateString) || 
        (res.startDate <= dateString && res.endDate >= dateString)
      );

      calendar.push({
        date: dateString,
        reservations: dayReservations,
        availability: {
          total: 100, // Mock total tools
          available: 100 - dayReservations.length,
          reserved: dayReservations.length
        }
      });
    }

    return calendar;
  }

  async checkExpiringReservations(): Promise<void> {
    const reservations = await this.getReservations();
    const now = new Date();
    const oneHour = 60 * 60 * 1000;

    for (const reservation of reservations) {
      if (reservation.status === 'active') {
        const endTime = new Date(reservation.endDate).getTime();
        const timeLeft = endTime - now.getTime();

        if (timeLeft <= oneHour && timeLeft > 0) {
          await notificationService.showReservationReminder(
            reservation.toolName,
            new Date(reservation.endDate).toLocaleString('pt-BR')
          );
        }
      }
    }
  }
}

export const reservationAdvancedService = new ReservationAdvancedService();
