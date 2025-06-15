
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { useFeed } from "@/hooks/useFeed";

const FeedList = ({ selectedInterest }: { selectedInterest: string | null }) => {
  const { profile: currentUserProfile } = useAuth();
  const { data: feedItems, isLoading } = useFeed(selectedInterest);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
      </div>
    );
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4 text-center p-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
      {feedItems.map((item) => (
        <ContentCard key={`${item.item_type}-${item.id}`} item={item} currentUserProfile={currentUserProfile} />
      ))}
    </div>
  );
};

export default FeedList;
