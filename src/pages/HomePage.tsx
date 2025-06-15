import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import StoriesList from "@/components/stories/StoriesList";
import GroupsPage from "@/components/groups/GroupsPage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Toggle } from "@/components/ui/toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import MatchesList from "@/components/matches/MatchesList";
import NearbyTab from "@/components/nearby/NearbyTab";
import LiveUsersTab from "@/components/live/LiveUsersTab";
import { useAuth } from "@/hooks/useAuth";
import UserCard from "@/components/UserCard";

type Profile = Database['public']['Tables']['profiles']['Row'];

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
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const { profile: currentUserProfile } = useAuth();

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles', selectedInterest],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*').not('username', 'is', null);

      if (selectedInterest) {
        query = query.contains('interests', [selectedInterest]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const handleInterestClick = (interest: string) => {
    setSelectedInterest(prev => prev === interest ? null : interest);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_350px] gap-6 md:gap-8">
      <div className="flex flex-col gap-6">
        {currentUserProfile && (
            <Card className="bg-gradient-to-r from-primary to-purple-600 border-none text-primary-foreground">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold">Welcome back, {currentUserProfile.full_name || currentUserProfile.username}!</h1>
                <p className="opacity-80 mt-1">Ready to meet, create, and connect? Explore people and events happening around you.</p>
              </CardContent>
            </Card>
        )}
        <StoriesList />

        <div className="space-y-3 px-4 md:px-0">
            <h2 className="text-lg font-semibold">Interests</h2>
            <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                    <Toggle
                        key={interest.name}
                        pressed={selectedInterest === interest.name}
                        onPressedChange={() => handleInterestClick(interest.name)}
                        variant="outline"
                        className="gap-2 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-muted/80"
                    >
                        <interest.icon className="h-4 w-4" />
                        {interest.name}
                    </Toggle>
                ))}
            </div>
        </div>
        
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
            {isLoadingProfiles && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-auto aspect-[3/4] w-full" />)}
              </div>
            )}
            {!isLoadingProfiles && profiles && profiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
                {profiles.map(profile => (
                  <UserCard key={profile.id} profile={profile} />
                ))}
              </div>
            )}
            {!isLoadingProfiles && (!profiles || profiles.length === 0) && (
              <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg mt-4">
                <p className="text-muted-foreground">No profiles found for this interest.</p>
              </div>
            )}
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

      </div>
      
      <div className="space-y-6 hidden lg:block">
        <PeopleNearYou />
      </div>

    </div>
  );
};

export default HomePage;
