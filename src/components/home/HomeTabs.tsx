
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeedList from "@/components/feed/FeedList";
import EventsList from "@/components/events/EventsList";
import LiveUsersTab from "@/components/live/LiveUsersTab";
import NearbyTab from "@/components/nearby/NearbyTab";

interface HomeTabsProps {
  selectedInterest: string | null;
}

const HomeTabs = ({ selectedInterest }: HomeTabsProps) => {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="space-y-4">
          <FeedList selectedInterest={selectedInterest} />
        </TabsContent>
        
        <TabsContent value="live" className="space-y-4">
          <LiveUsersTab />
        </TabsContent>
        
        <TabsContent value="nearby" className="space-y-4">
          <NearbyTab />
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <EventsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeTabs;
