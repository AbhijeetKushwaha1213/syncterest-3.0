
import React from 'react';
import { useParams } from 'react-router-dom';
import { useChannelPresence } from '@/hooks/useChannelPresence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChannel } from '@/hooks/useChannel';
import ChannelChat from '@/components/channels/chat/ChannelChat';
import { useChannelRole } from '@/hooks/useChannelRole';
import { EditChannelDialog } from '@/components/channels/EditChannelDialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import ChannelVoice from '@/components/channels/voice/ChannelVoice';

const ChannelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const presence = useChannelPresence(id!);
  const { profile } = useAuth();
  const { data: channel, isLoading, error } = useChannel(id);
  const { data: role } = useChannelRole(id);

  const isAdmin = role === 'admin';
  const onlineUsers = Object.values(presence).flat();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="p-4 border-b">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </header>
        <div className="grid md:grid-cols-3 flex-1">
          <div className="md:col-span-2 border-r p-4">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
        <div className="flex h-full flex-col items-center justify-center bg-background">
            <p className="mt-4 text-lg text-muted-foreground">
              {error ? 'Error loading channel.' : 'Channel not found'}
            </p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">{channel.description}</p>
        </div>
        {isAdmin && (
          <EditChannelDialog channel={channel}>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Edit Channel</span>
            </Button>
          </EditChannelDialog>
        )}
      </header>
      <div className="grid md:grid-cols-3 flex-1">
        <div className="md:col-span-2 border-r flex flex-col">
          {channel.type === 'voice' ? (
            <ChannelVoice channel={channel} />
          ) : (
            <ChannelChat channel={channel} />
          )}
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
