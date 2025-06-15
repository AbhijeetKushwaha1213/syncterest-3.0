
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { Channel } from '@/data/channels';
import { cn } from '@/lib/utils';

interface ChannelCardProps {
  channel: Channel;
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <Link to={`/channels/${channel.id}`} className="flex-grow flex flex-col">
        <CardHeader className={cn("text-white rounded-t-lg", channel.color)}>
          <CardTitle>{channel.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-grow">
            <p className="text-sm text-muted-foreground">{channel.description}</p>
        </CardContent>
      </Link>
      <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          {channel.memberCount.toLocaleString()} members
        </div>
        <div className="flex flex-wrap gap-2">
          {channel.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{`#${tag}`}</Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChannelCard;
