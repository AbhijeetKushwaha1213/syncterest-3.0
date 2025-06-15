
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/components/ui/use-toast';
import { activityTypes } from '@/lib/activities';
import { Button } from '@/components/ui/button';
import { addHours } from 'date-fns';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

const MyStatusSelector = () => {
  const { user } = useAuth();
  const { userActivity, upsertActivity, isUpserting, deleteActivity, isDeleting } = useLiveActivities();
  const { profileLocation, getLocation } = useLocation();
  const { toast } = useToast();
  const [processingActivity, setProcessingActivity] = useState<string | null>(null);

  const handleStatusSelect = async (activityType: string) => {
    if (!user) return;
    setProcessingActivity(activityType);

    if (userActivity?.activity_type === activityType) {
        deleteActivity(undefined, {
          onSuccess: () => {
            toast({ title: "You're no longer live." });
          },
          onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
          },
          onSettled: () => {
            setProcessingActivity(null);
          }
        });
        return;
    }

    let lat = profileLocation.latitude;
    let lon = profileLocation.longitude;

    if (!lat || !lon) {
      const location = await getLocation();
      if (location) {
        lat = location.latitude;
        lon = location.longitude;
      }
    }

    upsertActivity({
      user_id: user.id,
      activity_type: activityType,
      custom_message: null,
      latitude: lat || null,
      longitude: lon || null,
      expires_at: addHours(new Date(), 2).toISOString(),
      search_vector: null,
    }, {
      onSuccess: () => {
        toast({ title: "You're live!", description: `Your status is set to "${activityType}".` });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
      onSettled: () => {
        setProcessingActivity(null);
      }
    });
  };

  const activeStatus = useMemo(() => userActivity?.activity_type, [userActivity]);
  const isProcessing = isUpserting || isDeleting;

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-3">Your status</h3>
      <div className="flex flex-wrap gap-2">
        {activityTypes.map(activity => (
          <Button
            key={activity.name}
            variant={activeStatus === activity.name ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => handleStatusSelect(activity.name)}
            disabled={isProcessing}
          >
            {isProcessing && processingActivity === activity.name ? <Loader2 className="h-4 w-4 animate-spin"/> : <activity.icon className="h-4 w-4" />}
            {activity.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MyStatusSelector;
