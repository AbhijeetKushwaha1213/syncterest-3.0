
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { addHours } from 'date-fns';

interface SetStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityType: string | null;
}

export const SetStatusDialog = ({ open, onOpenChange, activityType }: SetStatusDialogProps) => {
  const { user } = useAuth();
  const { upsertActivity, isUpserting } = useLiveActivities();
  const { profileLocation, getLocation } = useLocation();
  const { toast } = useToast();
  const [customMessage, setCustomMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activityType) return;

    setIsProcessing(true);

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
      custom_message: customMessage || null,
      latitude: lat || null,
      longitude: lon || null,
      expires_at: addHours(new Date(), 2).toISOString(),
    }, {
      onSuccess: () => {
        toast({ title: "You're live!", description: `Your status is set to "${activityType}".` });
        onOpenChange(false);
        setCustomMessage('');
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
      onSettled: () => {
        setIsProcessing(false);
      }
    });
  };

  const loading = isUpserting || isProcessing;

  // Reset custom message when dialog opens for a new activity
  React.useEffect(() => {
    if (open) {
      setCustomMessage('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set status: {activityType}</DialogTitle>
          <DialogDescription>
            Let others know what you're up to. You can add an optional location or message.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              placeholder="e.g., at Central Park"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={100}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

