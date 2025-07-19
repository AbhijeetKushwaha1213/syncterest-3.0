
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import MatchCard from "./MatchCard";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileWithCompatibility = Profile & { compatibility_score: number };

const MatchesList = () => {
  const { data: matchedProfiles, isLoading: isLoadingMatches, error } = useQuery<ProfileWithCompatibility[]>({
    queryKey: ['matches_with_enhanced_compatibility'],
    queryFn: async () => {
      console.log("Fetching matches with enhanced compatibility...");
      
      const { data: matchesData, error: rpcError } = await supabase.rpc('get_matches');
      console.log("RPC get_matches result:", { matchesData, rpcError });

      if (rpcError) {
        console.error('Error fetching matches:', rpcError);
        throw rpcError;
      }
      
      if (!matchesData || matchesData.length === 0) {
        console.log("No matches found.");
        return [];
      }

      const profileIds = matchesData.map(match => match.profile_id);
      console.log(`Fetching profiles for ${profileIds.length} matched IDs.`);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);

      if (profilesError) {
        console.error('Error fetching matched profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles) {
        return [];
      }

      const profilesWithScores = profiles.map(profile => {
        const matchData = matchesData.find(m => m.profile_id === profile.id);
        return {
          ...profile,
          compatibility_score: matchData?.compatibility_score ?? 0,
        };
      });

      profilesWithScores.sort((a, b) => b.compatibility_score - a.compatibility_score);

      console.log("Successfully fetched and sorted matched profiles with enhanced scores:", profilesWithScores);
      return profilesWithScores;
    },
  });

  if (error) {
    console.error("Error loading matches:", error);
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4">
        <p className="text-muted-foreground text-red-500">Could not load matches. Please try again later.</p>
      </div>
    );
  }

  if (isLoadingMatches) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-80 flex-shrink-0 rounded-lg" />
        ))}
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
    <div className="w-full">
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {matchedProfiles.map(profile => (
            <CarouselItem key={profile.id} className="pl-2 md:pl-4 basis-auto">
              <MatchCard profile={profile} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default MatchesList;
