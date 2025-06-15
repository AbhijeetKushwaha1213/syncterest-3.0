import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { FeedItem, Profile } from "./types";
import { getDistance } from "@/lib/location";

interface ContentCardProps {
  item: FeedItem;
  currentUserProfile: Profile | null;
}

export const ContentCard = ({ item, currentUserProfile }: ContentCardProps) => {
  const creator = item.profiles;
  if (!creator) return null;

  const distance = getDistance(
    currentUserProfile?.latitude,
    currentUserProfile?.longitude,
    creator.latitude,
    creator.longitude
  );

  const isEvent = item.item_type === 'event';
  const itemPath = isEvent ? `/events/${item.id}` : `/profile/${creator.id}`; // Posts don't have detail pages yet

  const ItemIcon = isEvent ? Calendar : FileText;
  const title = isEvent ? item.title : (item.caption || "Post");
  const description = isEvent ? item.description : item.caption;
  const imageUrl = item.image_url;

  return (
    <Card className="flex flex-col h-full group overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={itemPath} className="block">
        <div className="relative overflow-hidden aspect-video">
          {imageUrl ? (
            <img src={imageUrl} alt={title || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ItemIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full">
            <ItemIcon className="h-4 w-4" />
          </div>
        </div>
      </Link>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link to={`/profile/${creator.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={creator.avatar_url ?? ""} />
              <AvatarFallback>{creator.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/profile/${creator.id}`} className="font-semibold hover:underline">{creator.username}</Link>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
              {distance !== null && <span>· {distance.toFixed(1)} km away</span>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Link to={itemPath} className="hover:underline">
            <h3 className="font-bold text-lg leading-tight truncate">{title}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
            <MessageCircle className="h-4 w-4" />
            Comment
        </Button>
      </CardFooter>
    </Card>
  );
};
