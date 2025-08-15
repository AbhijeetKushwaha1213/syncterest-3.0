import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLiveUsers } from "@/hooks/useLiveUsers";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { InterestsFilter } from "@/components/home/InterestsFilter";
import { LiveUsersTab } from "@/components/live/LiveUsersTab";
import { NearbyTab } from "@/components/home/NearbyTab";
import LoadingBoundary from "@/components/LoadingBoundary";

interface HomePageProps {}

const HomePageSkeleton = () => (
  <div className="flex flex-col gap-4 p-4">
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-12 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

const HomePage = () => {
  const { user } = useAuth();
  const { 
    users: liveUsers, 
    isLoading, 
    error, 
    myStatus, 
    setMyStatus 
  } = useLiveUsers();
  const { 
    users: nearbyUsers, 
    isLoading: nearbyUsersLoading, 
    error: nearbyUsersError 
  } = useNearbyUsers();
  const [activeTab, setActiveTab] = useState("live");
  const [selectedInterest, setSelectedInterest] = useState("All");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">Welcome, {user?.email}!</h1>
      </header>

      <div className="bg-muted/50 p-4">
        <InterestsFilter 
          selectedInterest={selectedInterest}
          onInterestChange={setSelectedInterest}
        />
      </div>
      
      <main className="flex-1 overflow-hidden">
        <LoadingBoundary
          isLoading={isLoading}
          loadingComponent={<HomePageSkeleton />}
          errorComponent={<div className="text-center text-muted-foreground p-8">Error loading content</div>}
        >
          <div className="h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="flex">
                <TabsTrigger value="live" className="flex-1">Live Users</TabsTrigger>
                <TabsTrigger value="nearby" className="flex-1">Nearby</TabsTrigger>
              </TabsList>
              
              <TabsContent value="live" className="flex-1 mt-0">
                <LiveUsersTab 
                  myStatus={myStatus} 
                  onStatusChange={setMyStatus}
                />
              </TabsContent>

              <TabsContent value="nearby" className="flex-1 mt-0 p-4">
                <NearbyTab />
              </TabsContent>
            </Tabs>
          </div>
        </LoadingBoundary>
      </main>
    </div>
  );
};

export default HomePage;

