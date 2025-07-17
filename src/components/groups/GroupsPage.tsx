
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import GroupCard, { type Group } from "./GroupCard";
import CreateGroupDialog from "./CreateGroupDialog";
import { Skeleton } from "@/components/ui/skeleton";
import TrendingChannels from "@/components/home/TrendingChannels";

const GroupsPage = () => {
  const { user } = useAuth();

  const { data: groups, isLoading: isLoadingGroups, error: groupsError } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      console.log("Fetching groups...");
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          group_members!inner(count)
        `)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
      
      console.log("Groups fetched successfully:", data);
      return data || [];
    },
    retry: 3,
    retryDelay: 1000,
  });

  const { data: myMemberships, isLoading: isLoadingMyGroups, error: membershipsError } = useQuery<string[]>({
    queryKey: ["my-groups", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID for memberships");
        return [];
      }
      
      console.log("Fetching user memberships...");
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("Error fetching memberships:", error);
        throw error;
      }
      
      console.log("Memberships fetched:", data);
      return (data || []).map((m: { group_id: string }) => m.group_id);
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: 1000,
  });

  const isLoading = isLoadingGroups || isLoadingMyGroups;
  const hasError = groupsError || membershipsError;

  if (hasError) {
    console.error("Groups page error:", { groupsError, membershipsError });
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Groups</h2>
          <CreateGroupDialog />
        </div>
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold text-red-500">Unable to load groups</h3>
          <p className="text-muted-foreground mt-2">
            Please try refreshing the page or check your connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Groups</h2>
        <CreateGroupDialog />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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

      <TrendingChannels />
    </div>
  );
};

export default GroupsPage;
