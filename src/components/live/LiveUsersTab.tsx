
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import LiveActivityCard from './LiveActivityCard';
import LiveStatusComposer from './LiveStatusComposer';
import { WifiOff, PartyPopper } from 'lucide-react';

const LiveUsersTab = () => {
  const { activities, isLoading, userActivity } = useLiveActivities();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Live Now</h2>
        <Button onClick={() => setIsComposerOpen(true)}>
          {userActivity ? 'Update Status' : 'Go Live'}
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      )}

      {!isLoading && activities && activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map(activity => (
            <LiveActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {!isLoading && (!activities || activities.length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">It's quiet right now...</p>
          <p className="text-sm text-muted-foreground mb-4">Be the first to share what you're up to!</p>
          <Button onClick={() => setIsComposerOpen(true)}>
            <PartyPopper className="h-4 w-4 mr-2" />
            Start a Vibe
          </Button>
        </div>
      )}

      <LiveStatusComposer
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        userActivity={userActivity}
      />
    </>
  );
};

export default LiveUsersTab;
