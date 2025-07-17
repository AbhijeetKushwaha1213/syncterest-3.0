
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventsList from "@/components/events/EventsList";
import GroupsPage from "@/components/groups/GroupsPage";
import { LiveUsersTab } from "@/components/live/LiveUsersTab";
import { NearbyTab } from "@/components/nearby/NearbyTab";
import MatchesList from "@/components/matches/MatchesList";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Hash } from "lucide-react";

interface HomeTabsProps {
  selectedInterest: string | null;
}

const HomeTabs = ({ selectedInterest }: HomeTabsProps) => {
  const [activeTab, setActiveTab] = useState("live");
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Open Chat
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/channels")}
          className="flex items-center gap-2"
        >
          <Hash className="h-4 w-4" />
          Browse Channels
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="space-y-4">
          <LiveUsersTab selectedInterest={selectedInterest} />
        </TabsContent>
        
        <TabsContent value="nearby" className="space-y-4">
          <NearbyTab selectedInterest={selectedInterest} />
        </TabsContent>
        
        <TabsContent value="matches" className="space-y-4">
          <MatchesList />
        </TabsContent>
        
        <TabsContent value="groups" className="space-y-4">
          <GroupsPage />
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <EventsList selectedInterest={selectedInterest} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeTabs;
