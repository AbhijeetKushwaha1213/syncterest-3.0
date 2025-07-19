
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Clock, MapPin, Users, MessageCircle, Heart, Eye, 
  UserPlus, Calendar, Tag, Navigation
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { getDistance } from '@/lib/location';
import { cn } from '@/lib/utils';
import type { LiveActivityWithProfile } from '@/hooks/useLiveActivities';

const ACTIVITY_EMOJIS: { [key: string]: string } = {
  'Playing Cricket': '🏏',
  'Coding': '💻',
  'Studying': '📚',
  'Gaming': '🎮',
  'Reading': '📖',
  'Sports': '⚽',
  'Getting Coffee': '☕',
  'Shopping': '🛍️',
  'Working Out': '💪',
  'Making Music': '🎵',
  'Creating Art': '🎨',
  'Cooking': '👨‍🍳'
};

interface EnhancedLiveActivityCardProps {
  activity: LiveActivityWithProfile;
}

export default function EnhancedLiveActivityCard({ activity }: EnhancedLiveActivityCardProps) {
  const { user } = useAuth();
  const { profileLocation } = useLocation();
  const [isInterested, setIsInterested] = useState(false);
  const [participantCount, setParticipantCount] = useState(Math.floor(Math.random() * 10) + 1);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 50) + 5);

  if (!activity.profiles || activity.user_id === user?.id) return null;

  const distance = getDistance(
    profileLocation.latitude, 
    profileLocation.longitude, 
    activity.latitude, 
    activity.longitude
  );

  const activityEmoji = ACTIVITY_EMOJIS[activity.activity_type] || '✨';
  const isExpired = new Date(activity.expires_at) < new Date();
  const timeUntilStart = new Date(activity.created_at);
  const timeUntilEnd = new Date(activity.expires_at);

  const handleJoin = () => {
    setParticipantCount(prev => prev + 1);
    // Here you would typically make an API call to join the activity
  };

  const handleInterested = () => {
    setIsInterested(!isInterested);
    // Here you would typically make an API call to mark interest
  };

  // Parse tags from custom_message if they exist
  const tags = activity.custom_message?.match(/#\w+/g) || [];
  const cleanDescription = activity.custom_message?.replace(/#\w+/g, '').trim() || '';

  return (
    <Card className={cn(
      "w-full transition-all duration-300 hover:shadow-lg border-l-4",
      isExpired ? "border-l-gray-400 opacity-70" : "border-l-green-500"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Link to={`/profile/${activity.profiles.id}`}>
                <Avatar className="h-12 w-12 transition-transform duration-300 hover:scale-110">
                  <AvatarImage src={activity.profiles.avatar_url ?? ""} alt={activity.profiles.username ?? ""} />
                  <AvatarFallback>{activity.profiles.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              {!isExpired && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link 
                  to={`/profile/${activity.profiles.id}`} 
                  className="font-semibold hover:underline transition-colors duration-200 hover:text-primary"
                >
                  {activity.profiles.full_name || activity.profiles.username}
                </Link>
                {!isExpired && (
                  <Badge variant="secondary" className="text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                {distance !== null && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`} away
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{viewCount}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Activity Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{activityEmoji}</span>
          <h3 className="text-lg font-semibold">{activity.activity_type}</h3>
        </div>

        {/* Time Information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {format(timeUntilStart, 'MMM dd, HH:mm')} - {format(timeUntilEnd, 'HH:mm')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {isExpired ? 'Ended' : `Ends ${formatDistanceToNow(timeUntilEnd, { addSuffix: true })}`}
            </span>
          </div>
        </div>

        {/* Location */}
        {cleanDescription && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{cleanDescription}</span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{participantCount} people interested</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            onClick={handleJoin}
            disabled={isExpired}
            className="flex-1"
            variant={isExpired ? "outline" : "default"}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isExpired ? 'Ended' : 'Join'}
          </Button>
          
          <Button asChild variant="outline" size="default">
            <Link to={`/chat?with=${activity.profiles.id}`}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Link>
          </Button>
          
          <Button
            onClick={handleInterested}
            variant="outline"
            size="default"
            className={cn(
              "transition-colors duration-200",
              isInterested && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("w-4 h-4", isInterested && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
