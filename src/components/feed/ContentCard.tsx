
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, MessageCircle, Video } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { FeedItem, Profile } from "./types";
import { getDistance } from "@/lib/location";
import { useState } from "react";

interface ContentCardProps {
  item: FeedItem;
  currentUserProfile: Profile | null;
}

export const ContentCard = ({ item, currentUserProfile }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const creator = item.profiles;
  if (!creator) return null;

  // Fallback handling for privacy settings
  const shouldShowLocation = creator.show_location_on_profile ?? true;
  const locationSharingEnabled = creator.location_sharing_enabled ?? true;

  const distance = shouldShowLocation && locationSharingEnabled ? getDistance(
    currentUserProfile?.latitude,
    currentUserProfile?.longitude,
    creator.latitude,
    creator.longitude
  ) : null;

  const isEvent = item.item_type === 'event';
  const isReel = item.item_type === 'reel';
  
  const itemPath = isEvent ? `/events/${item.id}` : `/profile/${creator.id}`;

  const ItemIcon = isEvent ? Calendar : isReel ? Video : FileText;
  
  let title, description, mediaUrl;

  if (isEvent) {
    title = item.title;
    description = item.description;
    mediaUrl = item.image_url;
  } else if (isReel) {
    title = item.caption || "Reel";
    description = item.caption;
    mediaUrl = item.video_url;
  } else {
    title = item.caption || "Post";
    description = item.caption;
    mediaUrl = item.image_url;
  }

  return (
    <Card 
      className="flex flex-col h-full group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'perspective(1000px) rotateX(2deg) rotateY(2deg)' : 'none',
      }}
    >
      <Link to={itemPath} className="block">
        <div className="relative overflow-hidden aspect-video">
          {isReel && mediaUrl ? (
            <video 
              src={mediaUrl} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              controls 
              muted 
              autoPlay 
              loop 
              playsInline 
            />
          ) : mediaUrl ? (
            <img 
              src={mediaUrl} 
              alt={title || ""} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ItemIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full transition-all duration-300 hover:bg-background/90">
            <ItemIcon className="h-4 w-4" />
          </div>
        </div>
      </Link>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link to={`/profile/${creator.id}`}>
            <Avatar className="h-10 w-10 transition-transform duration-300 hover:scale-110">
              <AvatarImage src={creator.avatar_url ?? ""} />
              <AvatarFallback>{creator.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link 
              to={`/profile/${creator.id}`} 
              className="font-semibold hover:underline transition-colors duration-200 hover:text-primary"
            >
              {creator.username}
            </Link>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
              {distance !== null && <span>· {distance.toFixed(1)} km away</span>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Link to={itemPath} className="hover:underline">
            <h3 className="font-bold text-lg leading-tight truncate transition-colors duration-200 hover:text-primary">
              {title}
            </h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground gap-2 transition-all duration-200 hover:scale-105 hover:text-primary"
        >
            <MessageCircle className="h-4 w-4" />
            Comment
        </Button>
      </CardFooter>
    </Card>
  );
};
