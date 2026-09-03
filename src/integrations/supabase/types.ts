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
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          mode: string
          target_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          mode?: string
          target_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          mode?: string
          target_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      article_translations: {
        Row: {
          article_id: string
          content: string
          created_at: string
          description: string
          id: string
          language: string
          title: string
          updated_at: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          description: string
          id?: string
          language?: string
          title: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          description?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          created_at: string
          id: string
          viewer_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          viewer_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          category_id: string | null
          content?: string | null
          content_en: string | null
          content_uk: string | null
          created_at: string
          description?: string | null
          description_en: string | null
          description_uk: string | null
          id: string
          image_url: string
          impressions: number
          likes: number
          original_source_url: string | null
          published: boolean
          reads: number
          share_count: number
          show_test_button?: boolean | null
          showTestButton?: boolean | null
          tags: string[]
          title?: string | null
          title_en: string | null
          title_uk: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          content_en?: string | null
          content_uk?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          image_url?: string
          impressions?: number
          likes?: number
          original_source_url?: string | null
          published?: boolean
          reads?: number
          share_count?: number
          show_test_button?: boolean | null
          showTestButton?: boolean | null
          tags?: string[]
          title?: string | null
          title_en?: string | null
          title_uk?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content?: string | null
          content_en?: string | null
          content_uk?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_uk?: string | null
          id?: string
          image_url?: string
          impressions?: number
          likes?: number
          original_source_url?: string | null
          published?: boolean
          reads?: number
          share_count?: number
          show_test_button?: boolean | null
          showTestButton?: boolean | null
          tags?: string[]
          title?: string | null
          title_en?: string | null
          title_uk?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string
          mode?: string | null
          mode_slug: string | null
          name: string
          name_en?: string | null
          slug?: string | null
          sort_order?: number | null
          sub_topics: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string
          mode?: string | null
          mode_slug?: string | null
          name: string
          name_en?: string | null
          slug?: string | null
          sort_order?: number | null
          sub_topics?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          mode?: string | null
          mode_slug?: string | null
          name?: string
          name_en?: string | null
          slug?: string | null
          sort_order?: number | null
          sub_topics?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      category_translations: {
        Row: {
          category_id: string
          created_at: string
          id: string
          language: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          language?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          language?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          platform: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          mode: string
          mode_slug: string | null
          name: string
          name_en: string | null
          slug: string | null
          sort_order: number
          title: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          mode?: string
          mode_slug?: string | null
          name: string
          name_en?: string | null
          slug?: string | null
          sort_order?: number
          title?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          mode?: string
          mode_slug?: string | null
          name?: string
          name_en?: string | null
          slug?: string | null
          sort_order?: number
          title?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_article_likes: {
        Row: {
          article_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_liked_article: {
        Args: { p_article_id: string }
        Returns: boolean
      }
      get_24h_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          likes_24h: number
          shares_24h: number
          views_24h: number
        }[]
      }
      get_article_unique_views: {
        Args: { p_article_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_impressions: {
        Args: { p_article_ids: string[] }
        Returns: undefined
      }
      increment_article_reads: {
        Args: { p_article_id: string }
        Returns: undefined
      }
      increment_article_shares: {
        Args: { p_article_id: string }
        Returns: undefined
      }
      increment_mode_entry_shares: {
        Args: { p_entry_id: string }
        Returns: undefined
      }
      log_analytics_event: {
        Args: {
          p_event_type: string
          p_metadata?: Json | null
          p_mode: string
          p_target_id: string
          p_viewer_id?: string | null
        }
        Returns: string
      }
      toggle_article_like: { Args: { p_article_id: string }; Returns: boolean }
      toggle_article_like_anonymous: {
        Args: { p_article_id: string; p_is_liking: boolean }
        Returns: undefined
      }
      toggle_mode_entry_like: {
        Args: { p_entry_id: string; p_is_liking: boolean }
        Returns: undefined
      }
      track_article_view: {
        Args: { p_article_id: string; p_viewer_id: string }
        Returns: undefined
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
