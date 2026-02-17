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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_requests: {
        Row: {
          asset_class: string | null
          brokerage: string
          created_at: string
          email: string
          full_name: string
          id: string
          interests: string[] | null
          message: string | null
          phone_number: string | null
          primary_market: string | null
          role: string | null
        }
        Insert: {
          asset_class?: string | null
          brokerage: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          interests?: string[] | null
          message?: string | null
          phone_number?: string | null
          primary_market?: string | null
          role?: string | null
        }
        Update: {
          asset_class?: string | null
          brokerage?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interests?: string[] | null
          message?: string | null
          phone_number?: string | null
          primary_market?: string | null
          role?: string | null
        }
        Relationships: []
      }
      email_signups: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      lovable_domains: {
        Row: {
          category: string | null
          created_at: string | null
          domain: string
          id: string
          prompt_hash: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          domain: string
          id?: string
          prompt_hash: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          domain?: string
          id?: string
          prompt_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "lovable_domains_prompt_hash_fkey"
            columns: ["prompt_hash"]
            isOneToOne: false
            referencedRelation: "lovable_prompts"
            referencedColumns: ["prompt_hash"]
          },
        ]
      }
      lovable_entities: {
        Row: {
          brokerage: string | null
          created_at: string | null
          entity_type: string | null
          id: string
          market: string | null
          matched_domain: string | null
          name: string
          normalized_brokerage: string | null
          prompt_hash: string
        }
        Insert: {
          brokerage?: string | null
          created_at?: string | null
          entity_type?: string | null
          id?: string
          market?: string | null
          matched_domain?: string | null
          name: string
          normalized_brokerage?: string | null
          prompt_hash: string
        }
        Update: {
          brokerage?: string | null
          created_at?: string | null
          entity_type?: string | null
          id?: string
          market?: string | null
          matched_domain?: string | null
          name?: string
          normalized_brokerage?: string | null
          prompt_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "lovable_entities_prompt_hash_fkey"
            columns: ["prompt_hash"]
            isOneToOne: false
            referencedRelation: "lovable_prompts"
            referencedColumns: ["prompt_hash"]
          },
        ]
      }
      lovable_prompts: {
        Row: {
          broker_role: string | null
          citation_count: number | null
          created_at: string | null
          geo_level: string | null
          market: string | null
          model: string | null
          primary_market: string | null
          prompt: string | null
          prompt_hash: string
          property_type: string | null
          submarket: string | null
        }
        Insert: {
          broker_role?: string | null
          citation_count?: number | null
          created_at?: string | null
          geo_level?: string | null
          market?: string | null
          model?: string | null
          primary_market?: string | null
          prompt?: string | null
          prompt_hash: string
          property_type?: string | null
          submarket?: string | null
        }
        Update: {
          broker_role?: string | null
          citation_count?: number | null
          created_at?: string | null
          geo_level?: string | null
          market?: string | null
          model?: string | null
          primary_market?: string | null
          prompt?: string | null
          prompt_hash?: string
          property_type?: string | null
          submarket?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visibility_records: {
        Row: {
          broker_role: string | null
          brokerage: string | null
          created_at: string
          entity_display: string | null
          entity_key: string
          entity_type: string | null
          evidence: string | null
          id: string
          market: string
          market_asset: string | null
          market_role: string | null
          name: string
          prompt: string
          property_type: string | null
        }
        Insert: {
          broker_role?: string | null
          brokerage?: string | null
          created_at?: string
          entity_display?: string | null
          entity_key: string
          entity_type?: string | null
          evidence?: string | null
          id?: string
          market: string
          market_asset?: string | null
          market_role?: string | null
          name: string
          prompt: string
          property_type?: string | null
        }
        Update: {
          broker_role?: string | null
          brokerage?: string | null
          created_at?: string
          entity_display?: string | null
          entity_key?: string
          entity_type?: string | null
          evidence?: string | null
          id?: string
          market?: string
          market_asset?: string | null
          market_role?: string | null
          name?: string
          prompt?: string
          property_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      brokerage_market_rankings: {
        Row: {
          brokerage: string | null
          market: string | null
          market_rank: number | null
          market_share_pct: number | null
          mentions: number | null
          percentile: number | null
        }
        Relationships: []
      }
      brokerage_mentions_segmented: {
        Row: {
          broker_role: string | null
          brokerage: string | null
          market: string | null
          mentions: number | null
          model: string | null
          property_type: string | null
          total_citations: number | null
        }
        Relationships: []
      }
      brokerage_mentions_total: {
        Row: {
          brokerage: string | null
          primary_markets_present: number | null
          submarkets_present: number | null
          total_mentions: number | null
          unique_prompts: number | null
        }
        Relationships: []
      }
      domain_attribution_by_brokerage: {
        Row: {
          brokerage: string | null
          domain: string | null
          domain_mentions: number | null
          domain_rank: number | null
          pct_of_brokerage: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_broker_team_breakdown: {
        Args: {
          market_filter?: string
          property_type_filter?: string
          target_brokerage: string
        }
        Returns: {
          broker_name: string
          global_rank: number
          mentions: number
          property_types: string[]
          total_brokers: number
        }[]
      }
      get_competitive_rankings: {
        Args: { market_filter?: string; target_brokerage: string }
        Returns: {
          brokerage: string
          is_target: boolean
          mentions: number
          rank: number
          vs_target_diff: number
        }[]
      }
      get_cre_dashboard_bootstrap: {
        Args: { market_filter?: string; target_brokerage?: string }
        Returns: Json
      }
      get_dashboard_summary: {
        Args: { target_brokerage: string; target_market?: string }
        Returns: Json
      }
      get_missed_market_opportunities: {
        Args: { target_brokerage: string }
        Returns: {
          market: string
          peer_count: number
          top_peers: string[]
          total_peer_mentions: number
        }[]
      }
      get_primary_markets_for_brokerage: {
        Args: { target_brokerage: string }
        Returns: {
          primary_market: string
        }[]
      }
      get_prompt_intelligence: {
        Args: {
          broker_name_filter?: string
          broker_role_filter?: string
          brokerage_filter?: string
          market_filter?: string
          model_filter?: string
          page_limit?: number
          page_offset?: number
          property_type_filter?: string
        }
        Returns: {
          broker_role: string
          citation_count: number
          market: string
          mentioned_entities: Json
          model: string
          prompt: string
          prompt_hash: string
          property_type: string
          source_domains: string[]
        }[]
      }
      get_property_type_breakdown:
        | {
            Args: { target_brokerage: string }
            Returns: {
              mentions: number
              property_type: string
              rank: number
            }[]
          }
        | {
            Args: { market_filter?: string; target_brokerage: string }
            Returns: {
              mentions: number
              property_type: string
              rank: number
              total_brokerages: number
            }[]
          }
      get_source_attribution_comparison: {
        Args: { target_brokerage: string }
        Returns: {
          category: string
          diff_pct: number
          domain: string
          peer_avg_pct: number
          peer_avg_rank: number
          target_pct: number
          target_rank: number
        }[]
      }
      get_source_attribution_vs_competitor: {
        Args: { competitor_brokerage: string; target_brokerage: string }
        Returns: {
          category: string
          competitor_pct: number
          domain: string
          target_pct: number
        }[]
      }
      get_underindex_segments: {
        Args: { target_brokerage: string }
        Returns: {
          broker_role: string
          gap_pct: number
          market_avg_share_pct: number
          opportunity_score: number
          property_type: string
          target_share_pct: number
        }[]
      }
      get_vieweo_all_brokerages: {
        Args: {
          broker_role_filter?: string
          market_filter?: string
          property_type_filter?: string
        }
        Returns: Json
      }
      get_vieweo_bootstrap: {
        Args: {
          broker_role_filter?: string
          entity_type_filter?: string
          market_filter?: string
          property_type_filter?: string
        }
        Returns: Json
      }
      get_vieweo_prompts: {
        Args: {
          broker_role_filter?: string
          entity_type_filter?: string
          market_filter?: string
          property_type_filter?: string
        }
        Returns: Json
      }
      get_vieweo_raw_data: {
        Args: {
          broker_role_filter?: string
          entity_type_filter?: string
          market_filter?: string
          page_limit?: number
          page_offset?: number
          property_type_filter?: string
          search_query?: string
        }
        Returns: Json
      }
      get_vieweo_top_brokers: {
        Args: {
          broker_role_filter?: string
          entity_type_filter?: string
          market_filter?: string
          property_type_filter?: string
          result_limit?: number
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
