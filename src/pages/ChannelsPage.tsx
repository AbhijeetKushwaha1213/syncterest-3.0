import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Globe, Lock } from "lucide-react";
import ChannelCard from "@/components/channels/ChannelCard";
import { channelsData } from "@/data/channels";
import { Link } from "react-router-dom";

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
                    <Link to={`/channels/${channel.id}`} key={channel.id} className="block hover:bg-muted/50 rounded-lg transition-colors p-1">
                        <ChannelCard channel={channel} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ChannelsPage;
