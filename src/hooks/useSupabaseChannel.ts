
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimeChannelOptions } from '@supabase/supabase-js';

/**
 * A hook to manage the lifecycle of a Supabase Realtime Channel.
 * It handles creating, cleaning up, and preventing duplicate channels.
 * @param channelName The name of the channel to subscribe to.
 * @param options Configuration options for the channel.
 * @returns The RealtimeChannel instance, or undefined if not yet created.
 */
export const useSupabaseChannel = (
  channelName: string,
  options?: RealtimeChannelOptions
) => {
  const [channel, setChannel] = useState<RealtimeChannel>();

  // We stringify options to prevent re-running the effect on every render if the object is created inline.
  const dependencies = [channelName, JSON.stringify(options)];

  useEffect(() => {
    if (!channelName) {
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(undefined);
      }
      return;
    }

    // Ensure we don't have a lingering channel with the same topic.
    const topic = `realtime:${channelName}`;
    const existingChannel = supabase.getChannels().find(c => c.topic === topic);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }
    
    const newChannel = supabase.channel(channelName, options);
    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return channel;
};
