
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const CHANNEL_NAME = 'live-users';

export const usePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const channelName = CHANNEL_NAME;
    
    const setupChannel = async () => {
      // To prevent issues in StrictMode, we remove any existing channel before creating a new one.
      const existingChannel = supabase.channel(channelName);
      await supabase.removeChannel(existingChannel);
      
      const newChannel = supabase.channel(channelName, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      newChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({ online_at: new Date().toISOString() });
        }
      });
    };

    setupChannel();

    return () => {
      // We get the channel by name to ensure we remove the correct instance.
      supabase.removeChannel(supabase.channel(channelName));
    };
  }, [user?.id]);
};
