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
      categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
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
      material_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachments: string[] | null
          created_at: string
          delivered_at: string | null
          delivered_by: string | null
          department: string | null
          id: string
          items: Json
          notes: string | null
          priority: string
          project_code: string | null
          request_number: string
          requested_at: string
          requester_name: string
          status: string
          total_estimated_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: string[] | null
          created_at?: string
          delivered_at?: string | null
          delivered_by?: string | null
          department?: string | null
          id?: string
          items?: Json
          notes?: string | null
          priority?: string
          project_code?: string | null
          request_number: string
          requested_at?: string
          requester_name: string
          status?: string
          total_estimated_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: string[] | null
          created_at?: string
          delivered_at?: string | null
          delivered_by?: string | null
          department?: string | null
          id?: string
          items?: Json
          notes?: string | null
          priority?: string
          project_code?: string | null
          request_number?: string
          requested_at?: string
          requester_name?: string
          status?: string
          total_estimated_value?: number | null
          updated_at?: string
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
      patrimonios: {
        Row: {
          categoria: string
          codigo_patrimonio: string
          created_at: string
          data_aquisicao: string | null
          descricao: string | null
          estado_conservacao: string
          etiqueta_data: Json | null
          fornecedor: string | null
          foto_url: string | null
          id: string
          localizacao: string | null
          marca: string | null
          modelo: string | null
          nome: string
          numero_serie: string | null
          observacoes: string | null
          responsavel: string | null
          status: string
          updated_at: string
          user_id: string
          valor_aquisicao: number | null
        }
        Insert: {
          categoria: string
          codigo_patrimonio: string
          created_at?: string
          data_aquisicao?: string | null
          descricao?: string | null
          estado_conservacao?: string
          etiqueta_data?: Json | null
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nome: string
          numero_serie?: string | null
          observacoes?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
          user_id: string
          valor_aquisicao?: number | null
        }
        Update: {
          categoria?: string
          codigo_patrimonio?: string
          created_at?: string
          data_aquisicao?: string | null
          descricao?: string | null
          estado_conservacao?: string
          etiqueta_data?: Json | null
          fornecedor?: string | null
          foto_url?: string | null
          id?: string
          localizacao?: string | null
          marca?: string | null
          modelo?: string | null
          nome?: string
          numero_serie?: string | null
          observacoes?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          valor_aquisicao?: number | null
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
      skus: {
        Row: {
          alternative_suppliers: string[] | null
          category: string
          category_id: string | null
          classification: string | null
          created_at: string
          current_stock: number
          default_supplier_id: string | null
          description: string | null
          id: string
          last_movement_date: string | null
          location: string | null
          max_stock: number
          min_stock: number
          name: string
          sku_code: string
          status: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alternative_suppliers?: string[] | null
          category: string
          category_id?: string | null
          classification?: string | null
          created_at?: string
          current_stock?: number
          default_supplier_id?: string | null
          description?: string | null
          id?: string
          last_movement_date?: string | null
          location?: string | null
          max_stock?: number
          min_stock?: number
          name: string
          sku_code: string
          status?: string | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alternative_suppliers?: string[] | null
          category?: string
          category_id?: string | null
          classification?: string | null
          created_at?: string
          current_stock?: number
          default_supplier_id?: string | null
          description?: string | null
          id?: string
          last_movement_date?: string | null
          location?: string | null
          max_stock?: number
          min_stock?: number
          name?: string
          sku_code?: string
          status?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skus_default_supplier_id_fkey"
            columns: ["default_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          available_quantity: number | null
          current_quantity: number
          id: string
          last_count_date: string | null
          last_movement_date: string | null
          location_id: string
          reserved_quantity: number
          sku_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          available_quantity?: number | null
          current_quantity?: number
          id?: string
          last_count_date?: string | null
          last_movement_date?: string | null
          location_id: string
          reserved_quantity?: number
          sku_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          available_quantity?: number | null
          current_quantity?: number
          id?: string
          last_count_date?: string | null
          last_movement_date?: string | null
          location_id?: string
          reserved_quantity?: number
          sku_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          quantity: number
          reference_document: string | null
          sku_id: string
          unit_cost: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          quantity: number
          reference_document?: string | null
          sku_id: string
          unit_cost?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_document?: string | null
          sku_id?: string
          unit_cost?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_locations: {
        Row: {
          capacity: number | null
          code: string
          created_at: string
          description: string | null
          id: string
          level: string
          position: string
          restrictions: string[] | null
          shelf: string
          status: string
          street: string
          updated_at: string
          user_id: string
          zone_type: string
        }
        Insert: {
          capacity?: number | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          level: string
          position: string
          restrictions?: string[] | null
          shelf: string
          status?: string
          street: string
          updated_at?: string
          user_id: string
          zone_type?: string
        }
        Update: {
          capacity?: number | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          position?: string
          restrictions?: string[] | null
          shelf?: string
          status?: string
          street?: string
          updated_at?: string
          user_id?: string
          zone_type?: string
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
      suppliers: {
        Row: {
          address: Json
          cnpj: string
          company_name: string
          contact_info: Json
          created_at: string
          id: string
          ie: string | null
          lead_time_days: number | null
          payment_terms: string | null
          rating: number | null
          status: string
          trade_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json
          cnpj: string
          company_name: string
          contact_info?: Json
          created_at?: string
          id?: string
          ie?: string | null
          lead_time_days?: number | null
          payment_terms?: string | null
          rating?: number | null
          status?: string
          trade_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json
          cnpj?: string
          company_name?: string
          contact_info?: Json
          created_at?: string
          id?: string
          ie?: string | null
          lead_time_days?: number | null
          payment_terms?: string | null
          rating?: number | null
          status?: string
          trade_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_movements: {
        Row: {
          actual_return_date: string | null
          assigned_to_user_id: string | null
          condition_after: string | null
          condition_before: string | null
          created_at: string
          expected_return_date: string | null
          from_location_id: string | null
          id: string
          movement_type: string
          notes: string | null
          performed_by_user_id: string
          signature_data: string | null
          timestamp: string
          to_location_id: string | null
          tool_id: string
          user_id: string
        }
        Insert: {
          actual_return_date?: string | null
          assigned_to_user_id?: string | null
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string
          expected_return_date?: string | null
          from_location_id?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          performed_by_user_id: string
          signature_data?: string | null
          timestamp?: string
          to_location_id?: string | null
          tool_id: string
          user_id: string
        }
        Update: {
          actual_return_date?: string | null
          assigned_to_user_id?: string | null
          condition_after?: string | null
          condition_before?: string | null
          created_at?: string
          expected_return_date?: string | null
          from_location_id?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          performed_by_user_id?: string
          signature_data?: string | null
          timestamp?: string
          to_location_id?: string | null
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_movements_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_movements_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_movements_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          current_user_id: string | null
          description: string | null
          id: string
          last_maintenance: string | null
          location_id: string | null
          maintenance_interval_days: number | null
          model: string | null
          name: string
          next_maintenance: string | null
          photo_url: string | null
          purchase_date: string | null
          purchase_value: number | null
          qr_code: string | null
          serial_number: string | null
          specifications: Json | null
          status: string
          supplier_id: string | null
          updated_at: string
          user_id: string
          warranty_expiry: string | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          current_user_id?: string | null
          description?: string | null
          id?: string
          last_maintenance?: string | null
          location_id?: string | null
          maintenance_interval_days?: number | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          qr_code?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          user_id: string
          warranty_expiry?: string | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          current_user_id?: string | null
          description?: string | null
          id?: string
          last_maintenance?: string | null
          location_id?: string | null
          maintenance_interval_days?: number | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          qr_code?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_patrimonio_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_request_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
