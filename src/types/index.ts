
export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  interests?: string[];
  status?: string;
  last_active_at?: string;
  latitude?: number;
  longitude?: number;
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  new_message_notifications: boolean;
  new_follower_notifications: boolean;
  group_activity_notifications: boolean;
  event_reminder_notifications: boolean;
  language: string;
  intent?: string;
  personality_tags?: string[];
  cultural_preferences?: Record<string, any>;
  location_city?: string;
  location_postal_code?: string;
  created_at?: string;
  profile_visibility: string;
  location_sharing_enabled: boolean;
  show_location_on_profile: boolean;
  show_activity_status: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

export interface Reel {
  id: string;
  user_id: string;
  video_url: string;
  caption?: string;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  event_time: string;
  created_by: string;
  created_at: string;
  image_url?: string;
}

export interface Comment {
  id: string;
  post_id?: string;
  event_id?: string;
  reel_id?: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface LiveActivity {
  id: string;
  user_id: string;
  activity_type: string;
  custom_message?: string;
  latitude?: number;
  longitude?: number;
  expires_at: string;
  created_at: string;
}

export interface Follower {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  attachment_url?: string;
  attachment_type?: string;
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface PersonalityResponse {
  id: string;
  user_id: string;
  gender?: string;
  height?: string;
  ethnicity?: string;
  conversation_style?: string;
  values_in_partner?: string;
  sports_excitement?: string;
  trip_handling?: string;
  group_behavior?: string;
  social_energy?: string;
  day_planning?: string;
  weekend_recharge?: string;
  new_experiences?: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedUser {
  id: string;
  user_id: string;
  blocked_user_id: string;
  created_at: string;
}

export interface LocationSharingPermission {
  id: string;
  grantor_id: string;
  grantee_id: string;
  expires_at?: string;
  created_at?: string;
}
