
import { useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSupabaseChannel } from './useSupabaseChannel';

const CHANNEL_NAME = 'live-users';

export const usePresence = () => {
  const { user } = useAuth();
  
  const channelName = user?.id ? CHANNEL_NAME : '';
  const channelOptions = useMemo(() => (user?.id ? {
    config: {
      presence: {
        key: user.id,
      },
    },
  } : undefined), [user?.id]);

  const channel = useSupabaseChannel(channelName, channelOptions);

  useEffect(() => {
    if (!channel) return;

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });
  }, [channel]);
};
