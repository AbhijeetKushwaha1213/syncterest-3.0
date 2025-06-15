
import { Channel } from '@/types';
import { Button } from '@/components/ui/button';
import { 
    Megaphone, MessageSquare, Mic, Video, Folder, LucideIcon,
    Music, MicVocal, SlidersHorizontal, FileMusic,
    Library, Bookmark, FileText, Users,
    Link, Tv, Swords, Server,
    Code, GitPullRequest, Github, Lightbulb
} from 'lucide-react';
import { Separator } from '../ui/separator';

interface ChannelSidebarProps {
  channel: Channel;
  activeView: string;
  setActiveView: (view: string) => void;
}

interface NavItem {
    name: string;
    icon: LucideIcon;
    view: string;
}

const baseNavItems: NavItem[] = [{
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

const genreNavItems: Record<string, NavItem[]> = {
    music: [
        { name: 'Karaoke Booth', icon: MicVocal, view: 'karaoke' },
        { name: 'Instrument Tuner', icon: SlidersHorizontal, view: 'tuner' },
        { name: 'Sheet Music Viewer', icon: FileMusic, view: 'sheet-music' },
        { name: 'Live Jam', icon: Music, view: 'live-jam' },
    ],
    reading: [
        { name: 'Library', icon: Library, view: 'library' },
        { name: 'Bookmarks', icon: Bookmark, view: 'bookmarks' },
        { name: 'Notes', icon: FileText, view: 'notes' },
        { name: 'Discussion Circles', icon: Users, view: 'discussion-circles' },
    ],
    gaming: [
        { name: 'Game Links', icon: Link, view: 'game-links' },
        { name: 'Streaming Rooms', icon: Tv, view: 'streaming-rooms' },
        { name: 'Match Lobby', icon: Swords, view: 'match-lobby' },
        { name: 'Server Tools', icon: Server, view: 'server-tools' },
    ],
    tech: [
        { name: 'Live Code Editor', icon: Code, view: 'live-code-editor' },
        { name: 'Code Review Room', icon: GitPullRequest, view: 'code-review-room' },
        { name: 'GitHub Integration', icon: Github, view: 'github-integration' },
        { name: 'Project Pitches', icon: Lightbulb, view: 'project-pitches' },
    ]
};

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
        {baseNavItems.map(item => <Button key={item.name} variant={activeView === item.view ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveView(item.view)}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>)}
      </nav>
      {channel.genre && genreNavItems[channel.genre] && (
        <>
            <Separator />
            <nav className="flex flex-col gap-1 p-2">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {channel.genre} Features
                </p>
                {genreNavItems[channel.genre].map(item => <Button key={item.name} variant={activeView === item.view ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveView(item.view)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                </Button>)}
            </nav>
        </>
      )}
    </aside>;
};
export default ChannelSidebar;
