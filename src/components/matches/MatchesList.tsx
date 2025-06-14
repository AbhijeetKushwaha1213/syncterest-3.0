
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const MatchesList = () => {
  const { data: matchedProfiles, isLoading: isLoadingMatches } = useQuery<Profile[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      // 1. Get the IDs of matched users
      const { data: matchIds, error: rpcError } = await supabase.rpc('get_matches');

      if (rpcError) {
        console.error('Error fetching match IDs:', rpcError);
        throw rpcError;
      }
      
      if (!matchIds || matchIds.length === 0) {
        return [];
      }

      // 2. Fetch the profiles for those IDs
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', matchIds);

      if (profilesError) {
        console.error('Error fetching matched profiles:', profilesError);
        throw profilesError;
      }

      return profiles || [];
    },
  });

  if (isLoadingMatches) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
      </div>
    );
  }

  if (!matchedProfiles || matchedProfiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4">
        <p className="text-muted-foreground">No matches found yet. Keep exploring!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
      {matchedProfiles.map(profile => (
        <Card key={profile.id} className="overflow-hidden">
          <CardContent className="p-0 text-center">
            <Link to={`/profile/${profile.id}`}>
              <Avatar className="h-32 w-full rounded-none">
                <AvatarImage src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}`} alt={profile.full_name || profile.username || 'user'} className="object-cover" />
                <AvatarFallback className="rounded-none">{(profile.full_name || profile.username || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="p-4">
              <Link to={`/profile/${profile.id}`}>
                <h3 className="font-semibold text-base truncate">{profile.full_name || profile.username}</h3>
              </Link>
              <p className="text-xs text-muted-foreground h-8 overflow-hidden">{profile.bio || ''}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchesList;
