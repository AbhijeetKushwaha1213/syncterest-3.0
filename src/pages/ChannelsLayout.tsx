
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ChannelList from '@/components/channels/ChannelList';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChannelsDiscovery from '@/pages/ChannelsDiscovery';

const ChannelsLayout = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <ChannelsDiscovery />;
  }

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
