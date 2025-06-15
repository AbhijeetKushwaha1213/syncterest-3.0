
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import LiveActivityCard from './LiveActivityCard';
import { WifiOff, PartyPopper, Users } from 'lucide-react';
import MyStatusSelector from './MyStatusSelector';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/button';

const LiveUsersTab = () => {
  const { activities, isLoading } = useLiveActivities();
  const { user } = useAuth();

  const otherActivities = activities?.filter(a => a.user_id !== user?.id) || [];

  return (
    <div className="space-y-6">
      <MyStatusSelector />

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Users className="h-6 w-6" />
            People Nearby ({isLoading ? '...' : otherActivities.length})
        </h2>
        
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && otherActivities.length > 0 && (
          <div className="space-y-3">
            {otherActivities.map(activity => (
              <LiveActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {!isLoading && otherActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed rounded-lg">
            <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-semibold">It's quiet right now...</p>
            <p className="text-sm text-muted-foreground">No one else has shared their status.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveUsersTab;
