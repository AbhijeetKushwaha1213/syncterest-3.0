
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { activityTypes } from '@/lib/activities';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivities } from '@/hooks/useLiveActivities';
import { useToast } from '@/components/ui/use-toast';
import { addHours } from 'date-fns';
import { Globe, Loader2, Trash2 } from 'lucide-react';
import type { LiveActivityWithProfile } from '@/hooks/useLiveActivities';

interface LiveStatusComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userActivity: LiveActivityWithProfile | undefined;
}

export default function LiveStatusComposer({ open, onOpenChange, userActivity }: LiveStatusComposerProps) {
  const [activityType, setActivityType] = useState(userActivity?.activity_type || '');
  const [customMessage, setCustomMessage] = useState(userActivity?.custom_message || '');
  const [duration, setDuration] = useState('2');
  const [shareLocation, setShareLocation] = useState(!!userActivity?.latitude);
  
  const { user } = useAuth();
  const { getLocation, profileLocation, loading: locationLoading } = useLocation();
  const { upsertActivity, isUpserting, deleteActivity, isDeleting } = useLiveActivities();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !activityType) {
        toast({ title: "Please select an activity type.", variant: "destructive" });
        return;
    }

    let lat, lon;
    if (shareLocation) {
        if (profileLocation.latitude && profileLocation.longitude) {
            lat = profileLocation.latitude;
            lon = profileLocation.longitude;
        } else {
            // This is simplified. In a real app, you might await getLocation().
            toast({ title: "Location not available.", description: "Please enable location services and try again." });
            return;
        }
    }

    const expires_at = addHours(new Date(), parseInt(duration)).toISOString();

    upsertActivity({
        user_id: user.id,
        activity_type: activityType,
        custom_message: customMessage || null,
        latitude: lat || null,
        longitude: lon || null,
        expires_at,
    }, {
        onSuccess: () => {
            toast({ title: "You're live!", description: "Your status has been updated." });
            onOpenChange(false);
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });
  };

  const handleDelete = () => {
      deleteActivity(undefined, {
          onSuccess: () => {
              toast({ title: "You're no longer live.", description: "Your status has been removed." });
              onOpenChange(false);
          },
          onError: (error) => {
              toast({ title: "Error", description: error.message, variant: "destructive" });
          }
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{userActivity ? 'Update your status' : 'Share what you\'re up to'}</DialogTitle>
          <DialogDescription>Let others know what you're doing right now. Your status will expire automatically.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div>
                <Label className="mb-2 block">What's the vibe?</Label>
                <ToggleGroup type="single" value={activityType} onValueChange={setActivityType} className="flex-wrap justify-start">
                    {activityTypes.map(activity => (
                        <ToggleGroupItem key={activity.name} value={activity.name} className="flex flex-col h-16 w-20">
                            <activity.icon className="h-5 w-5 mb-1"/>
                            <span className="text-xs">{activity.name}</span>
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
            <div>
                <Label htmlFor="message">Custom Message (optional)</Label>
                <Textarea id="message" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="e.g., At the library, 3rd floor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="duration">Available for</Label>
                    <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 hour</SelectItem>
                            <SelectItem value="2">2 hours</SelectItem>
                            <SelectItem value="4">4 hours</SelectItem>
                            <SelectItem value="6">6 hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                        <Switch id="share-location" checked={shareLocation} onCheckedChange={checked => {
                            setShareLocation(checked);
                            if (checked && (!profileLocation.latitude || !profileLocation.longitude)) {
                                getLocation();
                            }
                        }}/>
                        <Label htmlFor="share-location" className="flex items-center gap-2">
                            {locationLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Globe className="h-4 w-4" />}
                            Share Location
                        </Label>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter className="sm:justify-between">
            <div>
            {userActivity && (
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Go Offline
                </Button>
            )}
            </div>
            <div className="flex gap-2">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={isUpserting || !activityType}>
                    {isUpserting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {userActivity ? 'Update' : 'Go Live'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
