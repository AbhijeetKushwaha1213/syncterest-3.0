
import { supabase } from "@/integrations/supabase/client";

export type NotificationData = {
  conversation_id?: string;
  sender_id?: string;
  follower_id?: string;
  group_id?: string;
  new_member_id?: string;
  message_id?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'new_message' | 'new_follower' | 'group_join';
  data: NotificationData | null;
  is_read: boolean;
  created_at: string;
};

export const getNotifications = async (): Promise<Notification[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
      
    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
};
