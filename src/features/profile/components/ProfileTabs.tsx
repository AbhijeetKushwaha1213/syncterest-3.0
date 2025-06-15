
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Clapperboard, Calendar, Video } from "lucide-react";
import { ProfileWithDetails } from "@/api/profiles";
import { ProfileEventsTab } from "./ProfileEventsTab";
import CreatePostDialog from "@/components/posts/CreatePostDialog";
import CreateReelDialog from "@/components/reels/CreateReelDialog";

interface ProfileTabsProps {
  profile: ProfileWithDetails;
  isOwnProfile: boolean;
}

export const ProfileTabs = ({ profile, isOwnProfile }: ProfileTabsProps) => (
  <Tabs defaultValue="posts" className="w-full">
    <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border-b rounded-none">
      <TabsTrigger value="posts" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
        <Grid3x3 className="h-5 w-5"/> Posts
      </TabsTrigger>
      <TabsTrigger value="reels" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
        <Clapperboard className="h-5 w-5"/> Reels
      </TabsTrigger>
      <TabsTrigger value="events" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
        <Calendar className="h-5 w-5"/> Events
      </TabsTrigger>
    </TabsList>
    <TabsContent value="posts" className="mt-4">
      {isOwnProfile && (
        <div className="flex justify-end mb-4">
          <CreatePostDialog />
        </div>
      )}
      {profile.posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {profile.posts.map(post => (
            <div key={post.id} className="aspect-square bg-muted overflow-hidden rounded-md">
              <img src={post.image_url} alt={post.caption || "Post"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Grid3x3 className="w-12 h-12 mb-4"/>
          <h3 className="text-lg font-semibold">No Posts Yet</h3>
          {isOwnProfile && <p className="text-muted-foreground mt-2">Click "Add Post" to share your first photo.</p>}
        </div>
      )}
    </TabsContent>
    <TabsContent value="reels" className="mt-4">
      {isOwnProfile && (
        <div className="flex justify-end mb-4">
          <CreateReelDialog />
        </div>
      )}
      {profile.reels && profile.reels.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 md:gap-2">
          {profile.reels.map(reel => (
            <div key={reel.id} className="aspect-[9/16] bg-muted overflow-hidden rounded-md relative group cursor-pointer">
              <video src={reel.video_url} className="w-full h-full object-cover" playsInline muted loop autoPlay />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Video className="h-8 w-8 text-white" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Clapperboard className="w-12 h-12 mb-4"/>
          <h3 className="text-lg font-semibold">No Reels Yet</h3>
          {isOwnProfile ? (
            <p className="text-muted-foreground mt-2">Click "Add Reel" to share your first video.</p>
          ) : (
            <p className="text-muted-foreground mt-2">This user hasn't created any reels yet.</p>
          )}
        </div>
      )}
    </TabsContent>
    <TabsContent value="events" className="mt-4">
      <ProfileEventsTab events={profile.events} isOwnProfile={isOwnProfile} />
    </TabsContent>
  </Tabs>
);
