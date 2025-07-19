
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Lock, Bookmark, Plus, Search } from 'lucide-react';
import ChannelCard from '@/components/home/ChannelCard';
import { useChannels } from '@/hooks/useChannels';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateChannelDialog } from '@/components/channels/CreateChannelDialog';

const ChannelsDiscovery = () => {
  const { data: channels, isLoading, error } = useChannels();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
          <p className="text-muted-foreground">Discover and join community channels</p>
        </div>
        <CreateChannelDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Channel
          </Button>
        </CreateChannelDialog>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search channels..." className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="secondary"><Globe className="mr-2 h-4 w-4" /> All</Button>
            <Button variant="ghost"><Bookmark className="mr-2 h-4 w-4" /> Joined</Button>
            <Button variant="ghost"><Globe className="mr-2 h-4 w-4" /> Public</Button>
            <Button variant="ghost"><Lock className="mr-2 h-4 w-4" /> Private</Button>
        </div>
      </div>
      
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-10">
            <p className="text-destructive">Failed to load channels. Please try refreshing the page.</p>
        </div>
      )}

      {!isLoading && !error && channels && channels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {channels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}

      {!isLoading && !error && (!channels || channels.length === 0) && (
        <div className="text-center py-10">
            <h3 className="text-xl font-semibold">No channels found</h3>
            <p className="text-muted-foreground">Be the first to create one!</p>
        </div>
      )}
    </div>
  );
};

export default ChannelsDiscovery;
