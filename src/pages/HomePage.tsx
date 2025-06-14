import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileGrid from "@/components/ProfileGrid";
import PeopleNearYou from "@/components/PeopleNearYou";
import {
  Flame, Dumbbell, Utensils, Palette, Music, CalendarDays, Gamepad2, Bike,
  Users, MapPin, Wifi, Star, UserCog,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserStatusCard from "@/components/UserStatusCard";
import NearbyPeopleList from "@/components/NearbyPeopleList";
import EventsList from "@/components/events/EventsList";
import AddStoryButton from "@/components/stories/AddStoryButton";


const interests = [
  { name: "Tech", icon: Flame },
  { name: "Fitness", icon: Dumbbell },
  { name: "Food", icon: Utensils },
  { name: "Art", icon: Palette },
  { name: "Music", icon: Music },
  { name: "Events", icon: CalendarDays },
  { name: "Games", icon: Gamepad2 },
  { name: "Sports", icon: Bike },
];

const tabs = [
  { value: "people", label: "People", icon: Users },
  { value: "nearby", label: "Nearby", icon: MapPin },
  { value: "live", label: "Live", icon: Wifi },
  { value: "events", label: "Events", icon: CalendarDays },
  { value: "matches", label: "Matches", icon: Star },
  { value: "groups", label: "Groups", icon: UserCog },
]


const PlaceholderContent = ({ tab }: { tab: string }) => (
  <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4">
    <p className="text-muted-foreground">Content for {tab} coming soon!</p>
  </div>
);


const HomePage = () => {
  return (
    <div className="grid lg:grid-cols-[1fr_350px] gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <AddStoryButton />
            <Card className="flex-1 bg-gradient-to-r from-purple-500 to-orange-500 text-primary-foreground border-0">
              <CardContent className="p-4">
                <h1 className="text-xl font-bold">Good morning! Ready to discover new connections?</h1>
                <p className="mt-1 text-sm text-primary-foreground/80">
                    Discover people with shared interests and connect with your local community.
                </p>
              </CardContent>
            </Card>
        </div>

        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Interests</h2>
            <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                    <Button key={interest.name} variant="outline" className="gap-2 rounded-full">
                        <interest.icon className="h-4 w-4" />
                        {interest.name}
                    </Button>
                ))}
            </div>
        </div>
        
        <Tabs defaultValue="people" className="w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <TabsList className="bg-transparent p-0">
              {tabs.map(tab => (
                 <TabsTrigger key={tab.value} value={tab.value} className="gap-2 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                   <tab.icon className="h-4 w-4"/>
                   {tab.label}
                 </TabsTrigger>
              ))}
            </TabsList>
            <div className="w-full sm:w-[180px]">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="nearby">Nearby</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <TabsContent value="people" className="mt-4">
            <ProfileGrid />
          </TabsContent>
          <TabsContent value="nearby" className="mt-4">
            <div className="space-y-6">
              <UserStatusCard />
              <NearbyPeopleList />
            </div>
          </TabsContent>
          {tabs.filter(t => t.value !== 'people' && t.value !== 'nearby').map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
               {tab.value === 'events' ? <EventsList /> : <PlaceholderContent tab={tab.label} />}
            </TabsContent>
          ))}
        </Tabs>

      </div>
      
      <div className="space-y-6">
        <PeopleNearYou />
      </div>

    </div>
  );
};

export default HomePage;
