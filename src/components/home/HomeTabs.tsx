
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventsList from "@/components/events/EventsList";
import GroupsPage from "@/components/groups/GroupsPage";
import MatchesList from "@/components/matches/MatchesList";
import NearbyTab from "@/components/nearby/NearbyTab";
import LiveUsersTab from "@/components/live/LiveUsersTab";
import FeedList from "@/components/feed/FeedList";
import {
  Users, MapPin, Wifi, CalendarDays, Star, UserCog,
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

const HomeTabs = ({ selectedInterest }: HomeTabsProps) => {
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
