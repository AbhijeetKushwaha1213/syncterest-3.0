
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database, TablesInsert } from '@/integrations/supabase/types';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSupabaseChannel } from './useSupabaseChannel';
import { useToast } from './use-toast';

export type LiveActivityWithProfile = Database['public']['Tables']['live_activities']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'username' | 'full_name' | 'avatar_url'> | null;
  has_location_permission?: boolean;
  precise_location_hidden?: boolean;
};

const liveActivitiesQueryKey = ['live-activities'];

export const useLiveActivities = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const { data: activities, isLoading, error } = useQuery<LiveActivityWithProfile[]>({
        queryKey: liveActivitiesQueryKey,
        queryFn: async () => {
            try {
                // Use the enhanced RLS policy that automatically checks permissions and audits access
                const { data, error } = await supabase
                    .from('live_activities')
                    .select('*, profiles(id, username, full_name, avatar_url)')
                    .gt('expires_at', new Date().toISOString())
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Live activities fetch error:', error);
                    throw error;
                }

                // Check which activities have location permissions and mask accordingly
                const enhancedActivities = (data || []).map(activity => {
                    const isOwnActivity = activity.user_id === user?.id;
                    const hasLocationData = activity.latitude !== null && activity.longitude !== null;
                    
                    // For non-own activities with location data, check if precise location should be shown
                    if (!isOwnActivity && hasLocationData) {
                        // The RLS policy has already filtered out activities we shouldn't see at all
                        // But we might want to show some activities without precise location
                        return {
                            ...activity,
                            has_location_permission: true, // If we can see it through RLS, we have permission
                            precise_location_hidden: false
                        };
                    }
                    
                    return {
                        ...activity,
                        has_location_permission: isOwnActivity || !hasLocationData,
                        precise_location_hidden: false
                    };
                });

                return enhancedActivities;
            } catch (err) {
                console.error('Error fetching live activities:', err);
                // Handle permission errors gracefully
                if ((err as any)?.code === 'PGRST116' || (err as any)?.message?.includes('permission')) {
                    toast({
                        title: "Privacy Protection Active",
                        description: "Some activities are hidden due to privacy settings.",
                        variant: "default",
                    });
                    return []; // Return empty array instead of throwing
                }
                throw err;
            }
        },
        enabled: !!user,
        retry: (failureCount, error: any) => {
            // Don't retry on permission errors
            if (error?.code === 'PGRST116' || error?.message?.includes('permission')) {
                return false;
            }
            return failureCount < 2;
        }
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

    return { 
        activities: activities || [], 
        isLoading, 
        error,
        userActivity, 
        upsertActivity, 
        isUpserting, 
        deleteActivity, 
        isDeleting 
    };
}
