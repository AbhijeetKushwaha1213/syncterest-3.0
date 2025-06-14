
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from '@/hooks/useAuth';

type Profile = Database['public']['Tables']['profiles']['Row'];
type PresenceState = {
  [key: string]: {
    online_at: string;
  }[];
};

const CHANNEL_NAME = 'live-users';

const LiveUsersTab = () => {
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  
  useEffect(() => {
    const channel = supabase.channel(CHANNEL_NAME);

    const handlePresenceChange = () => {
      const presenceState: PresenceState = channel.presenceState();
      const userIds = Object.keys(presenceState).filter(id => id !== user?.id);
      setOnlineUserIds(userIds);
    };

    channel
      .on('presence', { event: 'sync' }, handlePresenceChange)
      .on('presence', { event: 'join' }, handlePresenceChange)
      .on('presence', { event: 'leave' }, handlePresenceChange)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ['live-profiles', onlineUserIds],
    queryFn: async () => {
      if (onlineUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', onlineUserIds)
        .not('username', 'is', null);

      if (error) throw error;
      return data || [];
    },
    enabled: onlineUserIds.length > 0,
  });

  if (isLoading && onlineUserIds.length > 0) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No users are currently live.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {profiles.map(profile => (
        <Card key={profile.id} className="overflow-hidden relative">
          <CardContent className="p-0 text-center">
            <Link to={`/profile/${profile.id}`}>
              <Avatar className="h-32 w-full rounded-none relative">
                <AvatarImage src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}`} alt={profile.full_name || profile.username || 'user'} className="object-cover" />
                <AvatarFallback className="rounded-none">{(profile.full_name || profile.username || 'U').charAt(0)}</AvatarFallback>
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    Live
                </div>
              </Avatar>
            </Link>
            <div className="p-4">
              <Link to={`/profile/${profile.id}`}>
                <h3 className="font-semibold text-base truncate">{profile.full_name || profile.username}</h3>
              </Link>
              <p className="text-xs text-muted-foreground h-8 overflow-hidden">{profile.bio || ''}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LiveUsersTab;
