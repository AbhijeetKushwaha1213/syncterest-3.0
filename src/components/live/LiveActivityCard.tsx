
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { LiveActivityWithProfile } from '@/hooks/useLiveActivities';
import { activityTypes } from '@/lib/activities';
import { Clock, MessageCircle, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';

interface LiveActivityCardProps {
    activity: LiveActivityWithProfile;
}

const getDistance = (lat1?: number | null, lon1?: number | null, lat2?: number | null, lon2?: number | null) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};


export default function LiveActivityCard({ activity }: LiveActivityCardProps) {
    const { profile: userProfile } = useAuth();
    const { profileLocation } = useLocation();

    const activityConfig = activityTypes.find(a => a.name === activity.activity_type);
    const Icon = activityConfig?.icon;

    const distance = getDistance(profileLocation.latitude, profileLocation.longitude, activity.latitude, activity.longitude);

    if (!activity.profiles) return null; // Don't render if profile is not attached

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-3 p-4">
                <Link to={`/profile/${activity.profiles.id}`}>
                    <Avatar>
                        <AvatarImage src={activity.profiles.avatar_url ?? ""} alt={activity.profiles.username ?? ""} />
                        <AvatarFallback>{activity.profiles.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1">
                    <Link to={`/profile/${activity.profiles.id}`} className="font-semibold hover:underline">
                        {activity.profiles.full_name || activity.profiles.username}
                    </Link>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                       {Icon && <Icon className="h-4 w-4" />} 
                       {activityConfig?.description || activity.activity_type}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
                {activity.custom_message ? (
                    <p className="text-sm italic">"{activity.custom_message}"</p>
                ) : (
                    <p className="text-sm text-muted-foreground h-[40px]">No custom message.</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 pt-0 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title={`Expires ${formatDistanceToNow(new Date(activity.expires_at))} from now`}>
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                    {distance !== null && (
                         <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {distance.toFixed(1)} km away
                         </span>
                    )}
                </div>
                {userProfile?.id !== activity.user_id &&
                    <Button size="sm" variant="secondary" asChild>
                        <Link to={`/chat?with=${activity.profiles.id}`}>
                            <MessageCircle className="h-4 w-4 mr-2" /> Message
                        </Link>
                    </Button>
                }
            </CardFooter>
        </Card>
    );
}

