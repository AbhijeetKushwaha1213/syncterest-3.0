
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

const HomePage = () => {
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const { profile: currentUserProfile, loading } = useAuth();
  const { rightSidebarCollapsed, toggleRightSidebar } = useSidebar();

  const handleInterestClick = (interest: string) => {
    setSelectedInterest(prev => prev === interest ? null : interest);
  };

  // Show loading state while auth is being resolved
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 grid gap-6 md:gap-8 transition-all duration-300 ${
      rightSidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_350px]'
    }`}>
      <div className="flex flex-col gap-6">
        {currentUserProfile && (
          <WelcomeBanner currentUserProfile={currentUserProfile} />
        )}
        <StoriesList />
        <InterestsFilter 
          selectedInterest={selectedInterest} 
          onInterestClick={handleInterestClick} 
        />
        <HomeTabs selectedInterest={selectedInterest} />
      </div>
      
      {!rightSidebarCollapsed && (
        <div className="space-y-6 hidden lg:block">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sidebar</h2>
            <Button variant="ghost" size="sm" onClick={toggleRightSidebar}>
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>
          <PeopleNearYou />
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
  );
};

export default HomePage;
