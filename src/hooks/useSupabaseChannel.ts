
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useSupabaseChannel = (
  channelName: string,
  options?: any
): RealtimeChannel | null => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!channelName) {
      setChannel(null);
      return;
    }

    const newChannel = supabase.channel(channelName, options);
    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [channelName, options]);

  return channel;
};
