
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeedList from "@/components/feed/FeedList";
import GroupsPage from "@/components/groups/GroupsPage";
import LiveUsersTab from "@/components/live/LiveUsersTab";
import NearbyTab from "@/components/nearby/NearbyTab";
import MatchesList from "@/components/matches/MatchesList";

interface HomeTabsProps {
  selectedInterest: string | null;
}

const HomeTabs = ({ selectedInterest }: HomeTabsProps) => {
  return (
    <Tabs defaultValue="feed" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="feed">Feed</TabsTrigger>
        <TabsTrigger value="groups">Groups</TabsTrigger>
        <TabsTrigger value="live">Live</TabsTrigger>
        <TabsTrigger value="nearby">Nearby</TabsTrigger>
        <TabsTrigger value="matches">Matches</TabsTrigger>
      </TabsList>
      
      <TabsContent value="feed" className="space-y-4">
        <FeedList selectedInterest={selectedInterest} />
      </TabsContent>
      
      <TabsContent value="groups" className="space-y-4">
        <GroupsPage />
      </TabsContent>
      
      <TabsContent value="live" className="space-y-4">
        <LiveUsersTab />
      </TabsContent>
      
      <TabsContent value="nearby" className="space-y-4">
        <NearbyTab />
      </TabsContent>
      
      <TabsContent value="matches" className="space-y-4">
        <MatchesList />
      </TabsContent>
    </Tabs>
  );
};

export default HomeTabs;
