
import React from 'react';
import { useParams } from 'react-router-dom';
import { channelsData } from '@/data/channels';
import { useChannelPresence } from '@/hooks/useChannelPresence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChannelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { onlineUsers } = useChannelPresence(id!);
  const { profile } = useAuth();

  const channel = channelsData.find(c => c.id.toString() === id);

  if (!channel) {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-background">
            <p className="mt-4 text-lg text-muted-foreground">Channel not found</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">{channel.name}</h1>
        <p className="text-sm text-muted-foreground">{channel.description}</p>
      </header>
      <div className="grid md:grid-cols-3 flex-1">
        <div className="md:col-span-2 border-r flex flex-col">
          <Card className="flex-1 rounded-none border-0 shadow-none">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/20">
              <p>Chat interface coming soon!</p>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="rounded-none border-0 shadow-none h-full">
            <CardHeader>
              <CardTitle>Online Users ({onlineUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <ul className="space-y-3">
                  {!profile ? (
                    Array.from({length: 3}).map((_, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </li>
                    ))
                  ) : onlineUsers.map((u: any) => (
                    <li key={u.user_id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 relative">
                        <AvatarImage src={u.avatar_url} alt={u.username} />
                        <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                      </Avatar>
                      <span>{u.username}</span>
                      {u.user_id === profile?.id && <Badge variant="outline">You</Badge>}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetailPage;
