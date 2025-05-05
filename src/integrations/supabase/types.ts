export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      pinterest_accounts: {
        Row: {
          ad_account_id: string | null
          api_key: string
          app_id: string
          app_secret: string | null
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          ad_account_id?: string | null
          api_key: string
          app_id: string
          app_secret?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          ad_account_id?: string | null
          api_key?: string
          app_id?: string
          app_secret?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      pinterest_analytics: {
        Row: {
          account_id: string | null
          created_at: string
          date: string
          engaged_audience: number
          engagement_rate: number
          engagements: number
          id: string
          impressions: number
          outbound_click_rate: number
          outbound_clicks: number
          pin_click_rate: number
          pin_clicks: number
          save_rate: number
          saves: number
          total_audience: number
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          date: string
          engaged_audience?: number
          engagement_rate?: number
          engagements?: number
          id?: string
          impressions?: number
          outbound_click_rate?: number
          outbound_clicks?: number
          pin_click_rate?: number
          pin_clicks?: number
          save_rate?: number
          saves?: number
          total_audience?: number
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          date?: string
          engaged_audience?: number
          engagement_rate?: number
          engagements?: number
          id?: string
          impressions?: number
          outbound_click_rate?: number
          outbound_clicks?: number
          pin_click_rate?: number
          pin_clicks?: number
          save_rate?: number
          saves?: number
          total_audience?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinterest_analytics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "pinterest_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pinterest_audience: {
        Row: {
          account_id: string | null
          age_groups: Json
          categories: Json
          created_at: string
          date: string
          devices: Json
          genders: Json
          id: string
          locations: Json
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          age_groups?: Json
          categories?: Json
          created_at?: string
          date: string
          devices?: Json
          genders?: Json
          id?: string
          locations?: Json
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          age_groups?: Json
          categories?: Json
          created_at?: string
          date?: string
          devices?: Json
          genders?: Json
          id?: string
          locations?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinterest_audience_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "pinterest_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
