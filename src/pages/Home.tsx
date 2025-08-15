
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreatePostDialog from '@/components/home/CreatePostDialog';
import CreateReelDialog from '@/components/home/CreateReelDialog';
import CreateStoryDialog from '@/components/home/CreateStoryDialog';
import PostFeed from '@/components/home/PostFeed';
import ReelsFeed from '@/components/home/ReelsFeed';
import StoriesFeed from '@/components/home/StoriesFeed';

const Home = () => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const openDialog = (type: string) => setActiveDialog(type);
  const closeDialog = () => setActiveDialog(null);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome to Community</h1>
        <p className="text-muted-foreground">Share your moments and connect with others</p>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="reels">Reels</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button onClick={() => openDialog('post')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Post
            </Button>
            <Button onClick={() => openDialog('reel')} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Reel
            </Button>
            <Button onClick={() => openDialog('story')} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Story
            </Button>
          </div>
        </div>

        <TabsContent value="posts" className="space-y-6">
          <PostFeed />
        </TabsContent>

        <TabsContent value="reels" className="space-y-6">
          <ReelsFeed />
        </TabsContent>

        <TabsContent value="stories" className="space-y-6">
          <StoriesFeed />
        </TabsContent>
      </Tabs>

      <CreatePostDialog 
        open={activeDialog === 'post'} 
        onOpenChange={(open) => !open && closeDialog()} 
      />
      <CreateReelDialog 
        open={activeDialog === 'reel'} 
        onOpenChange={(open) => !open && closeDialog()} 
      />
      <CreateStoryDialog 
        open={activeDialog === 'story'} 
        onOpenChange={(open) => !open && closeDialog()} 
      />
    </div>
  );
};

export default Home;
