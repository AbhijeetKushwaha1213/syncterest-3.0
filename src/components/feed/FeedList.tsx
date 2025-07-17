
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { useFeed } from "@/hooks/useFeed";
import { useEffect, useState } from "react";

const FeedList = ({ selectedInterest }: { selectedInterest: string | null }) => {
  const { profile: currentUserProfile } = useAuth();
  const { data: feedItems, isLoading } = useFeed(selectedInterest);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayItems, setDisplayItems] = useState(feedItems);

  useEffect(() => {
    if (feedItems !== displayItems) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayItems(feedItems);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [feedItems, displayItems]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4 animate-fade-in">
        <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold">Nothing to see here... yet!</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {selectedInterest
            ? `No posts or events found for the "${selectedInterest}" interest. Try a different one!`
            : "No posts or events to show right now. Why not explore other sections?"}
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}
    >
      {displayItems.map((item, index) => (
        <div 
          key={`${item.item_type}-${item.id}`}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ContentCard item={item} currentUserProfile={currentUserProfile} />
        </div>
      ))}
    </div>
  );
};

export default FeedList;
