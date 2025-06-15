
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RealtimePresenceState } from '@supabase/supabase-js';
import { useSupabaseChannel } from './useSupabaseChannel';

export const useChannelPresence = (channelId: string) => {
  const { user, profile } = useAuth();
  const [presenceState, setPresenceState] = useState<RealtimePresenceState>({});

  // Use refs to get the latest user/profile inside useEffect without adding them as dependencies.
  // This prevents re-running the effect on every user/profile change, which would attach multiple listeners.
  const userRef = useRef(user);
  userRef.current = user;
  const profileRef = useRef(profile);
  profileRef.current = profile;

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
    const currentUser = userRef.current;
    const currentProfile = profileRef.current;

    if (!channel || !currentUser || !currentProfile) {
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
                user_id: currentUser.id,
                username: currentProfile.username || 'anonymous',
                avatar_url: currentProfile.avatar_url,
              });
            }
        });
    }

    // The useSupabaseChannel hook handles channel cleanup. By only depending on `channel`,
    // this effect runs only when the channel instance changes, preventing duplicate listeners.
  }, [channel]);

  return presenceState;
};
