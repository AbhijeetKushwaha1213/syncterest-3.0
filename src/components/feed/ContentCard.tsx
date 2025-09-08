import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Calendar, Video, Forward } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { FeedItem, Profile } from "./types";
import { getDistance } from "@/lib/location";
import { useState } from "react";
import CommentSection from "@/components/comments/CommentSection";
import ShareDialog from "./ShareDialog";

interface ContentCardProps {
  item: FeedItem;
  currentUserProfile: Profile | null;
}

export const ContentCard = ({ item, currentUserProfile }: ContentCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
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

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <>
      <Card className="w-full transition-all duration-300 hover:shadow-lg">
        {/* Header */}
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${creator.id}`}>
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-300 hover:scale-110">
                <AvatarImage src={creator.avatar_url ?? ""} />
                <AvatarFallback>{creator.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link 
                  to={`/profile/${creator.id}`} 
                  className="font-semibold hover:underline transition-colors duration-200 hover:text-primary text-sm sm:text-base truncate"
                >
                  {creator.username}
                </Link>
                {isEvent && <Calendar className="h-4 w-4 text-primary flex-shrink-0" />}
                {isReel && <Video className="h-4 w-4 text-primary flex-shrink-0" />}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                {distance !== null && <span>· {distance.toFixed(1)} km away</span>}
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-0 px-3 sm:px-6">
          {description && (
            <div className="mb-4">
              <p className="text-sm sm:text-base leading-relaxed break-words">{description}</p>
            </div>
          )}
          
          {/* Media */}
          {mediaUrl && (
            <div className="relative overflow-hidden rounded-lg -mx-3 sm:mx-0">
              {isReel ? (
                <video 
                  src={mediaUrl} 
                  className="w-full h-auto max-h-[70vh] sm:max-h-96 object-cover"
                  controls 
                  muted 
                  playsInline 
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt={title || ""} 
                  className="w-full h-auto max-h-[70vh] sm:max-h-96 object-cover"
                />
              )}
            </div>
          )}
        </CardContent>

        {/* Action Bar */}
        <CardFooter className="pt-0 pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between w-full gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-1 sm:gap-2 transition-colors min-w-0 flex-1 sm:flex-none ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Like</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground gap-1 sm:gap-2 hover:text-primary min-w-0 flex-1 sm:flex-none"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comment</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground gap-1 sm:gap-2 hover:text-blue-500 min-w-0 flex-1 sm:flex-none"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground gap-1 sm:gap-2 hover:text-green-500 min-w-0 flex-1 sm:flex-none"
              onClick={() => setShowForwardDialog(true)}
            >
              <Forward className="h-4 w-4" />
              <span className="hidden sm:inline">Forward</span>
            </Button>
          </div>
        </CardFooter>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t px-3 sm:px-6 py-4">
            <CommentSection contentId={item.id} contentType={item.item_type} />
          </div>
        )}
      </Card>

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        contentId={item.id}
        contentType={item.item_type}
        isForward={false}
      />

      {/* Forward Dialog */}
      <ShareDialog
        open={showForwardDialog}
        onOpenChange={setShowForwardDialog}
        contentId={item.id}
        contentType={item.item_type}
        isForward={true}
      />
    </>
  );
};
