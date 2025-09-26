export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      epi_assignments: {
        Row: {
          assigned_at: string | null
          employee_document: string | null
          employee_name: string
          epi_id: string
          id: string
          notes: string | null
          returned_at: string | null
          signature_data: string | null
          status: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          employee_document?: string | null
          employee_name: string
          epi_id: string
          id?: string
          notes?: string | null
          returned_at?: string | null
          signature_data?: string | null
          status?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          employee_document?: string | null
          employee_name?: string
          epi_id?: string
          id?: string
          notes?: string | null
          returned_at?: string | null
          signature_data?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epi_assignments_epi_id_fkey"
            columns: ["epi_id"]
            isOneToOne: false
            referencedRelation: "epis"
            referencedColumns: ["id"]
          },
        ]
      }
      epis: {
        Row: {
          brand: string | null
          certificate_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          location: string | null
          model: string | null
          name: string
          serial_number: string | null
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          certificate_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          model?: string | null
          name: string
          serial_number?: string | null
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          certificate_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          location?: string | null
          model?: string | null
          name?: string
          serial_number?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      material_verifications: {
        Row: {
          batch_number: string | null
          created_at: string | null
          delivery_date: string | null
          id: string
          inspector_name: string | null
          inspector_signature: string | null
          material_name: string
          notes: string | null
          photos: string[] | null
          quality_check: Json | null
          quantity: number | null
          supplier: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
          verification_status: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          inspector_name?: string | null
          inspector_signature?: string | null
          material_name: string
          notes?: string | null
          photos?: string[] | null
          quality_check?: Json | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          delivery_date?: string | null
          id?: string
          inspector_name?: string | null
          inspector_signature?: string | null
          material_name?: string
          notes?: string | null
          photos?: string[] | null
          quality_check?: Json | null
          quantity?: number | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string | null
          external_payment_id: string | null
          id: string
          payment_method: string | null
          plan_name: string
          start_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          end_date?: string | null
          external_payment_id?: string | null
          id?: string
          payment_method?: string | null
          plan_name?: string
          start_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string | null
          external_payment_id?: string | null
          id?: string
          payment_method?: string | null
          plan_name?: string
          start_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
