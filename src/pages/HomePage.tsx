
import { useState } from "react";
import PeopleNearYou from "@/components/PeopleNearYou";
import StoriesList from "@/components/stories/StoriesList";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import InterestsFilter from "@/components/home/InterestsFilter";
import HomeTabs from "@/components/home/HomeTabs";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import LoadingBoundary from "@/components/LoadingBoundary";
import { Skeleton } from "@/components/ui/skeleton";

const HomePageSkeleton = () => (
  <div className="p-4 sm:p-6 space-y-6">
    <Skeleton className="h-20 w-full" />
    <div className="flex gap-4 overflow-x-auto">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-16 rounded-full flex-shrink-0" />
      ))}
    </div>
    <div className="flex gap-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  </div>
);

const HomePage = () => {
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const { profile: currentUserProfile, loading } = useAuth();
  const { rightSidebarCollapsed, toggleRightSidebar } = useSidebar();

  const handleInterestClick = (interest: string) => {
    setSelectedInterest(prev => prev === interest ? null : interest);
  };

  return (
    <LoadingBoundary
      isLoading={loading}
      loadingComponent={<HomePageSkeleton />}
    >
      <div className={`p-4 sm:p-6 grid gap-6 md:gap-8 transition-all duration-300 ${
        rightSidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_350px]'
      }`}>
        <div className="flex flex-col gap-6">
          {currentUserProfile && (
            <SectionErrorBoundary sectionName="Welcome Banner">
              <WelcomeBanner currentUserProfile={currentUserProfile} />
            </SectionErrorBoundary>
          )}
          
          <SectionErrorBoundary sectionName="Stories">
            <StoriesList />
          </SectionErrorBoundary>
          
          <SectionErrorBoundary sectionName="Interests Filter">
            <InterestsFilter 
              selectedInterest={selectedInterest} 
              onInterestClick={handleInterestClick} 
            />
          </SectionErrorBoundary>
          
          <SectionErrorBoundary sectionName="Content Tabs">
            <HomeTabs selectedInterest={selectedInterest} />
          </SectionErrorBoundary>
        </div>
        
        {!rightSidebarCollapsed && (
          <div className="space-y-6 hidden lg:block">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sidebar</h2>
              <Button variant="ghost" size="sm" onClick={toggleRightSidebar}>
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <SectionErrorBoundary sectionName="People Nearby">
              <PeopleNearYou />
            </SectionErrorBoundary>
          </div>
        )}
        
        {rightSidebarCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRightSidebar}
            className="fixed top-20 right-4 z-10 lg:block hidden"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        )}
      </div>
    </LoadingBoundary>
  );
};

export default HomePage;
