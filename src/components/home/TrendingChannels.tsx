
import ChannelCard from './ChannelCard';
import { TrendingUp } from 'lucide-react';
import { useTrendingChannels } from '@/hooks/useTrendingChannels';
import { Skeleton } from '../ui/skeleton';

const TrendingChannels = () => {
    const { data: channels, isLoading, error } = useTrendingChannels();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Trending Channels</h2>
            </div>
            
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-80 w-full" />
                    ))}
                </div>
            )}

            {error && (
                <div className="text-center py-10">
                    <p className="text-destructive">Failed to load trending channels.</p>
                </div>
            )}
            
            {!isLoading && !error && channels && channels.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {channels.map(channel => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                </div>
            )}

            {!isLoading && !error && channels?.length === 0 && (
                <div className="text-center py-10">
                    <h3 className="text-xl font-semibold">No trending channels yet</h3>
                    <p className="text-muted-foreground">Why not create one?</p>
                </div>
            )}
        </div>
    );
};

export default TrendingChannels;
