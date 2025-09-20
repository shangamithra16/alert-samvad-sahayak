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
      alerts: {
        Row: {
          community_id: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          resolved_at: string | null
          sensor_data_id: string | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          resolved_at?: string | null
          sensor_data_id?: string | null
          severity: string
          title: string
          type: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          resolved_at?: string | null
          sensor_data_id?: string | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_sensor_data_id_fkey"
            columns: ["sensor_data_id"]
            isOneToOne: false
            referencedRelation: "sensor_data"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          head_id: string
          id: string
          location: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          head_id: string
          id?: string
          location?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          head_id?: string
          id?: string
          location?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_api_keys: {
        Row: {
          api_key: string
          community_id: string
          created_at: string
          created_by: string | null
          device_name: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
        }
        Insert: {
          api_key: string
          community_id: string
          created_at?: string
          created_by?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
        }
        Update: {
          api_key?: string
          community_id?: string
          created_at?: string
          created_by?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          community_id: string | null
          created_at: string
          display_name: string | null
          id: string
          language: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string
          phone?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_data: {
        Row: {
          CO2: number | null
          community_id: string
          created_at: string
          Hum: number | null
          id: string
          NH3: number | null
          O3: number | null
          pH: number | null
          rain: number | null
          sequence: number
          soil: number | null
          Temp: number | null
          TiltX: number | null
          TiltY: number | null
          timestamp: string
          turbidity: number | null
        }
        Insert: {
          CO2?: number | null
          community_id: string
          created_at?: string
          Hum?: number | null
          id?: string
          NH3?: number | null
          O3?: number | null
          pH?: number | null
          rain?: number | null
          sequence: number
          soil?: number | null
          Temp?: number | null
          TiltX?: number | null
          TiltY?: number | null
          timestamp?: string
          turbidity?: number | null
        }
        Update: {
          CO2?: number | null
          community_id?: string
          created_at?: string
          Hum?: number | null
          id?: string
          NH3?: number | null
          O3?: number | null
          pH?: number | null
          rain?: number | null
          sequence?: number
          soil?: number | null
          Temp?: number | null
          TiltX?: number | null
          TiltY?: number | null
          timestamp?: string
          turbidity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_data_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_community_id: {
        Args: { _user_id: string }
        Returns: string
      }
      validate_device_api_key: {
        Args: { _api_key: string }
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
