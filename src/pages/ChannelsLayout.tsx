
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ChannelList from '@/components/channels/ChannelList';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChannelsDiscovery from '@/pages/ChannelsDiscovery';
import ErrorBoundary from '@/components/ErrorBoundary';

const ChannelsLayout = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="grid grid-cols-[260px_1fr] h-full">
      <aside className="border-r bg-muted/30">
        <ScrollArea className="h-full">
          <ErrorBoundary>
            <ChannelList />
          </ErrorBoundary>
        </ScrollArea>
      </aside>
      <main className="overflow-y-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default ChannelsLayout;
