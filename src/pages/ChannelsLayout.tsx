
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ChannelList from '@/components/channels/ChannelList';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChannelsDiscovery from '@/pages/ChannelsDiscovery';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const ChannelsLayout = () => {
  const { id } = useParams<{ id: string }>();
  const { loading } = useAuth();

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-[260px] border-r bg-muted/30 p-4">
          <Skeleton className="h-8 w-full mb-4" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no specific channel ID, show the discovery page
  if (!id) {
    return <ChannelsDiscovery />;
  }

  // If we have a channel ID, show the layout with sidebar and outlet
  return (
    <div className="grid grid-cols-[260px_1fr] h-full">
      <aside className="border-r bg-muted/30">
        <ScrollArea className="h-full">
          <ChannelList />
        </ScrollArea>
      </aside>
      <main className="overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ChannelsLayout;
