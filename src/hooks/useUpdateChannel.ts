
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChannel } from '@/api/channels';
import { toast } from '@/hooks/use-toast';
import { Channel } from '@/types';

export const useUpdateChannel = (channelId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Pick<Channel, 'name' | 'description'>>) => updateChannel({ channelId, updates }),
    onSuccess: (updatedChannel) => {
      queryClient.setQueryData(['channel', channelId], updatedChannel);
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['joined-channels'] });

      toast({ title: "Success", description: "Channel updated successfully." });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating channel',
        description: error.message,
      });
    },
  });
};
