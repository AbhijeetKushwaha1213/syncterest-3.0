
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GroupCard, { type Group } from "./GroupCard";
import CreateGroupDialog from "./CreateGroupDialog";
import { Skeleton } from "@/components/ui/skeleton";

const GroupsPage = () => {
  const { user } = useAuth();

  const { data: groups, isLoading: isLoadingGroups } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("groups") as any)
        .select("*, group_members(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: myMemberships, isLoading: isLoadingMyGroups } = useQuery<
    string[]
  >({
    queryKey: ["my-groups"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase
        .from("group_members") as any)
        .select("group_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []).map((m: { group_id: string }) => m.group_id);
    },
    enabled: !!user,
  });

  const isLoading = isLoadingGroups || isLoadingMyGroups;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Groups</h2>
        <CreateGroupDialog />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && groups && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isMember={myMemberships?.includes(group.id) ?? false}
            />
          ))}
        </div>
      )}

      {!isLoading && (!groups || groups.length === 0) && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No groups yet</h3>
          <p className="text-muted-foreground mt-2">
            Be the first to create one and start a new community!
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
