
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Hash, Globe, Lock, Activity } from 'lucide-react';
import type { Channel } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useJoinChannel } from '@/hooks/useJoinChannel';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { useJoinedChannels } from '@/hooks/useJoinedChannels';

interface ChannelCardProps {
  channel: Channel & { channel_members: { count: number }[] };
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
  const { user } = useAuth();
  const joinChannelMutation = useJoinChannel();
  const { data: joinedChannels } = useJoinedChannels();

  const memberCount = channel.channel_members[0]?.count ?? 0;

  const isMember = useMemo(() => {
    if (!user || !joinedChannels) return false;
    return joinedChannels.some(c => c.id === channel.id);
  }, [user, joinedChannels, channel.id]);

  const handleJoin = () => {
    if (!user) {
      // Maybe prompt to login
      return;
    }
    joinChannelMutation.mutate(channel.id);
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
            <Badge variant="outline" className="capitalize border-blue-200 bg-blue-50 text-blue-600">
                <Activity className="h-4 w-4 mr-1.5" />
                {channel.genre}
            </Badge>
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
            <Link to={`/channels/${channel.id}`}>
              <Hash className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-3">
        <Link to={`/channels/${channel.id}`} className="space-y-3 block flex-grow">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl", channel.color || 'bg-gray-500')}>
                {channel.logo_letter || channel.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base font-bold">{channel.name}</CardTitle>
                <Badge variant="secondary" className='font-normal text-xs capitalize'>
                  {channel.visibility === 'public' ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  {channel.visibility}
                </Badge>
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground shrink-0 ml-2">
              <Users className="h-4 w-4 mr-1.5" />
              <span>{memberCount.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{channel.description}</p>
        </Link>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button 
            className="w-full" 
            variant={isMember ? "secondary" : "outline"}
            onClick={handleJoin}
            disabled={joinChannelMutation.isPending || isMember}
        >
          {isMember ? 'Joined' : (joinChannelMutation.isPending ? 'Joining...' : 'Join Channel')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChannelCard;
