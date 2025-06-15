
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EventsList from "@/components/events/EventsList";
import GroupsPage from "@/components/groups/GroupsPage";
import MatchesList from "@/components/matches/MatchesList";
import NearbyTab from "@/components/nearby/NearbyTab";
import LiveUsersTab from "@/components/live/LiveUsersTab";
import FeedList from "@/components/feed/FeedList";
import {
  Users, MapPin, Wifi, CalendarDays, Star, UserCog, ArrowUpAZ,
} from "lucide-react";

const tabs = [
  { value: "people", label: "People", icon: Users },
  { value: "nearby", label: "Nearby", icon: MapPin },
  { value: "live", label: "Live", icon: Wifi },
  { value: "events", label: "Events", icon: CalendarDays },
  { value: "matches", label: "Matches", icon: Star },
  { value: "groups", label: "Groups", icon: UserCog },
];

const PlaceholderContent = ({ tab }: { tab: string }) => (
  <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4">
    <p className="text-muted-foreground">Content for {tab} coming soon!</p>
  </div>
);

interface HomeTabsProps {
  selectedInterest: string | null;
}

const sortOptions = {
  recommended: "Recommended",
  recent: "Most Recent",
  nearby: "Nearby"
};

const HomeTabs = ({ selectedInterest }: HomeTabsProps) => {
  const [sortBy, setSortBy] = useState<keyof typeof sortOptions>("recommended");

  return (
    <Tabs defaultValue="people" className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 md:px-0">
        <TabsList className="bg-transparent p-0">
          {tabs.map(tab => (
             <TabsTrigger key={tab.value} value={tab.value} className="gap-2 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
               <tab.icon className="h-4 w-4"/>
               {tab.label}
             </TabsTrigger>
          ))}
        </TabsList>
        <div className="w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[180px] justify-start">
                <ArrowUpAZ className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{sortOptions[sortBy]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as keyof typeof sortOptions)}>
                <DropdownMenuRadioItem value="recommended">Recommended</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="recent">Most Recent</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nearby">Nearby</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent value="people" className="mt-4">
        <FeedList selectedInterest={selectedInterest} />
      </TabsContent>
      <TabsContent value="nearby" className="mt-4 px-4 md:px-0">
        <NearbyTab />
      </TabsContent>
      {tabs.filter(t => t.value !== 'people' && t.value !== 'nearby').map(tab => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4 px-4 md:px-0">
           {
             tab.value === 'live' ? <LiveUsersTab /> :
             tab.value === 'events' ? <EventsList /> : 
             tab.value === 'groups' ? <GroupsPage /> : 
             tab.value === 'matches' ? <MatchesList /> : 
             <PlaceholderContent tab={tab.label} />
           }
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default HomeTabs;
