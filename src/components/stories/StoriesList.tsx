
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AddStoryButton from './AddStoryButton';
import StoryViewer from './StoryViewer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Story = Database['public']['Tables']['stories']['Row'];

type StoryWithProfile = Story & { profiles: Profile | null };

const fetchStories = async (): Promise<StoryWithProfile[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select('*, profiles(*)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as StoryWithProfile[];
};

type UserStoryGroup = {
  profile: Profile;
  stories: Story[];
};

const StoriesList = () => {
    const { data: stories, isLoading } = useQuery({
        queryKey: ['stories'],
        queryFn: fetchStories
    });
    
    const [viewingUserIndex, setViewingUserIndex] = useState<number | null>(null);

    const storiesByUser = useMemo(() => {
        if (!stories) return [];
        const userGroups: Record<string, UserStoryGroup> = {};
        stories.forEach(story => {
            if (!story.profiles) return;
            
            const userId = story.user_id;
            if (!userGroups[userId]) {
                userGroups[userId] = {
                    profile: story.profiles,
                    stories: [],
                };
            }
            const { profiles, ...storyData } = story;
            userGroups[userId].stories.push(storyData);
        });
        return Object.values(userGroups);
    }, [stories]);

    const handleViewStories = (index: number) => {
        setViewingUserIndex(index);
    };
    
    const handleCloseViewer = () => {
        setViewingUserIndex(null);
    };

    const handleNextUser = () => {
      if (viewingUserIndex !== null && viewingUserIndex < storiesByUser.length - 1) {
        setViewingUserIndex(viewingUserIndex + 1);
      } else {
        setViewingUserIndex(null);
      }
    };
  
    const handlePrevUser = () => {
      if (viewingUserIndex !== null && viewingUserIndex > 0) {
        setViewingUserIndex(viewingUserIndex - 1);
      } else {
        setViewingUserIndex(null);
      }
    };

    const currentUserStories = viewingUserIndex !== null ? storiesByUser[viewingUserIndex] : null;

    return (
        <>
            <div className="flex items-center gap-4 p-4 border-b overflow-x-auto">
                <AddStoryButton />

                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-3 w-12 rounded" />
                    </div>
                ))}
                
                {storiesByUser.map((userStoryGroup, index) => (
                    <div key={userStoryGroup.profile.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => handleViewStories(index)}>
                        <div className="h-16 w-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                             <div className="bg-background h-full w-full rounded-full p-0.5">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={userStoryGroup.profile.avatar_url || undefined} alt={userStoryGroup.profile.username || 'user'}/>
                                    <AvatarFallback>{userStoryGroup.profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        <p className="text-xs font-medium w-16 truncate text-center">{userStoryGroup.profile.username}</p>
                    </div>
                ))}
            </div>
            {currentUserStories && <StoryViewer userStories={currentUserStories} onClose={handleCloseViewer} onNextUser={handleNextUser} onPrevUser={handlePrevUser} />}
        </>
    );
};

export default StoriesList;
