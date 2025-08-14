import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useLocationSharing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get permissions granted by the current user
  const { data: grantedPermissions, isLoading: isLoadingGranted } = useQuery({
    queryKey: ['location-permissions-granted', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('location_sharing_permissions')
        .select('*, profiles!location_sharing_permissions_grantee_id_fkey(*)')
        .eq('grantor_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Get permissions granted to the current user
  const { data: receivedPermissions, isLoading: isLoadingReceived } = useQuery({
    queryKey: ['location-permissions-received', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('location_sharing_permissions')
        .select('*, profiles!location_sharing_permissions_grantor_id_fkey(*)')
        .eq('grantee_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Grant location access to a user
  const { mutate: grantAccess, isPending: isGranting } = useMutation({
    mutationFn: async ({ userId, hours = 24 }: { userId: string; hours?: number }) => {
      const { error } = await supabase.rpc('grant_location_access', {
        to_user_id: userId,
        duration_hours: hours
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-permissions-granted'] });
      toast({
        title: "Location access granted",
        description: "The user can now see your live activities.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to grant location access.",
        variant: "destructive",
      });
    }
  });

  // Revoke location access from a user
  const { mutate: revokeAccess, isPending: isRevoking } = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('revoke_location_access', {
        from_user_id: userId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-permissions-granted'] });
      toast({
        title: "Location access revoked",
        description: "The user can no longer see your live activities.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke location access.",
        variant: "destructive",
      });
    }
  });

  // Check if user has permission to see another user's location
  const hasPermissionFor = (userId: string) => {
    return receivedPermissions?.some(
      perm => perm.grantor_id === userId && 
      (perm.expires_at === null || new Date(perm.expires_at) > new Date())
    ) ?? false;
  };

  // Check if current user has granted permission to another user
  const hasGrantedPermissionTo = (userId: string) => {
    return grantedPermissions?.some(
      perm => perm.grantee_id === userId && 
      (perm.expires_at === null || new Date(perm.expires_at) > new Date())
    ) ?? false;
  };

  return {
    grantedPermissions,
    receivedPermissions,
    isLoadingGranted,
    isLoadingReceived,
    grantAccess,
    revokeAccess,
    isGranting,
    isRevoking,
    hasPermissionFor,
    hasGrantedPermissionTo,
  };
};