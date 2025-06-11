
import { supabase } from '@/lib/supabase';
import { ToolReservation } from '@/types/database';

export interface CreateReservationRequest {
  toolId: string;
  userId: string;
  reservedFrom: string;
  reservedUntil: string;
  priority?: number;
  notes?: string;
}

class ReservationsApiService {
  // Criar nova reserva
  async createReservation(request: CreateReservationRequest): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se a ferramenta está disponível no período
      const { data: conflicts, error: conflictError } = await supabase
        .from('tool_reservations')
        .select('*')
        .eq('tool_id', request.toolId)
        .eq('status', 'active')
        .or(`reserved_from.lte.${request.reservedUntil},reserved_until.gte.${request.reservedFrom}`);

      if (conflictError) {
        console.error('Erro ao verificar conflitos:', conflictError);
        return { success: false, message: 'Erro ao verificar disponibilidade' };
      }

      if (conflicts && conflicts.length > 0) {
        return { success: false, message: 'Ferramenta já reservada para este período' };
      }

      const { error } = await supabase
        .from('tool_reservations')
        .insert({
          tool_id: request.toolId,
          user_id: request.userId,
          reserved_from: request.reservedFrom,
          reserved_until: request.reservedUntil,
          priority: request.priority || 1,
          notes: request.notes || null,
          status: 'active'
        });

      if (error) {
        console.error('Erro ao criar reserva:', error);
        return { success: false, message: 'Erro ao criar reserva' };
      }

      return { success: true, message: 'Reserva criada com sucesso' };
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Buscar reservas do usuário
  async getUserReservations(userId: string): Promise<ToolReservation[]> {
    try {
      const { data, error } = await supabase
        .from('tool_reservations')
        .select(`
          *,
          tools(name, category, location)
        `)
        .eq('user_id', userId)
        .in('status', ['active', 'completed'])
        .order('reserved_from', { ascending: true });

      if (error) {
        console.error('Erro ao buscar reservas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return [];
    }
  }

  // Buscar reservas de uma ferramenta
  async getToolReservations(toolId: string): Promise<ToolReservation[]> {
    try {
      const { data, error } = await supabase
        .from('tool_reservations')
        .select(`
          *,
          users(name, department)
        `)
        .eq('tool_id', toolId)
        .eq('status', 'active')
        .order('reserved_from', { ascending: true });

      if (error) {
        console.error('Erro ao buscar reservas da ferramenta:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reservas da ferramenta:', error);
      return [];
    }
  }

  // Cancelar reserva
  async cancelReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('tool_reservations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (error) {
        console.error('Erro ao cancelar reserva:', error);
        return { success: false, message: 'Erro ao cancelar reserva' };
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
      const { error } = await supabase
        .from('tool_reservations')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (error) {
        console.error('Erro ao completar reserva:', error);
        return { success: false, message: 'Erro ao completar reserva' };
      }

      return { success: true, message: 'Reserva completada' };
    } catch (error) {
      console.error('Erro ao completar reserva:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }
}

export const reservationsApi = new ReservationsApiService();
