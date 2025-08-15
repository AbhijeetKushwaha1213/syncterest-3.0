
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export const useGroupMembership = (groupId: string | undefined) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: isMember, isLoading: isLoadingMembership } = useQuery<boolean>({
        queryKey: ['group-membership', groupId, user?.id],
        queryFn: async () => {
            if (!user || !groupId) return false;
            const { count } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', groupId)
                .eq('user_id', user.id);

            return (count ?? 0) > 0;
        },
        enabled: !!user && !!groupId,
    });

    const joinOrLeaveMutation = useMutation({
        mutationFn: async () => {
            if (!user || !groupId) throw new Error("You must be logged in and specify a group.");

            if (isMember) {
                const { error } = await supabase
                    .from("group_members")
                    .delete()
                    .match({ group_id: groupId, user_id: user.id });
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("group_members")
                    .insert({ group_id: groupId, user_id: user.id });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            toast({
                title: "Success!",
                description: `You have ${isMember ? "left" : "joined"} the group.`,
            });
            queryClient.invalidateQueries({ queryKey: ['group-membership', groupId] });
            queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            queryClient.invalidateQueries({ queryKey: ["my-groups"] });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        isMember: isMember ?? false,
        isLoadingMembership,
        joinOrLeave: joinOrLeaveMutation.mutate,
        isJoiningOrLeaving: joinOrLeaveMutation.isPending,
    };
};
