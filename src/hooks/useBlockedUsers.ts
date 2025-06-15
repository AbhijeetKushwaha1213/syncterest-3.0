
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

export const useBlockedUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchBlockedUsers = async () => {
    if (!user) return [];

    const { data: blockedData, error: blockedError } = await supabase
      .from('blocked_users')
      .select('blocked_user_id')
      .eq('user_id', user.id);

    if (blockedError) {
      console.error('Error fetching blocked users:', blockedError);
      throw blockedError;
    }

    if (!blockedData || blockedData.length === 0) {
      return [];
    }

    const blockedUserIds = blockedData.map((b) => b.blocked_user_id);

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, full_name')
      .in('id', blockedUserIds);

    if (profilesError) {
      console.error('Error fetching profiles of blocked users:', profilesError);
      throw profilesError;
    }

    return profilesData || [];
  };

  const blockedUsersQuery = useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: fetchBlockedUsers,
    enabled: !!user,
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .match({ user_id: user.id, blocked_user_id: blockedUserId });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to unblock user. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
      return blockedUserId;
    },
    onSuccess: (unblockedUserId) => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users', user?.id] });
      const unblockedUser = blockedUsersQuery.data?.find(u => u.id === unblockedUserId);
      toast({
        title: 'User Unblocked',
        description: `You have successfully unblocked ${unblockedUser?.username || 'the user'}.`,
      });
    },
  });

  return {
    blockedUsers: blockedUsersQuery.data,
    isLoading: blockedUsersQuery.isLoading,
    unblockUser: unblockUserMutation.mutate,
    isUnblocking: unblockUserMutation.isPending,
  };
};
