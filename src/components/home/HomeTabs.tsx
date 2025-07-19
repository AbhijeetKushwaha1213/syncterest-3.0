
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventsList from "@/components/events/EventsList";
import GroupsPage from "@/pages/GroupsPage";
import { MatchesList } from "@/components/matches/MatchesList";
import NearbyTab from "@/components/nearby/NearbyTab";
import LiveUsersTab from "@/components/live/LiveUsersTab";
import FeedList from "@/components/feed/FeedList";
import { useState } from "react";
import {
  BookOpen, MapPin, Wifi, CalendarDays, Star, UserCog,
} from "lucide-react";

const tabs = [
  { value: "feed", label: "Feed", icon: BookOpen },
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
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 md:px-0">
        <div className="relative">
          <TabsList className="bg-transparent p-0 relative">
            {tabs.map(tab => (
               <TabsTrigger 
                 key={tab.value} 
                 value={tab.value} 
                 className="gap-2 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none relative z-10 transition-all duration-300 hover:scale-105"
               >
                 <tab.icon className="h-4 w-4"/>
                 {tab.label}
               </TabsTrigger>
            ))}
          </TabsList>
          {/* Sliding pill indicator */}
          <div 
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
            style={{
              left: `${tabs.findIndex(tab => tab.value === activeTab) * (100 / tabs.length)}%`,
              width: `${100 / tabs.length}%`
            }}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <TabsContent value="feed" className="animate-fade-in">
          <FeedList selectedInterest={selectedInterest} />
        </TabsContent>
        <TabsContent value="nearby" className="px-4 md:px-0 animate-fade-in">
          <NearbyTab />
        </TabsContent>
        {tabs.filter(t => t.value !== 'feed' && t.value !== 'nearby').map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="px-4 md:px-0 animate-fade-in">
             {
               tab.value === 'live' ? <LiveUsersTab /> :
               tab.value === 'events' ? <EventsList /> : 
               tab.value === 'groups' ? <GroupsPage /> : 
               tab.value === 'matches' ? <MatchesList /> : 
               <PlaceholderContent tab={tab.label} />
             }
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default HomeTabs;
