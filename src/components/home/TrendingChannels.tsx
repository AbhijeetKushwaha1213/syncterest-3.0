
import { channelsData } from '@/data/channels';
import ChannelCard from './ChannelCard';
import { TrendingUp } from 'lucide-react';

const TrendingChannels = () => {
    const trending = [...channelsData].sort((a, b) => b.memberCount - a.memberCount).slice(0, 6);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Trending Channels</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trending.map(channel => (
                    <ChannelCard key={channel.id} channel={channel} />
                ))}
            </div>
        </div>
    );
};

export default TrendingChannels;
