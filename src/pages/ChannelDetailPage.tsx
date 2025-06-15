
import React, { useState, useEffect } from 'react';
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
import { Settings, Users, Video, ScreenShare } from 'lucide-react';
import ChannelVoice from '@/components/channels/voice/ChannelVoice';
import ChannelSidebar from '@/components/channels/ChannelSidebar';

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex flex-col h-full bg-muted/20 p-6 items-center justify-center text-center">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-muted-foreground mt-2">
      This feature is coming soon!
    </p>
  </div>
);

const ChannelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const presence = useChannelPresence(id!);
  const { profile } = useAuth();
  const { data: channel, isLoading, error } = useChannel(id);
  const { data: role } = useChannelRole(id);
  const [activeView, setActiveView] = useState<string | null>(null);

  useEffect(() => {
    if (channel) {
      setActiveView(channel.type === 'voice' ? 'voice' : 'chat');
    }
  }, [channel]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-muted/20">
        <header className="relative shrink-0">
          <Skeleton className="h-32 md:h-40 w-full" />
          <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full border-4 border-background" />
              <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </header>
        <div className="grid md:grid-cols-[240px_1fr_280px] flex-1 overflow-hidden">
          <div className="hidden md:flex flex-col border-r p-4 gap-4 bg-muted/30">
            <Skeleton className="h-7 w-32 mb-2" />
            <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <div className="p-4"><Skeleton className="h-full w-full" /></div>
          <aside className="hidden md:flex flex-col border-l p-4 gap-4 bg-muted/30">
            <Skeleton className="h-7 w-32 mb-2" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </aside>
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

  const isAdmin = role === 'admin';
  const onlineUsers = Object.values(presence).flat();
  const memberCount = channel.channel_members?.[0]?.count ?? 0;

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <header className="relative shrink-0">
        <div 
          className="h-32 md:h-40 bg-cover bg-center" 
          style={{ backgroundImage: channel.image_url ? `url(${channel.image_url})` : `url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        </div>
        <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end gap-2">
            <div className="flex items-center gap-4 overflow-hidden">
                <Avatar className="h-16 w-16 border-4 border-background bg-muted shrink-0">
                    <AvatarImage src={channel.image_url || undefined} alt={channel.name} />
                    <AvatarFallback className="text-2xl font-bold" style={{ backgroundColor: channel.color || undefined }}>
                        {channel.logo_letter || channel.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <h1 className="text-2xl font-bold text-white shadow-md truncate">{channel.name}</h1>
                    <div className="flex items-center gap-x-3 gap-y-1 text-sm text-gray-300 shadow-sm flex-wrap">
                      {channel.description && <p className="truncate max-w-[200px] md:max-w-xs" title={channel.description}>{channel.description}</p>}
                      <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border md:w-auto w-9 p-0 md:px-3">
                <Video className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Join Call</span>
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border md:w-auto w-9 p-0 md:px-3">
                <ScreenShare className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Share Screen</span>
              </Button>
              {isAdmin && (
                <EditChannelDialog channel={channel}>
                  <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 border md:w-auto w-9 p-0 md:px-3">
                    <Settings className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Settings</span>
                  </Button>
                </EditChannelDialog>
              )}
            </div>
        </div>
      </header>
      <div className="grid md:grid-cols-[240px_1fr_280px] flex-1 overflow-hidden">
        {activeView && <ChannelSidebar channel={channel} activeView={activeView} setActiveView={setActiveView} />}
        <div className="flex flex-col overflow-hidden">
          {activeView === 'announcements' && <PlaceholderView title="Announcements" />}
          {activeView === 'chat' && <ChannelChat channel={channel} />}
          {activeView === 'voice' && <ChannelVoice channel={channel} />}
          {activeView === 'video' && <PlaceholderView title="Video Room" />}
          {activeView === 'files' && <PlaceholderView title="Shared Files" />}
        </div>
        <aside className="hidden md:flex flex-col border-l p-4 gap-4 bg-muted/30">
          <h2 className="font-semibold text-lg">Online — {onlineUsers.length}</h2>
          <ScrollArea className="flex-1">
            <ul className="space-y-3 pr-2">
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
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                  </Avatar>
                  <span className="font-medium text-sm truncate">{u.username}</span>
                  {u.user_id === profile?.id && <Badge variant="secondary">You</Badge>}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
};

export default ChannelDetailPage;
