
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Story = Database['public']['Tables']['stories']['Row'];

interface StoryViewerProps {
  userStories: {
    profile: Profile;
    stories: Story[];
  };
  onClose: () => void;
  onNextUser: () => void;
  onPrevUser: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ userStories, onClose, onNextUser, onPrevUser }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = userStories.stories[currentStoryIndex];

  useEffect(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 2; // 5 seconds per story
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStoryIndex]);

  useEffect(() => {
    if (progress >= 100) {
      if (currentStoryIndex < userStories.stories.length - 1) {
        setCurrentStoryIndex(i => i + 1);
      } else {
        onNextUser();
      }
    }
  }, [progress, currentStoryIndex, userStories.stories.length, onNextUser]);

  const goToNextStory = () => {
    if (currentStoryIndex < userStories.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      onNextUser();
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      onPrevUser();
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative h-screen max-h-[90vh] w-full max-w-[400px] bg-background/50 rounded-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-2">
              {userStories.stories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  {index < currentStoryIndex && <div className="h-full w-full bg-white" />}
                  {index === currentStoryIndex && <Progress value={progress} className="h-1 [&>div]:bg-white" />}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userStories.profile.avatar_url || undefined} />
                  <AvatarFallback>{userStories.profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold text-sm">{userStories.profile.username}</span>
              </div>
              <button onClick={onClose} className="text-white hover:opacity-80 transition-opacity">
                <X size={24} />
              </button>
            </div>
        </div>
        
        <div className="flex-1 relative">
            <img src={currentStory.image_url} alt={`Story by ${userStories.profile.username}`} className="w-full h-full object-contain" />
        </div>
        
        <button onClick={goToPrevStory} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-white">&#x25C0;</button>
        <button onClick={goToNextStory} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-white/30 flex items-center justify-center text-white">&#x25B6;</button>
      </div>
    </div>
  );
};

export default StoryViewer;
