
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from './notificationService';
import { cacheService } from './cacheService';

interface ReservationRequest {
  toolId: string;
  userId: string;
  userName: string;
  reservedFrom: string;
  reservedUntil: string;
  priority: number;
  notes?: string;
  autoExtend?: boolean;
}

interface Reservation {
  id: string;
  toolId: string;
  toolName: string;
  userId: string;
  userName: string;
  reservedFrom: string;
  reservedUntil: string;
  priority: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  autoExtend: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
  reservedBy?: string;
}

class ReservationService {
  private reservations: Map<string, Reservation> = new Map();
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  async init(): Promise<void> {
    console.log('📅 Initializing Reservation Service...');
    
    // Load cached reservations
    const cached = await cacheService.get('reservations');
    if (cached) {
      cached.forEach((res: Reservation) => this.reservations.set(res.id, res));
    }

    // Start monitoring
    this.startMonitoring();
    console.log('✅ Reservation Service initialized');
  }

  async createReservation(request: ReservationRequest): Promise<{ success: boolean; message: string; reservationId?: string }> {
    try {
      // Check availability
      const conflicts = await this.checkConflicts(request.toolId, request.reservedFrom, request.reservedUntil);
      
      if (conflicts.length > 0) {
        return {
          success: false,
          message: `Ferramenta já reservada. Conflitos encontrados: ${conflicts.map(c => c.userName).join(', ')}`
        };
      }

      // Create reservation
      const reservation: Reservation = {
        id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        toolId: request.toolId,
        toolName: await this.getToolName(request.toolId),
        userId: request.userId,
        userName: request.userName,
        reservedFrom: request.reservedFrom,
        reservedUntil: request.reservedUntil,
        priority: request.priority,
        status: 'active',
        notes: request.notes,
        autoExtend: request.autoExtend || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store reservation
      this.reservations.set(reservation.id, reservation);
      await this.syncReservations();

      // Schedule monitoring
      this.scheduleReminders(reservation);

      // Send confirmation notification
      await notificationService.show({
        title: '✅ Reserva Confirmada',
        body: `${reservation.toolName} reservado de ${new Date(request.reservedFrom).toLocaleDateString()} até ${new Date(request.reservedUntil).toLocaleDateString()}`,
        tag: 'reservation-confirmed',
        data: { type: 'reservation-confirmed', reservationId: reservation.id }
      });

      console.log(`📅 Reservation created: ${reservation.id}`);
      
      return {
        success: true,
        message: 'Reserva criada com sucesso',
        reservationId: reservation.id
      };

    } catch (error) {
      console.error('Error creating reservation:', error);
      return {
        success: false,
        message: 'Erro interno ao criar reserva'
      };
    }
  }

  async createQuickReservation(toolId: string, qrCode: string): Promise<{ success: boolean; message: string }> {
    // Quick reservation for 2 hours when scanning QR
    const now = new Date();
    const until = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    return await this.createReservation({
      toolId,
      userId: 'current-user', // Would get from auth context
      userName: 'Usuário Atual',
      reservedFrom: now.toISOString(),
      reservedUntil: until.toISOString(),
      priority: 2,
      notes: `Reserva rápida via QR: ${qrCode}`,
      autoExtend: false
    });
  }

  async checkAvailability(toolId: string, from: string, to: string): Promise<AvailabilitySlot[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const slots: AvailabilitySlot[] = [];

    // Generate hourly slots
    const current = new Date(fromDate);
    while (current < toDate) {
      const slotEnd = new Date(current.getTime() + 60 * 60 * 1000); // 1 hour slots
      
      const conflicts = await this.checkConflicts(toolId, current.toISOString(), slotEnd.toISOString());
      
      slots.push({
        start: current.toISOString(),
        end: slotEnd.toISOString(),
        available: conflicts.length === 0,
        reservedBy: conflicts.length > 0 ? conflicts[0].userName : undefined
      });

      current.setHours(current.getHours() + 1);
    }

    return slots;
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(a.reservedFrom).getTime() - new Date(b.reservedFrom).getTime());
  }

