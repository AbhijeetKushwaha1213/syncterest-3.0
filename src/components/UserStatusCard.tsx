
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statuses = [
  { label: "Looking to chat", color: "text-green-500" },
  { label: "Open to meetup", color: "text-blue-500" },
  { label: "Studying", color: "text-yellow-500" },
  { label: "Exploring", color: "text-purple-500" },
];

const UserStatusCard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus, last_active_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profiles_nearby_list'] });
      toast.success(`Your status is now "${newStatus}"`);
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const currentStatus = profile?.status;
  const isLoading = isProfileLoading || isUpdatingStatus;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button
            key={status.label}
            variant={currentStatus === status.label ? "secondary" : "ghost"}
            className="rounded-full"
            onClick={() => updateStatus(status.label)}
            disabled={isLoading}
          >
            {isLoading && currentStatus === status.label ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Circle className={`mr-2 h-3 w-3 ${status.color} fill-current`} />
            )}
            {status.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserStatusCard;
