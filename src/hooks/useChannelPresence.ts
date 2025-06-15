import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

export const useChannelPresence = (channelId: string) => {
  const { user, profile } = useAuth();
  const [presenceState, setPresenceState] = useState<RealtimePresenceState>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user || !channelId || !profile) {
      return;
    }

    const channelName = `channel-presence-${channelId}`;
    
    // To prevent issues in StrictMode, we remove any existing channel before creating a new one.
    supabase.removeChannel(supabase.channel(channelName));

    const channel = supabase.channel(channelName, {
        config: {
            presence: {
                key: user.id,
            },
        },
    });
    channelRef.current = channel;

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
        if(channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
    };
  }, [user?.id, channelId, profile]);

  return presenceState;
};
