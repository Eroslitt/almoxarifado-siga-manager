
export interface Database {
  public: {
    Tables: {
      tools: {
        Row: {
          id: string;
          name: string;
          category: string;
          status: 'available' | 'in-use' | 'maintenance' | 'inactive';
          location: string;
          registration_date: string;
          last_maintenance: string | null;
          current_user_id: string | null;
          qr_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          status?: 'available' | 'in-use' | 'maintenance' | 'inactive';
          location: string;
          registration_date?: string;
          last_maintenance?: string | null;
          current_user_id?: string | null;
          qr_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          status?: 'available' | 'in-use' | 'maintenance' | 'inactive';
          location?: string;
          registration_date?: string;
          last_maintenance?: string | null;
          current_user_id?: string | null;
          qr_code?: string;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          user_id: string;
          action: 'checkout' | 'checkin';
          timestamp?: string;
          condition_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          user_id?: string;
          action?: 'checkout' | 'checkin';
          timestamp?: string;
          condition_note?: string | null;
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
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tool = Database['public']['Tables']['tools']['Row'];
export type ToolMovement = Database['public']['Tables']['tool_movements']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
