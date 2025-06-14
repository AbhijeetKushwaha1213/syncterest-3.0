
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Globe, Lock } from "lucide-react";
import ChannelCard from "@/components/channels/ChannelCard";
import type { Channel } from "@/components/channels/ChannelCard";

const channelsData: Channel[] = [
  {
    id: 1,
    name: 'Philosophy Circle',
    description: 'Deep discussions on consciousness, ethics, and the nature of reality. All perspectives...',
    isPopular: true,
    memberCount: 128,
    type: 'Public',
    tags: ['Philosophy', 'Ethics', 'Debate'],
    members: Array.from({ length: 125 }, (_, i) => ({
      avatarUrl: `https://i.pravatar.cc/40?u=a${i}`,
      name: `User ${i + 1}`,
    })),
    status: 'New channel',
    logoLetter: 'D',
  },
  {
    id: 2,
    name: 'Climate Action Network',
    description: 'Connecting people passionate about climate solutions. Discussion, action plans, and local...',
    isPopular: true,
    memberCount: 256,
    type: 'Public',
    tags: ['Climate', 'Environment', 'Action'],
    members: Array.from({ length: 253 }, (_, i) => ({
      avatarUrl: `https://i.pravatar.cc/40?u=b${i}`,
      name: `User ${i + 1}`,
    })),
    status: 'New channel',
    logoLetter: 'C',
  },
  {
    id: 3,
    name: 'Weekend Basketball',
    description: 'Organizing regular basketball games in different cities. Players of all levels welcome.',
    isPopular: true,
    memberCount: 89,
    type: 'Public',
    tags: ['Sports', 'Basketball', 'Fitness'],
    members: Array.from({ length: 86 }, (_, i) => ({
      avatarUrl: `https://i.pravatar.cc/40?u=c${i}`,
      name: `User ${i + 1}`,
    })),
    status: 'New channel',
    logoLetter: 'W',
  },
];


const ChannelsPage = () => {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Channels</h1>
                    <p className="text-muted-foreground">Discover and join community channels</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Channel
                </Button>
            </div>
            
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search channels..." className="pl-10 max-w-sm" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="secondary">All</Button>
                    <Button variant="ghost"><Users className="mr-2 h-4 w-4" /> Joined</Button>
                    <Button variant="ghost"><Globe className="mr-2 h-4 w-4" /> Public</Button>
                    <Button variant="ghost"><Lock className="mr-2 h-4 w-4" /> Private</Button>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {channelsData.map(channel => (
                    <ChannelCard key={channel.id} channel={channel} />
                ))}
            </div>
        </div>
    );
};

export default ChannelsPage;
