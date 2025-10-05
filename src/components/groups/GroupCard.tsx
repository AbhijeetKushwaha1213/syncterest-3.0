import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock, Calendar } from "lucide-react";

// Updated Group type to match our new database schema
export type Group = {
  id: string;
  name: string;
  description: string;
  interest_tags: string[];
  location_name: string;
  latitude: number;
  longitude: number;
  meeting_time: string;
  created_by: string;
  created_at: string;
  member_count: number;
  distance_km?: number | null;
};

interface GroupCardProps {
  group: Group;
  isMember: boolean;
}

const GroupCard = ({ group, isMember }: GroupCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinOrLeaveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in.");

      if (isMember) {
        const { error } = await supabase
          .from("group_members")
          .delete()
          .eq("group_id", group.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("group_members")
          .insert({ group_id: group.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `You have ${isMember ? "left" : "joined"} the group.`,
      });
      queryClient.invalidateQueries({ queryKey: ["search-groups"] });
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

  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <Link
        to={`/groups/${group.id}`}
        className="block hover:bg-muted/50 transition-colors rounded-t-lg cursor-pointer"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-1">{group.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {group.description}
          </CardDescription>
        </CardHeader>
      </Link>

      <CardContent className="px-6 pb-3 space-y-3">
        {/* Interest Tags */}
        {group.interest_tags && group.interest_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {group.interest_tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {group.interest_tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{group.interest_tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Location and Distance */}
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{group.location_name}</span>
          </div>
          {group.distance_km && (
            <div className="flex items-center gap-1">
              <span className="text-xs">📍</span>
              <span>{group.distance_km.toFixed(1)} km away</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="truncate">{group.meeting_time}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          {group.member_count} members
        </div>
        {user?.id !== group.created_by && (
          <Button
            variant={isMember ? "outline" : "default"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              joinOrLeaveMutation.mutate();
            }}
            disabled={joinOrLeaveMutation.isPending}
            className="ml-auto"
          >
            {joinOrLeaveMutation.isPending
              ? (isMember ? "Leaving..." : "Joining...")
              : (isMember ? "Leave" : "Join")
            }
          </Button>
        )}
        {user?.id === group.created_by && (
          <Badge variant="outline" className="ml-auto text-xs">
            CREATOR
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
