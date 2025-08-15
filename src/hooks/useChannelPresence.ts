
import { useState, useEffect } from 'react';

export const useChannelPresence = (channelId?: string) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!channelId) {
      setOnlineUsers([]);
      return;
    }

    // Placeholder implementation
    setOnlineUsers([]);
  }, [channelId]);

  return { onlineUsers };
};
