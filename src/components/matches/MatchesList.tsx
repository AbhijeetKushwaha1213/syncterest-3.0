
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MatchCard } from "./MatchCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MatchData {
  profile_id: string;
  profile: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    location_city: string;
    personality_tags: string[];
    last_active_at: string;
  };
  compatibility_score: number;
}

const matchingCategories = [
  {
    category: "Ideal weekend plans",
    description: "You both love spending weekends exploring new places and trying new activities."
  },
  {
    category: "Best way to unwind",
    description: "You both prefer quiet evenings with a good book or movie."
  },
  {
    category: "Social energy",
    description: "You both enjoy intimate gatherings over large parties."
  },
  {
    category: "Adventure level",
    description: "You both are always up for spontaneous adventures and new experiences."
  }
];

export const MatchesList = () => {
  const { user } = useAuth();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_matches');
      
      if (error) {
        console.error('Error fetching matches:', error);
        throw error;
      }

      // Fetch profile details for each match
      const matchesWithProfiles = await Promise.all(
        (data || []).map(async (match: any) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', match.profile_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return null;
          }

          return {
            ...match,
            profile
          };
        })
      );

      return matchesWithProfiles.filter(Boolean) as MatchData[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-80 h-96 flex-shrink-0" />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold">No matches yet</h3>
        <p className="text-muted-foreground">
          Complete your profile and start following people to see matches!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 p-4">
        {matches.map((match, index) => {
          const randomCategory = matchingCategories[index % matchingCategories.length];
          
          return (
            <MatchCard
              key={match.profile_id}
              profile={match.profile}
              matchScore={Math.round(match.compatibility_score * 100)}
              matchingCategory={randomCategory.category}
              matchingDescription={randomCategory.description}
            />
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
