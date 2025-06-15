
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RealtimePresenceState } from '@supabase/supabase-js';
import { useSupabaseChannel } from './useSupabaseChannel';

export const useChannelPresence = (channelId: string) => {
  const { user, profile } = useAuth();
  const [presenceState, setPresenceState] = useState<RealtimePresenceState>({});

  const channelName = user && channelId && profile ? `channel-presence-${channelId}` : '';
  const channelOptions = useMemo(() => (user?.id ? {
      config: {
          presence: {
              key: user.id,
          },
      },
  } : undefined), [user?.id]);

  const channel = useSupabaseChannel(channelName, channelOptions);

  useEffect(() => {
    if (!channel || !user || !profile) {
      setPresenceState({});
      return;
    }

    const handleSync = () => {
        const newState = channel.presenceState();
        setPresenceState(newState);
    };

    channel.on('presence', { event: 'sync' }, handleSync);

    // Only subscribe if not already connected to avoid errors.
    if (channel.state !== 'joined') {
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track({ 
                online_at: new Date().toISOString(),
                user_id: user.id,
                username: profile.username || 'anonymous',
                avatar_url: profile.avatar_url,
              });
            }
        });
    }

    return () => {
        channel.off('presence', { event: 'sync' }, handleSync);
    }
  }, [channel, user, profile]);

  return presenceState;
};
