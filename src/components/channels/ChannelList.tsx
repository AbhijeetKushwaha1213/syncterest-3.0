import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Hash, Plus, Mic } from 'lucide-react';
import { useJoinedChannels } from '@/hooks/useJoinedChannels';
import { Skeleton } from '../ui/skeleton';
import { CreateChannelDialog } from './CreateChannelDialog';
import { Badge } from '@/components/ui/badge';
const ChannelList = () => {
  const {
    data: channels,
    isLoading,
    error
  } = useJoinedChannels();
  return <div className="p-2 space-y-4 h-full flex flex-col">
        <div className='px-2 pt-2 flex justify-between items-center'>
            <h2 className="text-lg font-semibold tracking-tight">My Channels</h2>
            <CreateChannelDialog>
                <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </CreateChannelDialog>
        </div>
        
    </div>;
};
export default ChannelList;