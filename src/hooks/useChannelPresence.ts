
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RealtimePresenceState } from '@supabase/supabase-js';

export const useChannelPresence = (channelId: string) => {
  const { user, profile } = useAuth();
  const [presenceState, setPresenceState] = useState<RealtimePresenceState>({});

  useEffect(() => {
    if (!user || !channelId || !profile) {
      return;
    }

    const channelName = `channel-presence-${channelId}`;
    
    const channel = supabase.channel(channelName, {
        config: {
            presence: {
                key: user.id,
            },
        },
    });

    channel.on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        setPresenceState(newState);
    });

    channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            online_at: new Date().toISOString(),
            user_id: user.id,
            username: profile?.username || 'anonymous',
            avatar_url: profile?.avatar_url,
          });
        }
    });

    return () => {
        supabase.removeChannel(channel);
    };
  }, [user?.id, channelId, profile]);

  return presenceState;
};
