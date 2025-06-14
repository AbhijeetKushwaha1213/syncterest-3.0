
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Clapperboard, Tag } from "lucide-react";
import { ProfileWithDetails } from "@/api/profiles";

interface ProfileTabsProps {
  profile: ProfileWithDetails;
}

export const ProfileTabs = ({ profile }: ProfileTabsProps) => (
  <Tabs defaultValue="posts" className="w-full">
    <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border-b rounded-none">
      <TabsTrigger value="posts" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
        <Grid3x3 className="h-5 w-5"/> Posts
      </TabsTrigger>
      <TabsTrigger value="reels" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
        <Clapperboard className="h-5 w-5"/> Reels
      </TabsTrigger>
      <TabsTrigger value="tagged" className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-2 border-b-2 border-transparent text-muted-foreground gap-2">
        <Tag className="h-5 w-5"/> Tagged
      </TabsTrigger>
    </TabsList>
    <TabsContent value="posts" className="mt-4">
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {profile.posts.length > 0
          ? profile.posts.map(post => (
              <div key={post.id} className="aspect-square bg-muted overflow-hidden rounded-md">
                <img src={post.image_url} alt={post.caption || "Post"} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"/>
              </div>
            ))
          : [...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-md" />
            ))
        }
      </div>
    </TabsContent>
    <TabsContent value="reels">
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Clapperboard className="w-12 h-12 mb-4"/>
        <h3 className="text-lg font-semibold">No Reels Yet</h3>
      </div>
    </TabsContent>
    <TabsContent value="tagged">
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Tag className="w-12 h-12 mb-4"/>
        <h3 className="text-lg font-semibold">No Tagged Photos Yet</h3>
      </div>
    </TabsContent>
  </Tabs>
);
