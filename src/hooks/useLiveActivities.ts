
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

export type LiveActivityWithProfile = Database['public']['Tables']['live_activities']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'full_name' | 'avatar_url'> | null
};

const liveActivitiesQueryKey = ['live-activities'];

export const useLiveActivities = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const channelRef = useRef<RealtimeChannel>();

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
        mutationFn: async (activity: Omit<Database['public']['Tables']['live_activities']['Row'], 'id' | 'created_at'>) => {
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
    
    useEffect(() => {
        const channelName = 'live-activities-db-changes';

        // Ensure we don't have a lingering channel with the same topic.
        const existingChannel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
        if (existingChannel) {
          supabase.removeChannel(existingChannel);
        }

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'live_activities' },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: liveActivitiesQueryKey });
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = undefined;
            }
        };
    }, [queryClient]);
    
    const userActivity = activities?.find(act => act.user_id === user?.id);

    return { activities, isLoading, userActivity, upsertActivity, isUpserting, deleteActivity, isDeleting };
}

