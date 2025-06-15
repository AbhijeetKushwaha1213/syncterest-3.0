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
      blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      channel_last_read: {
        Row: {
          channel_id: string
          id: number
          last_read_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: number
          last_read_at: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: number
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_last_read_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          created_at: string
          role: Database["public"]["Enums"]["channel_role"]
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          role?: Database["public"]["Enums"]["channel_role"]
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          role?: Database["public"]["Enums"]["channel_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "channel_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          channel_id: string
          content: string | null
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          channel_id: string
          content?: string | null
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          channel_id?: string
          content?: string | null
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          color: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          genre: Database["public"]["Enums"]["channel_genre"]
          id: string
          image_url: string | null
          logo_letter: string | null
          name: string
          type: Database["public"]["Enums"]["channel_type"]
          visibility: Database["public"]["Enums"]["channel_visibility"]
        }
        Insert: {
          color?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          genre?: Database["public"]["Enums"]["channel_genre"]
          id?: string
          image_url?: string | null
          logo_letter?: string | null
          name: string
          type?: Database["public"]["Enums"]["channel_type"]
          visibility?: Database["public"]["Enums"]["channel_visibility"]
        }
        Update: {
          color?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          genre?: Database["public"]["Enums"]["channel_genre"]
          id?: string
          image_url?: string | null
          logo_letter?: string | null
          name?: string
          type?: Database["public"]["Enums"]["channel_type"]
          visibility?: Database["public"]["Enums"]["channel_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "channels_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_time: string
          id: string
          image_url: string | null
          location: string | null
          search_vector: unknown | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_time: string
          id?: string
          image_url?: string | null
          location?: string | null
          search_vector?: unknown | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_time?: string
          id?: string
          image_url?: string | null
          location?: string | null
          search_vector?: unknown | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          search_vector: unknown | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          search_vector?: unknown | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          search_vector?: unknown | null
        }
        Relationships: []
      }
      intent_options: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      live_activities: {
        Row: {
          activity_type: string
          created_at: string
          custom_message: string | null
          expires_at: string
          id: string
          latitude: number | null
          longitude: number | null
          search_vector: unknown | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          custom_message?: string | null
          expires_at: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          search_vector?: unknown | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          custom_message?: string | null
          expires_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          search_vector?: unknown | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      personality_tags_options: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          cultural_preferences: Json | null
          email_notifications_enabled: boolean
          event_reminder_notifications: boolean
          full_name: string | null
          group_activity_notifications: boolean
          id: string
          intent: string | null
          interests: string[] | null
          language: string
          last_active_at: string | null
          latitude: number | null
          location_city: string | null
          location_postal_code: string | null
          longitude: number | null
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[] | null
          push_notifications_enabled: boolean
          search_vector: unknown | null
          status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          cultural_preferences?: Json | null
          email_notifications_enabled?: boolean
          event_reminder_notifications?: boolean
          full_name?: string | null
          group_activity_notifications?: boolean
          id: string
          intent?: string | null
          interests?: string[] | null
          language?: string
          last_active_at?: string | null
          latitude?: number | null
          location_city?: string | null
          location_postal_code?: string | null
          longitude?: number | null
          new_follower_notifications?: boolean
          new_message_notifications?: boolean
          personality_tags?: string[] | null
          push_notifications_enabled?: boolean
          search_vector?: unknown | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          cultural_preferences?: Json | null
          email_notifications_enabled?: boolean
          event_reminder_notifications?: boolean
          full_name?: string | null
          group_activity_notifications?: boolean
          id?: string
          intent?: string | null
          interests?: string[] | null
          language?: string
          last_active_at?: string | null
          latitude?: number | null
          location_city?: string | null
          location_postal_code?: string | null
          longitude?: number | null
          new_follower_notifications?: boolean
          new_message_notifications?: boolean
          personality_tags?: string[] | null
          push_notifications_enabled?: boolean
          search_vector?: unknown | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_intent"
            columns: ["intent"]
            isOneToOne: false
            referencedRelation: "intent_options"
            referencedColumns: ["name"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      reels: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          user_id: string
          video_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          user_id: string
          video_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "reels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advanced_search_users: {
        Args: {
          p_search_term: string
          p_intent: string
          p_personality_tags: string[]
          p_latitude: number
          p_longitude: number
          p_radius_km: number
          p_sort_by: string
        }
        Returns: {
          id: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string
          bio: string
          interests: string[]
          status: string
          last_active_at: string
          latitude: number
          longitude: number
          search_vector: unknown
          email_notifications_enabled: boolean
          push_notifications_enabled: boolean
          new_message_notifications: boolean
          new_follower_notifications: boolean
          group_activity_notifications: boolean
          event_reminder_notifications: boolean
          language: string
          intent: string
          personality_tags: string[]
          cultural_preferences: Json
          location_city: string
          location_postal_code: string
          created_at: string
          profile_visibility: string
          location_sharing_enabled: boolean
          show_location_on_profile: boolean
          show_activity_status: boolean
          compatibility_score: number
        }[]
      }
      find_or_create_conversation: {
        Args: { p_other_user_id: string }
        Returns: string
      }
      get_conversations_for_user: {
        Args: { p_user_id: string }
        Returns: Database["public"]["CompositeTypes"]["conversation_details"][]
      }
      get_joined_channels_with_unread: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          created_at: string
          name: string
          description: string
          genre: Database["public"]["Enums"]["channel_genre"]
          visibility: Database["public"]["Enums"]["channel_visibility"]
          creator_id: string
          image_url: string
          color: string
          logo_letter: string
          type: Database["public"]["Enums"]["channel_type"]
          unread_count: number
        }[]
      }
      get_matches: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_my_conversation_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_nearby_users: {
        Args: { p_latitude: number; p_longitude: number; p_radius_km: number }
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          cultural_preferences: Json | null
          email_notifications_enabled: boolean
          event_reminder_notifications: boolean
          full_name: string | null
          group_activity_notifications: boolean
          id: string
          intent: string | null
          interests: string[] | null
          language: string
          last_active_at: string | null
          latitude: number | null
          location_city: string | null
          location_postal_code: string | null
          longitude: number | null
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[] | null
          push_notifications_enabled: boolean
          search_vector: unknown | null
          status: string | null
          updated_at: string | null
          username: string | null
        }[]
      }
      get_trending_profiles: {
        Args: { limit_count: number }
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          cultural_preferences: Json | null
          email_notifications_enabled: boolean
          event_reminder_notifications: boolean
          full_name: string | null
          group_activity_notifications: boolean
          id: string
          intent: string | null
          interests: string[] | null
          language: string
          last_active_at: string | null
          latitude: number | null
          location_city: string | null
          location_postal_code: string | null
          longitude: number | null
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[] | null
          push_notifications_enabled: boolean
          search_vector: unknown | null
          status: string | null
          updated_at: string | null
          username: string | null
        }[]
      }
      global_search: {
        Args: { search_term: string }
        Returns: Database["public"]["CompositeTypes"]["global_search_result"][]
      }
      is_channel_admin: {
        Args: { p_channel_id: string; p_user_id: string }
        Returns: boolean
      }
      is_channel_member: {
        Args: { p_channel_id: string; p_user_id: string }
        Returns: boolean
      }
      mark_channel_as_read: {
        Args: { p_channel_id: string }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
    }
    Enums: {
      channel_genre: "general" | "music" | "reading" | "gaming" | "tech"
      channel_role: "admin" | "moderator" | "member"
      channel_type: "text" | "voice"
      channel_visibility: "public" | "private"
    }
    CompositeTypes: {
      conversation_details: {
        id: string | null
        created_at: string | null
        updated_at: string | null
        other_participant: Json | null
        last_message: Json | null
        unread_count: number | null
      }
      global_search_result: {
        id: string | null
        type: string | null
        title: string | null
        description: string | null
        image_url: string | null
        url_path: string | null
        rank: number | null
      }
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
    Enums: {
      channel_genre: ["general", "music", "reading", "gaming", "tech"],
      channel_role: ["admin", "moderator", "member"],
      channel_type: ["text", "voice"],
      channel_visibility: ["public", "private"],
    },
  },
} as const
