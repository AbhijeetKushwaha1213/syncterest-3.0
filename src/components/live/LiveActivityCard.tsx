
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { LiveActivityWithProfile } from '@/hooks/useLiveActivities';
import { Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from '@/hooks/useLocation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

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

const statusStyles: { [key: string]: { status_color: string; badge_classes: string } } = {
  "Looking to chat": {
    status_color: "bg-green-500",
    badge_classes: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  },
  "Open to meetup": {
    status_color: "bg-blue-500",
    badge_classes: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
  },
  "Studying": {
    status_color: "bg-yellow-500",
    badge_classes: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
  },
  "Exploring": {
    status_color: "bg-purple-500",
    badge_classes: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
  },
  "default": {
    status_color: "bg-gray-400",
    badge_classes: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
  }
};

interface LiveActivityCardProps {
    activity: LiveActivityWithProfile;
}

export default function LiveActivityCard({ activity }: LiveActivityCardProps) {
    const { user } = useAuth();
    const { profileLocation } = useLocation();

    if (!activity.profiles || activity.user_id === user?.id) return null;

    const distance = getDistance(profileLocation.latitude, profileLocation.longitude, activity.latitude, activity.longitude);
    const styles = statusStyles[activity.activity_type] || statusStyles.default;

    return (
        <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="relative">
                <Link to={`/profile/${activity.profiles.id}`}>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={activity.profiles.avatar_url ?? ""} alt={activity.profiles.username ?? ""} />
                        <AvatarFallback>{activity.profiles.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
                <span className={cn("absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-background", styles.status_color)}></span>
            </div>
            <div className="flex-1 space-y-1">
                <p>
                    <Link to={`/profile/${activity.profiles.id}`} className="font-semibold hover:underline">
                        {activity.profiles.full_name || activity.profiles.username}
                    </Link>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {distance !== null && (
                         <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`} away
                         </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> 
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                </div>
                 <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className={cn("font-medium", styles.badge_classes)}>
                        {activity.activity_type}
                    </Badge>
                    {activity.custom_message && (
                        <p className="text-sm text-muted-foreground truncate">at {activity.custom_message}</p>
                    )}
                 </div>
            </div>
            <Button asChild>
                <Link to={`/chat?with=${activity.profiles.id}`}>Connect</Link>
            </Button>
        </div>
    );
}
