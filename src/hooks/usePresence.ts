
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

const CHANNEL_NAME = 'live-users';

export const usePresence = () => {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel>();

  useEffect(() => {
    if (!user?.id) return;

    const channelName = CHANNEL_NAME;
    
    // Ensure we don't have a lingering channel with the same topic.
    const existingChannel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });
    channelRef.current = channel;

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = undefined;
      }
    };
  }, [user?.id]);
};
