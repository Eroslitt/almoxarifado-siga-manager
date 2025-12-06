
import { ToolReservation } from '@/types/database';

export interface CreateReservationRequest {
  toolId: string;
  userId: string;
  reservedFrom: string;
  reservedUntil: string;
  priority?: number;
  notes?: string;
}

// In-memory store for reservations
const reservationStore: ToolReservation[] = [];

class ReservationsApiService {
  // Criar nova reserva
  async createReservation(request: CreateReservationRequest): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar conflitos
      const conflicts = reservationStore.filter(r => 
        r.tool_id === request.toolId && 
        r.status === 'active' &&
        (new Date(r.reserved_from) <= new Date(request.reservedUntil) && 
         new Date(r.reserved_until) >= new Date(request.reservedFrom))
      );

      if (conflicts.length > 0) {
        return { success: false, message: 'Ferramenta já reservada para este período' };
      }

      const newReservation: ToolReservation = {
        id: crypto.randomUUID(),
        tool_id: request.toolId,
        user_id: request.userId,
        reserved_from: request.reservedFrom,
        reserved_until: request.reservedUntil,
        priority: request.priority || 1,
        notes: request.notes || '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      reservationStore.push(newReservation);
      return { success: true, message: 'Reserva criada com sucesso' };
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Buscar reservas do usuário
  async getUserReservations(userId: string): Promise<ToolReservation[]> {
    try {
      return reservationStore
        .filter(r => r.user_id === userId && ['active', 'completed'].includes(r.status))
        .sort((a, b) => new Date(a.reserved_from).getTime() - new Date(b.reserved_from).getTime());
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return [];
    }
  }

  // Buscar reservas de uma ferramenta
  async getToolReservations(toolId: string): Promise<ToolReservation[]> {
    try {
      return reservationStore
        .filter(r => r.tool_id === toolId && r.status === 'active')
        .sort((a, b) => new Date(a.reserved_from).getTime() - new Date(b.reserved_from).getTime());
    } catch (error) {
      console.error('Erro ao buscar reservas da ferramenta:', error);
      return [];
    }
  }

  // Cancelar reserva
  async cancelReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const reservation = reservationStore.find(r => r.id === reservationId);
      if (reservation) {
        reservation.status = 'cancelled';
        reservation.updated_at = new Date().toISOString();
      }
      return { success: true, message: 'Reserva cancelada com sucesso' };
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Completar reserva (quando a ferramenta é retirada)
  async completeReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const reservation = reservationStore.find(r => r.id === reservationId);
      if (reservation) {
        reservation.status = 'completed';
        reservation.updated_at = new Date().toISOString();
      }
      return { success: true, message: 'Reserva completada' };
    } catch (error) {
      console.error('Erro ao completar reserva:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }
}

export const reservationsApi = new ReservationsApiService();
