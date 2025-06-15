import { Channel } from '@/types';
import { Button } from '@/components/ui/button';
import { Megaphone, MessageSquare, Mic, Video, Folder } from 'lucide-react';
import { Separator } from '../ui/separator';
interface ChannelSidebarProps {
  channel: Channel;
  activeView: string;
  setActiveView: (view: string) => void;
}
const navItems = [{
  name: 'Announcements',
  icon: Megaphone,
  view: 'announcements'
}, {
  name: 'General Chat',
  icon: MessageSquare,
  view: 'chat'
}, {
  name: 'Voice Room',
  icon: Mic,
  view: 'voice'
}, {
  name: 'Video Room',
  icon: Video,
  view: 'video'
}, {
  name: 'Shared Files',
  icon: Folder,
  view: 'files'
}];
const ChannelSidebar = ({
  channel,
  activeView,
  setActiveView
}: ChannelSidebarProps) => {
  return <aside className="hidden md:flex flex-col border-r bg-muted/30 p-2 gap-2">
      <div className="p-2">
        <h2 className="font-bold text-lg truncate" title={channel.name}>{channel.name}</h2>
        <p className="text-sm text-muted-foreground">Channel Sections</p>
      </div>
      <Separator />
      <nav className="flex flex-col gap-1 p-2 mx-0 px-[7px] py-[5px] rounded">
        {navItems.map(item => <Button key={item.name} variant={activeView === item.view ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveView(item.view)}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>)}
      </nav>
    </aside>;
};
export default ChannelSidebar;