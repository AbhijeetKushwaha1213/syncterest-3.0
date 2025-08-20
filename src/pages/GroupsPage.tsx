
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import GroupCard from "@/components/groups/GroupCard";
import CreateGroupDialog from "@/components/groups/CreateGroupDialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Group } from "@/components/groups/GroupCard";

const GroupsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('groups')
        .select(`
          *,
          group_members(count)
        `);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Group[];
    },
    enabled: !!user,
  });

  const { data: myGroups } = useQuery({
    queryKey: ['my-groups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(item => item.group_id);
    },
    enabled: !!user,
  });

  const filteredGroups = groups?.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Groups</h2>
        <CreateGroupDialog />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGroups.length === 0 && !isLoading ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'No groups found' : 'No groups yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Be the first to create a group and start building a community!'
            }
          </p>
          {!searchTerm && <CreateGroupDialog />}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isMember={myGroups?.includes(group.id) || false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
