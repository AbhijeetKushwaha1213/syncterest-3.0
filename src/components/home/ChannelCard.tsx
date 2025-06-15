
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Flame, Hash, Globe } from 'lucide-react';
import type { Channel } from '@/data/channels';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChannelCardProps {
  channel: Channel;
}

const ChannelCard = ({ channel }: ChannelCardProps) => {
  const onlineCount = Math.floor(channel.memberCount * (Math.random() * (0.95 - 0.8) + 0.8));

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600">
            <Flame className="h-4 w-4 mr-1.5" />
            Popular
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
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl", channel.color)}>
                {channel.logoLetter}
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-base font-bold">{channel.name}</CardTitle>
                <Badge variant="secondary" className='font-normal text-xs'>
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground shrink-0 ml-2">
              <Users className="h-4 w-4 mr-1.5" />
              <span>{channel.memberCount.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{channel.description}</p>
        </Link>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {channel.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal capitalize">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                      <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarImage src="https://github.com/random-user-1.png" />
                          <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarImage src="https://github.com/random-user-2.png" />
                          <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarImage src="https://github.com/random-user-3.png" />
                          <AvatarFallback>C</AvatarFallback>
                      </Avatar>
                  </div>
                  <span className="font-semibold text-foreground">{onlineCount}</span>
                  <span className="mx-1.5">&middot;</span>
                  <span>New channel</span>
              </div>
          </div>
        <Button className="w-full" variant="outline">Join Channel</Button>
      </CardFooter>
    </Card>
  );
};

export default ChannelCard;
