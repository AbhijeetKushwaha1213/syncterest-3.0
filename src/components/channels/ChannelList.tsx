
import { NavLink } from 'react-router-dom';
import { channelsData } from '@/data/channels';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Hash, Plus } from 'lucide-react';

const ChannelList = () => {
  return (
    <div className="p-2 space-y-4 h-full flex flex-col">
        <div className='px-2 pt-2 flex justify-between items-center'>
            <h2 className="text-lg font-semibold tracking-tight">Channels</h2>
            <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <nav className="space-y-1 flex-1">
        {channelsData.map(channel => (
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
            <span className='bg-muted p-2 rounded-md'>
                <Hash className="h-4 w-4" />
            </span>
            <span>{channel.name}</span>
            </NavLink>
        ))}
        </nav>
    </div>
  );
};

export default ChannelList;
