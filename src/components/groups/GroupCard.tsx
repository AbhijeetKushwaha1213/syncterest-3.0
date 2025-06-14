import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

// Manually defining the Group type as a temporary workaround for out-of-sync DB types.
export type Group = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  created_by: string;
  image_url: string | null;
  group_members: { count: number }[];
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
        const { error } = await (supabase
          .from("group_members") as any)
          .delete()
          .match({ group_id: group.id, user_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from("group_members") as any)
          .insert({ group_id: group.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `You have ${isMember ? "left" : "joined"} the group.`,
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-1 h-4 w-4" />
          {group.group_members[0]?.count ?? 0} members
        </div>
        {user?.id !== group.created_by && (
          <Button
            variant={isMember ? "outline" : "default"}
            onClick={() => joinOrLeaveMutation.mutate()}
            disabled={joinOrLeaveMutation.isPending}
          >
            {isMember ? "Leave" : "Join"}
          </Button>
        )}
         {user?.id === group.created_by && (
          <span className="text-xs font-semibold text-muted-foreground">CREATOR</span>
        )}
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
