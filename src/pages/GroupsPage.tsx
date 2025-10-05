import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/hooks/useLocation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Search, MapPin, Clock, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import GroupCard from "@/components/groups/GroupCard";
import CreateGroupDialog from "@/components/groups/CreateGroupDialog";
import type { Group } from "@/components/groups/GroupCard";

const GroupsPage = () => {
  const { user } = useAuth();
  const { profileLocation, loading: locationLoading } = useLocation();
  const latitude = profileLocation?.latitude;
  const longitude = profileLocation?.longitude;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Interest tags for filtering
  const availableTags = [
    "cycling", "running", "swimming", "fitness", "yoga", "meditation",
    "reading", "writing", "book club", "photography", "art", "music",
    "cooking", "baking", "food", "travel", "hiking", "nature",
    "tech", "programming", "gaming", "movies", "theater", "dance",
    "volunteering", "community", "environment", "animals", "pets"
  ];

  // Search groups using the RPC function with location
  const { data: groups, isLoading } = useQuery({
    queryKey: ['search-groups', searchTerm, latitude, longitude, selectedTags],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('search_groups', {
        search_query: searchTerm || undefined,
        search_lat: latitude || undefined,
        search_long: longitude || undefined,
        search_radius_km: 50 // 50km radius
      });

      if (error) throw error;

      // Filter by selected tags if any
      let filteredData = data || [];
      if (selectedTags.length > 0) {
        filteredData = filteredData.filter(group =>
          group.interest_tags?.some(tag => selectedTags.includes(tag)) || false
        );
      }

      return filteredData as Group[];
    },
    enabled: !!user && !locationLoading,
  });

  // Get user's joined groups
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

  // Groups are already filtered by the RPC function and tag filters
  const filteredGroups = groups || [];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (isLoading || locationLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discover Local Groups</h2>
          <p className="text-muted-foreground mt-1">
            Find communities near you based on your interests and location
          </p>
        </div>
        <CreateGroupDialog />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search groups by name, activity, or interest..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Interest Tags Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Filter by Interest
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTags([])}
            className="text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Location Info */}
      {latitude && longitude && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 w-fit">
          <MapPin className="h-4 w-4" />
          <span>
            Showing groups within 50km of your location
          </span>
        </div>
      )}

      {/* Groups Grid */}
      {filteredGroups.length === 0 && !isLoading ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm || selectedTags.length > 0 ? 'No groups found' : 'No groups yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedTags.length > 0
              ? 'Try adjusting your search terms or filters'
              : 'Be the first to create a group and start building a community!'
            }
          </p>
          {!searchTerm && selectedTags.length === 0 && <CreateGroupDialog />}
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