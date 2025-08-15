
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import ChannelList from '@/components/channels/ChannelList';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChannelsDiscovery from '@/pages/ChannelsDiscovery';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import SectionErrorBoundary from '@/components/SectionErrorBoundary';
import LoadingBoundary from '@/components/LoadingBoundary';

const ChannelsLayoutSkeleton = () => (
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

const ChannelsLayout = () => {
  const { id } = useParams<{ id: string }>();
  const { loading } = useAuth();

  if (loading) {
    return <ChannelsLayoutSkeleton />;
  }

  // If no channel ID, show discovery page
  if (!id) {
    return (
      <SectionErrorBoundary sectionName="Channels Discovery">
        <ChannelsDiscovery />
      </SectionErrorBoundary>
    );
  }

  // If there's a channel ID, show the channel layout with sidebar
  return (
    <div className="grid grid-cols-[260px_1fr] h-full">
      <aside className="border-r bg-muted/30">
        <ScrollArea className="h-full">
          <SectionErrorBoundary sectionName="Channel List">
            <ChannelList />
          </SectionErrorBoundary>
        </ScrollArea>
      </aside>
      <main className="overflow-y-auto">
        <SectionErrorBoundary sectionName="Channel Content">
          <Outlet />
        </SectionErrorBoundary>
      </main>
    </div>
  );
};

export default ChannelsLayout;
