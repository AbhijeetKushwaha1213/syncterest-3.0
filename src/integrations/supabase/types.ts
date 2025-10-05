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
    PostgrestVersion: "13.0.4"
  }
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
      comments: {
        Row: {
          content: string
          created_at: string
          event_id: string | null
          id: string
          post_id: string | null
          reel_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id?: string | null
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string | null
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
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
          latitude: number | null
          location: string | null
          longitude: number | null
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
          latitude?: number | null
          location?: string | null
          longitude?: number | null
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
          latitude?: number | null
          location?: string | null
          longitude?: number | null
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
      location_access_audit: {
        Row: {
          access_type: string
          accessor_id: string
          activity_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          target_user_id: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessor_id: string
          activity_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          target_user_id: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessor_id?: string
          activity_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          target_user_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      location_sharing_permissions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          grantee_id: string
          grantor_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          grantee_id: string
          grantor_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          grantee_id?: string
          grantor_id?: string
          id?: string
        }
        Relationships: []
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
      personality_responses: {
        Row: {
          conversation_style: string | null
          created_at: string
          day_planning: string | null
          ethnicity: string | null
          gender: string | null
          group_behavior: string | null
          height: string | null
          id: string
          new_experiences: string | null
          social_energy: string | null
          sports_excitement: string | null
          trip_handling: string | null
          updated_at: string
          user_id: string
          values_in_partner: string | null
          weekend_recharge: string | null
        }
        Insert: {
          conversation_style?: string | null
          created_at?: string
          day_planning?: string | null
          ethnicity?: string | null
          gender?: string | null
          group_behavior?: string | null
          height?: string | null
          id?: string
          new_experiences?: string | null
          social_energy?: string | null
          sports_excitement?: string | null
          trip_handling?: string | null
          updated_at?: string
          user_id: string
          values_in_partner?: string | null
          weekend_recharge?: string | null
        }
        Update: {
          conversation_style?: string | null
          created_at?: string
          day_planning?: string | null
          ethnicity?: string | null
          gender?: string | null
          group_behavior?: string | null
          height?: string | null
          id?: string
          new_experiences?: string | null
          social_energy?: string | null
          sports_excitement?: string | null
          trip_handling?: string | null
          updated_at?: string
          user_id?: string
          values_in_partner?: string | null
          weekend_recharge?: string | null
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
          location_sharing_enabled: boolean
          longitude: number | null
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[] | null
          profile_visibility: string
          push_notifications_enabled: boolean
          search_vector: unknown | null
          show_activity_status: boolean
          show_location_on_profile: boolean
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
          location_sharing_enabled?: boolean
          longitude?: number | null
          new_follower_notifications?: boolean
          new_message_notifications?: boolean
          personality_tags?: string[] | null
          profile_visibility?: string
          push_notifications_enabled?: boolean
          search_vector?: unknown | null
          show_activity_status?: boolean
          show_location_on_profile?: boolean
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
          location_sharing_enabled?: boolean
          longitude?: number | null
          new_follower_notifications?: boolean
          new_message_notifications?: boolean
          personality_tags?: string[] | null
          profile_visibility?: string
          push_notifications_enabled?: boolean
          search_vector?: unknown | null
          show_activity_status?: boolean
          show_location_on_profile?: boolean
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
      groups: {
        Row: {
          id: string
          name: string
          description: string
          interest_tags: string[]
          location_name: string
          latitude: number
          longitude: number
          meeting_time: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          interest_tags?: string[]
          location_name: string
          latitude: number
          longitude: number
          meeting_time: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          interest_tags?: string[]
          location_name?: string
          latitude?: number
          longitude?: number
          meeting_time?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
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
          p_intent: string
          p_latitude: number
          p_longitude: number
          p_personality_tags: string[]
          p_radius_km: number
          p_search_term: string
          p_sort_by: string
        }
        Returns: {
          avatar_url: string
          bio: string
          compatibility_score: number
          created_at: string
          cultural_preferences: Json
          email_notifications_enabled: boolean
          event_reminder_notifications: boolean
          full_name: string
          group_activity_notifications: boolean
          id: string
          intent: string
          interests: string[]
          language: string
          last_active_at: string
          latitude: number
          location_city: string
          location_postal_code: string
          location_sharing_enabled: boolean
          longitude: number
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[]
          profile_visibility: string
          push_notifications_enabled: boolean
          search_vector: unknown
          show_activity_status: boolean
          show_location_on_profile: boolean
          status: string
          updated_at: string
          username: string
        }[]
      }
      are_users_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      audit_location_access: {
        Args: {
          p_access_type?: string
          p_activity_id?: string
          p_target_user_id: string
        }
        Returns: undefined
      }
      calculate_compatibility_score: {
        Args: { user1_id: string; user2_id: string }
        Returns: number
      }
      enhanced_search_users: {
        Args: {
          p_intent: string
          p_latitude: number
          p_longitude: number
          p_personality_tags: string[]
          p_radius_km: number
          p_search_term: string
          p_sort_by: string
        }
        Returns: {
          avatar_url: string
          bio: string
          compatibility_score: number
          created_at: string
          cultural_preferences: Json
          distance_km: number
          email_notifications_enabled: boolean
          event_reminder_notifications: boolean
          full_name: string
          group_activity_notifications: boolean
          id: string
          intent: string
          interests: string[]
          language: string
          last_active_at: string
          latitude: number
          location_city: string
          location_postal_code: string
          location_sharing_enabled: boolean
          longitude: number
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[]
          profile_visibility: string
          push_notifications_enabled: boolean
          search_rank: number
          search_vector: unknown
          show_activity_status: boolean
          show_location_on_profile: boolean
          status: string
          updated_at: string
          username: string
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
          color: string
          created_at: string
          creator_id: string
          description: string
          genre: Database["public"]["Enums"]["channel_genre"]
          id: string
          image_url: string
          logo_letter: string
          name: string
          type: Database["public"]["Enums"]["channel_type"]
          unread_count: number
          visibility: Database["public"]["Enums"]["channel_visibility"]
        }[]
      }
      get_matches: {
        Args: Record<PropertyKey, never>
        Returns: {
          compatibility_score: number
          profile_id: string
        }[]
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
          location_sharing_enabled: boolean
          longitude: number | null
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[] | null
          profile_visibility: string
          push_notifications_enabled: boolean
          search_vector: unknown | null
          show_activity_status: boolean
          show_location_on_profile: boolean
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
          location_sharing_enabled: boolean
          longitude: number | null
          new_follower_notifications: boolean
          new_message_notifications: boolean
          personality_tags: string[] | null
          profile_visibility: string
          push_notifications_enabled: boolean
          search_vector: unknown | null
          show_activity_status: boolean
          show_location_on_profile: boolean
          status: string | null
          updated_at: string | null
          username: string | null
        }[]
      }
      global_search: {
        Args: { search_term: string }
        Returns: Database["public"]["CompositeTypes"]["global_search_result"][]
      }
      grant_location_access: {
        Args: { duration_hours?: number; to_user_id: string }
        Returns: undefined
      }
      has_location_permission: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_channel_admin: {
        Args: { p_channel_id: string; p_user_id: string }
        Returns: boolean
      }
      is_channel_member: {
        Args: { p_channel_id: string; p_user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { p_group_id: string; p_user_id: string }
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
      search_groups: {
        Args: {
          search_query?: string
          search_lat?: number
          search_long?: number
          search_radius_km?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          interest_tags: string[]
          location_name: string
          latitude: number
          longitude: number
          meeting_time: string
          created_by: string
          created_at: string
          member_count: number
          distance_km: number | null
        }[]
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
      channel_genre: ["general", "music", "reading", "gaming", "tech"],
      channel_role: ["admin", "moderator", "member"],
      channel_type: ["text", "voice"],
      channel_visibility: ["public", "private"],
    },
  },
} as const
