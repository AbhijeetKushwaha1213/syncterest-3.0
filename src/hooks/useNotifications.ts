import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/api/notifications';
import { useAuth } from './useAuth';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { RealtimeChannel } from '@supabase/supabase-js';

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications, ...queryInfo } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
  });

  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  });

  const queryClientRef = useRef(queryClient);
  useEffect(() => {
    queryClientRef.current = queryClient;
  });

  const channelRef = useRef<RealtimeChannel>();

  useEffect(() => {
    if (!user?.id) return;

    const channelName = 'public:notifications';

    // Ensure we don't have a lingering channel with the same topic.
    const existingChannel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel(channelName)
      .on<Notification>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          queryClientRef.current.invalidateQueries({ queryKey: ['notifications'] });
          toastRef.current({
            title: "New Notification",
            description: "You have a new notification.",
          });
        }
      )
      .subscribe();
    
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = undefined;
      }
    };
  }, [user?.id]);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0;

  return { 
    notifications, 
    unreadCount,
    markAsRead: markAsReadMutation.mutate, 
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    ...queryInfo 
  };
};
