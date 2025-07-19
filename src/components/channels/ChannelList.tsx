
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Hash, Plus, Mic, AlertTriangle } from 'lucide-react';
import { useJoinedChannels } from '@/hooks/useJoinedChannels';
import { Skeleton } from '../ui/skeleton';
import { CreateChannelDialog } from './CreateChannelDialog';
import { Badge } from '@/components/ui/badge';

const ChannelList = () => {
  const { data: channels, isLoading, error } = useJoinedChannels();

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-9 w-full" />
        <div className="mt-4 space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-2 mx-auto" />
        <p className="text-sm text-destructive">Failed to load channels</p>
        <p className="text-xs text-muted-foreground mt-1">Please try refreshing</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="p-2">
        <CreateChannelDialog>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Channel
          </Button>
        </CreateChannelDialog>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Text Channels
        </p>
        {channels
          ?.filter((channel) => channel.type === 'text')
          .map((channel) => (
            <NavLink
              key={channel.id}
              to={`/channels/${channel.id}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )
              }
            >
              <Hash className="h-4 w-4" />
              <span className="truncate flex-1">{channel.name}</span>
              {channel.unread_count > 0 && (
                <Badge className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full p-0">
                  {channel.unread_count}
                </Badge>
              )}
            </NavLink>
          ))}
        {channels?.filter((channel) => channel.type === 'text').length === 0 && (
          <p className="px-2 py-1 text-xs text-muted-foreground">No text channels joined</p>
        )}
      </nav>
      <nav className="flex flex-col gap-1 p-2">
        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Voice Channels
        </p>
        {channels
          ?.filter((channel) => channel.type === 'voice')
          .map((channel) => (
            <NavLink
              key={channel.id}
              to={`/channels/${channel.id}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )
              }
            >
              <Mic className="h-4 w-4" />
              <span className="truncate flex-1">{channel.name}</span>
            </NavLink>
          ))}
        {channels?.filter((channel) => channel.type === 'voice').length === 0 && (
          <p className="px-2 py-1 text-xs text-muted-foreground">No voice channels joined</p>
        )}
      </nav>
    </div>
  );
};

export default ChannelList;
