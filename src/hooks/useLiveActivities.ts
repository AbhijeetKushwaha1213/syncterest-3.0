
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database, TablesInsert } from '@/integrations/supabase/types';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSupabaseChannel } from './useSupabaseChannel';

export type LiveActivityWithProfile = Database['public']['Tables']['live_activities']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'full_name' | 'avatar_url'> | null
};

const liveActivitiesQueryKey = ['live-activities'];

export const useLiveActivities = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const { data: activities, isLoading } = useQuery<LiveActivityWithProfile[]>({
        queryKey: liveActivitiesQueryKey,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('live_activities')
                .select('*, profiles(*)')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
    });

    const { mutate: upsertActivity, isPending: isUpserting } = useMutation({
        mutationFn: async (activity: TablesInsert<'live_activities'>) => {
             const { data, error } = await supabase.from('live_activities').upsert(activity, { onConflict: 'user_id' }).select();
             if (error) throw error;
             return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: liveActivitiesQueryKey });
        }
    });

    const { mutate: deleteActivity, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            if (!user) return;
            const { error } = await supabase.from('live_activities').delete().eq('user_id', user.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: liveActivitiesQueryKey });
        }
    });
    
    const channel = useSupabaseChannel('live-activities-db-changes');
    
    useEffect(() => {
        if (!channel) return;

        channel
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'live_activities' },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: liveActivitiesQueryKey });
                }
            )
            .subscribe();

    }, [queryClient, channel]);
    
    const userActivity = activities?.find(act => act.user_id === user?.id);

    return { activities, isLoading, userActivity, upsertActivity, isUpserting, deleteActivity, isDeleting };
}
