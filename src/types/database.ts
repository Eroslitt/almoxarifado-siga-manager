export interface Database {
  public: {
    Tables: {
      tools: {
        Row: {
          id: string;
          name: string;
          category: string;
          status: 'available' | 'in-use' | 'maintenance' | 'inactive' | 'reserved';
          location: string;
          registration_date: string;
          last_maintenance: string | null;
          next_maintenance: string | null;
          current_user_id: string | null;
          qr_code: string;
          usage_hours: number;
          maintenance_interval_hours: number;
          purchase_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          status?: 'available' | 'in-use' | 'maintenance' | 'inactive' | 'reserved';
          location: string;
          registration_date?: string;
          last_maintenance?: string | null;
          next_maintenance?: string | null;
          current_user_id?: string | null;
          qr_code: string;
          usage_hours?: number;
          maintenance_interval_hours?: number;
          purchase_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          status?: 'available' | 'in-use' | 'maintenance' | 'inactive' | 'reserved';
          location?: string;
          registration_date?: string;
          last_maintenance?: string | null;
          next_maintenance?: string | null;
          current_user_id?: string | null;
          qr_code?: string;
          usage_hours?: number;
          maintenance_interval_hours?: number;
          purchase_price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tool_movements: {
        Row: {
          id: string;
          tool_id: string;
          user_id: string;
          action: 'checkout' | 'checkin';
          timestamp: string;
          condition_note: string | null;
          usage_duration_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          user_id: string;
          action: 'checkout' | 'checkin';
          timestamp?: string;
          condition_note?: string | null;
          usage_duration_minutes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          user_id?: string;
          action?: 'checkout' | 'checkin';
          timestamp?: string;
          condition_note?: string | null;
          usage_duration_minutes?: number | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          department: string;
          role: 'operator' | 'administrator';
          active: boolean;
          notification_preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          department: string;
          role?: 'operator' | 'administrator';
          active?: boolean;
          notification_preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          department?: string;
          role?: 'operator' | 'administrator';
          active?: boolean;
          notification_preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_certifications: {
        Row: {
          id: string;
          user_id: string;
          certification_type: 'NR-10' | 'NR-35' | 'Operador-Empilhadeira' | 'Soldador' | 'Eletricista' | 'Trabalho-Altura' | 'Espaco-Confinado';
          certification_number: string;
          issued_date: string;
          expiry_date: string;
          issuing_authority: string;
          status: 'active' | 'expired' | 'revoked' | 'pending';
          document_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          certification_type: 'NR-10' | 'NR-35' | 'Operador-Empilhadeira' | 'Soldador' | 'Eletricista' | 'Trabalho-Altura' | 'Espaco-Confinado';
          certification_number: string;
          issued_date: string;
          expiry_date: string;
          issuing_authority: string;
          status?: 'active' | 'expired' | 'revoked' | 'pending';
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          certification_type?: 'NR-10' | 'NR-35' | 'Operador-Empilhadeira' | 'Soldador' | 'Eletricista' | 'Trabalho-Altura' | 'Espaco-Confinado';
          certification_number?: string;
          issued_date?: string;
          expiry_date?: string;
          issuing_authority?: string;
          status?: 'active' | 'expired' | 'revoked' | 'pending';
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tool_safety_requirements: {
        Row: {
          id: string;
          tool_id: string;
          required_certification_type: 'NR-10' | 'NR-35' | 'Operador-Empilhadeira' | 'Soldador' | 'Eletricista' | 'Trabalho-Altura' | 'Espaco-Confinado';
          risk_level: 'low' | 'medium' | 'high' | 'critical';
          mandatory: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          required_certification_type: 'NR-10' | 'NR-35' | 'Operador-Empilhadeira' | 'Soldador' | 'Eletricista' | 'Trabalho-Altura' | 'Espaco-Confinado';
          risk_level?: 'low' | 'medium' | 'high' | 'critical';
          mandatory?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          required_certification_type?: 'NR-10' | 'NR-35' | 'Operador-Empilhadeira' | 'Soldador' | 'Eletricista' | 'Trabalho-Altura' | 'Espaco-Confinado';
          risk_level?: 'low' | 'medium' | 'high' | 'critical';
          mandatory?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      security_access_logs: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string;
          access_attempt: 'granted' | 'denied';
          denial_reason: string | null;
          required_certifications: string | null;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_id: string;
          access_attempt: 'granted' | 'denied';
          denial_reason?: string | null;
          required_certifications?: string | null;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_id?: string;
          access_attempt?: 'granted' | 'denied';
          denial_reason?: string | null;
          required_certifications?: string | null;
          timestamp?: string;
          created_at?: string;
        };
      };
      tool_reservations: {
        Row: {
          id: string;
          tool_id: string;
          user_id: string;
          reserved_from: string;
          reserved_until: string;
          status: 'active' | 'completed' | 'cancelled';
          priority: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          user_id: string;
          reserved_from: string;
          reserved_until: string;
          status?: 'active' | 'completed' | 'cancelled';
          priority?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          user_id?: string;
          reserved_from?: string;
          reserved_until?: string;
          status?: 'active' | 'completed' | 'cancelled';
          priority?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      maintenance_schedules: {
        Row: {
          id: string;
          tool_id: string;
          type: 'preventive' | 'corrective' | 'inspection';
          scheduled_date: string;
          completed_date: string | null;
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          technician_id: string | null;
          cost: number | null;
          notes: string | null;
          parts_used: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          type: 'preventive' | 'corrective' | 'inspection';
          scheduled_date: string;
          completed_date?: string | null;
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          technician_id?: string | null;
          cost?: number | null;
          notes?: string | null;
          parts_used?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          type?: 'preventive' | 'corrective' | 'inspection';
          scheduled_date?: string;
          completed_date?: string | null;
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
          technician_id?: string | null;
          cost?: number | null;
          notes?: string | null;
          parts_used?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          type: 'overdue_return' | 'maintenance_due' | 'tool_unavailable' | 'reservation_reminder';
          title: string;
          message: string;
          tool_id: string | null;
          user_id: string | null;
          status: 'active' | 'acknowledged' | 'resolved';
          priority: 'low' | 'medium' | 'high' | 'critical';
          created_at: string;
          acknowledged_at: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          type: 'overdue_return' | 'maintenance_due' | 'tool_unavailable' | 'reservation_reminder';
          title: string;
          message: string;
          tool_id?: string | null;
          user_id?: string | null;
          status?: 'active' | 'acknowledged' | 'resolved';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          type?: 'overdue_return' | 'maintenance_due' | 'tool_unavailable' | 'reservation_reminder';
          title?: string;
          message?: string;
          tool_id?: string | null;
          user_id?: string | null;
          status?: 'active' | 'acknowledged' | 'resolved';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          created_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
        };
      };
    };
  };
}

export type Tool = Database['public']['Tables']['tools']['Row'];
export type ToolMovement = Database['public']['Tables']['tool_movements']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type ToolReservation = Database['public']['Tables']['tool_reservations']['Row'];
export type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedules']['Row'];
export type Alert = Database['public']['Tables']['alerts']['Row'];
export type UserCertification = Database['public']['Tables']['user_certifications']['Row'];
export type ToolSafetyRequirement = Database['public']['Tables']['tool_safety_requirements']['Row'];
export type SecurityAccessLog = Database['public']['Tables']['security_access_logs']['Row'];
