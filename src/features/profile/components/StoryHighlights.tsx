
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileWithDetails } from "@/api/profiles";
import StoryViewer from "@/components/stories/StoryViewer";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Story = Database['public']['Tables']['stories']['Row'];

type UserStoryGroup = {
  profile: Profile;
  stories: Story[];
};

interface StoryHighlightsProps {
  profile: ProfileWithDetails;
}

export const StoryHighlights = ({ profile }: StoryHighlightsProps) => {
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);

  const handleOpenViewer = (index: number) => {
    setViewingStoryIndex(index);
  };

  const handleCloseViewer = () => {
    setViewingStoryIndex(null);
  };

  if (!profile.stories || profile.stories.length === 0) {
    return null;
  }

  const userStoryGroup: UserStoryGroup = {
    profile,
    stories: profile.stories,
  };

  return (
    <>
      <div className="mb-10">
        <div className="flex space-x-6 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {profile.stories.map((story, index) => (
            <div key={story.id} className="text-center shrink-0 w-20">
              <button
                onClick={() => handleOpenViewer(index)}
                className="w-16 h-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-offset-2 ring-offset-background ring-gray-300 dark:ring-gray-700 cursor-pointer focus:outline-none focus:ring-primary"
              >
                <Avatar className="w-[58px] h-[58px]">
                  <AvatarImage src={story.image_url} alt={`Story ${index + 1}`} />
                  <AvatarFallback>{index + 1}</AvatarFallback>
                </Avatar>
              </button>
              <p className="text-xs font-medium text-muted-foreground mt-1.5 truncate">
                Highlight {index + 1}
              </p>
            </div>
          ))}
        </div>
      </div>

      {viewingStoryIndex !== null && (
        <StoryViewer
          userStories={userStoryGroup}
          onClose={handleCloseViewer}
          onNextUser={handleCloseViewer}
          onPrevUser={handleCloseViewer}
          initialStoryIndex={viewingStoryIndex}
        />
      )}
    </>
  );
};
