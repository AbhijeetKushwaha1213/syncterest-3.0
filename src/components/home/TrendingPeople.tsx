
import { useTrendingProfiles } from '@/hooks/useTrendingProfiles';
import UserCard from '@/components/UserCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';

const TrendingPeople = () => {
  const { data: profiles, isLoading } = useTrendingProfiles(6);

  if (!isLoading && (!profiles || profiles.length === 0)) {
    return null; // Don't show the section if there are no trending profiles
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 md:px-0">
        <Flame className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Trending People</h2>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="rounded-lg aspect-[3/4]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
          {profiles.map(profile => (
            <UserCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingPeople;