  async getToolReservations(toolId: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values())
      .filter(r => r.toolId === toolId && r.status === 'active')
      .sort((a, b) => new Date(a.reservedFrom).getTime() - new Date(b.reservedFrom).getTime());
  }

  async extendReservation(reservationId: string, newEndTime: string): Promise<{ success: boolean; message: string }> {
    const reservation = this.reservations.get(reservationId);
    
    if (!reservation) {
      return { success: false, message: 'Reserva não encontrada' };
    }

    // Check if extension is possible
    const conflicts = await this.checkConflicts(reservation.toolId, reservation.reservedUntil, newEndTime);
    
    if (conflicts.length > 0) {
      return { success: false, message: 'Não é possível estender - há conflitos' };
    }

    // Update reservation
    reservation.reservedUntil = newEndTime;
    reservation.updatedAt = new Date().toISOString();
    
    this.reservations.set(reservationId, reservation);
    await this.syncReservations();

    // Reschedule reminders
    this.scheduleReminders(reservation);

    return { success: true, message: 'Reserva estendida com sucesso' };
  }

  async cancelReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    const reservation = this.reservations.get(reservationId);
    
    if (!reservation) {
      return { success: false, message: 'Reserva não encontrada' };
    }

    reservation.status = 'cancelled';
    reservation.updatedAt = new Date().toISOString();
    
    this.reservations.set(reservationId, reservation);
    await this.syncReservations();

    // Clear reminders
    this.clearReminders(reservationId);

    await notificationService.show({
      title: '❌ Reserva Cancelada',
      body: `Reserva de ${reservation.toolName} foi cancelada`,
      tag: 'reservation-cancelled'
    });

    return { success: true, message: 'Reserva cancelada com sucesso' };
  }

  async completeReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
    const reservation = this.reservations.get(reservationId);
    
    if (!reservation) {
      return { success: false, message: 'Reserva não encontrada' };
    }

    reservation.status = 'completed';
    reservation.updatedAt = new Date().toISOString();
    
    this.reservations.set(reservationId, reservation);
    await this.syncReservations();

    this.clearReminders(reservationId);

    return { success: true, message: 'Reserva completada' };
  }

  private async checkConflicts(toolId: string, from: string, to: string): Promise<Reservation[]> {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();

    return Array.from(this.reservations.values()).filter(r => {
      if (r.toolId !== toolId || r.status !== 'active') return false;
      
      const reservationFrom = new Date(r.reservedFrom).getTime();
      const reservationTo = new Date(r.reservedUntil).getTime();
      
      // Check for overlap
      return (fromTime < reservationTo && toTime > reservationFrom);
    });
  }

  private async getToolName(toolId: string): Promise<string> {
    // In real implementation, would fetch from database
    // For demo, return mock name
    return `Ferramenta ${toolId}`;
  }

  private scheduleReminders(reservation: Reservation): void {
    this.clearReminders(reservation.id);

    const now = new Date().getTime();
    const endTime = new Date(reservation.reservedUntil).getTime();
    const timeUntilEnd = endTime - now;

    // Schedule reminder 30 minutes before end
    if (timeUntilEnd > 30 * 60 * 1000) {
      const reminderTime = timeUntilEnd - 30 * 60 * 1000;
      const timeout = setTimeout(() => {
        notificationService.showReservationReminder(
          reservation.toolName,
          new Date(reservation.reservedUntil).toLocaleString()
        );
      }, reminderTime);

      this.checkIntervals.set(`${reservation.id}_reminder`, timeout);
    }

    // Schedule expiration check
    if (timeUntilEnd > 0) {
      const timeout = setTimeout(() => {
        this.expireReservation(reservation.id);
      }, timeUntilEnd);

      this.checkIntervals.set(`${reservation.id}_expire`, timeout);
    }
  }

  private clearReminders(reservationId: string): void {
    const reminderKey = `${reservationId}_reminder`;
    const expireKey = `${reservationId}_expire`;

    if (this.checkIntervals.has(reminderKey)) {
      clearTimeout(this.checkIntervals.get(reminderKey));
      this.checkIntervals.delete(reminderKey);
    }

    if (this.checkIntervals.has(expireKey)) {
      clearTimeout(this.checkIntervals.get(expireKey));
      this.checkIntervals.delete(expireKey);
    }
  }

  private async expireReservation(reservationId: string): Promise<void> {
    const reservation = this.reservations.get(reservationId);
    
    if (!reservation) return;

    if (reservation.autoExtend) {
      // Auto-extend by 1 hour if enabled
      const newEnd = new Date(new Date(reservation.reservedUntil).getTime() + 60 * 60 * 1000);
      await this.extendReservation(reservationId, newEnd.toISOString());
      return;
    }

    // Mark as expired
    reservation.status = 'expired';
    reservation.updatedAt = new Date().toISOString();
    
    this.reservations.set(reservationId, reservation);
    await this.syncReservations();

    await notificationService.show({
      title: '⏰ Reserva Expirada',
      body: `Reserva de ${reservation.toolName} expirou`,
      tag: 'reservation-expired',
      requireInteraction: true
    });
  }

  private startMonitoring(): void {
    // Check for expired reservations every 5 minutes
    setInterval(() => {
      this.checkExpiredReservations();
    }, 5 * 60 * 1000);
  }

  private async checkExpiredReservations(): Promise<void> {
    const now = new Date().getTime();
    
    for (const reservation of this.reservations.values()) {
      if (reservation.status === 'active' && new Date(reservation.reservedUntil).getTime() < now) {
        await this.expireReservation(reservation.id);
      }
    }
  }

  private async syncReservations(): Promise<void> {
    // Cache reservations locally
    await cacheService.set('reservations', Array.from(this.reservations.values()));
    
    // In real implementation, would sync with Supabase
    // For demo mode, just add to queue
    await cacheService.addToQueue('update', 'reservations', Array.from(this.reservations.values()));
  }

  async getStats(): Promise<any> {
    const activeReservations = Array.from(this.reservations.values()).filter(r => r.status === 'active');
    const todayReservations = activeReservations.filter(r => {
      const today = new Date().toDateString();
      return new Date(r.reservedFrom).toDateString() === today;
    });

    return {
      total: this.reservations.size,
      active: activeReservations.length,
      today: todayReservations.length,
      expired: Array.from(this.reservations.values()).filter(r => r.status === 'expired').length
    };
  }
}

export const reservationService = new ReservationService();
