
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import { useToast } from '@/hooks/use-toast';
import { activityTypes } from '@/lib/activities';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { SetStatusDialog } from './SetStatusDialog';

const MyStatusSelector = () => {
  const { user } = useAuth();
  const { userActivity, deleteActivity, isDeleting } = useLiveActivities();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleStatusSelect = (activityType: string) => {
    if (!user) return;

    if (userActivity?.activity_type === activityType) {
        deleteActivity(undefined, {
          onSuccess: () => {
            toast({ title: "You're no longer live." });
          },
          onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
          }
        });
        return;
    }

    setSelectedActivity(activityType);
    setDialogOpen(true);
  };

  const activeStatus = useMemo(() => userActivity?.activity_type, [userActivity]);

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
            disabled={isDeleting}
          >
            {isDeleting && activeStatus === activity.name ? <Loader2 className="h-4 w-4 animate-spin"/> : <activity.icon className="h-4 w-4" />}
            {activity.name}
          </Button>
        ))}
      </div>
      <SetStatusDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activityType={selectedActivity}
      />
    </div>
  );
};

export default MyStatusSelector;

