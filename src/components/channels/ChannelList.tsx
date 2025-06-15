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
  return;
};
export default ChannelList;