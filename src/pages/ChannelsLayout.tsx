
import { Outlet } from 'react-router-dom';
import ChannelList from '@/components/channels/ChannelList';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChannelsLayout = () => {
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
