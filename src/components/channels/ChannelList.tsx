
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Hash, Plus } from 'lucide-react';
import { useJoinedChannels } from '@/hooks/useJoinedChannels';
import { Skeleton } from '../ui/skeleton';
import { CreateChannelDialog } from './CreateChannelDialog';

const ChannelList = () => {
  const { data: channels, isLoading, error } = useJoinedChannels();

  return (
    <div className="p-2 space-y-4 h-full flex flex-col">
        <div className='px-2 pt-2 flex justify-between items-center'>
            <h2 className="text-lg font-semibold tracking-tight">My Channels</h2>
            <CreateChannelDialog>
                <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </CreateChannelDialog>
        </div>
        <nav className="space-y-1 flex-1">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-32" />
            </div>
        ))}
        {error && <p className='px-3 text-sm text-destructive'>Failed to load channels.</p>}
        {!isLoading && !error && channels?.map(channel => (
            <NavLink
            key={channel.id}
            to={`/channels/${channel.id}`}
            className={({ isActive }) =>
                cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
            }
            >
            <span className={cn('p-2 rounded-md', channel.color ? channel.color : 'bg-muted')}>
                <Hash className="h-4 w-4 text-white" />
            </span>
            <span>{channel.name}</span>
            </NavLink>
        ))}
        {!isLoading && channels?.length === 0 && (
            <p className='px-3 text-sm text-muted-foreground'>You haven't joined any channels yet.</p>
        )}
        </nav>
    </div>
  );
};

export default ChannelList;
