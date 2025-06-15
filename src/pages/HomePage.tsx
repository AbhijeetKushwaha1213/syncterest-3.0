
import { useState } from "react";
import PeopleNearYou from "@/components/PeopleNearYou";
import StoriesList from "@/components/stories/StoriesList";
import { useAuth } from "@/hooks/useAuth";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import InterestsFilter from "@/components/home/InterestsFilter";
import HomeTabs from "@/components/home/HomeTabs";
import TrendingPeople from "@/components/home/TrendingPeople";

const HomePage = () => {
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const { profile: currentUserProfile } = useAuth();

  const handleInterestClick = (interest: string) => {
    setSelectedInterest(prev => prev === interest ? null : interest);
  };

  return (
    <div className="p-4 sm:p-6 grid lg:grid-cols-[1fr_350px] gap-6 md:gap-8">
      <div className="flex flex-col gap-6">
        {currentUserProfile && (
          <WelcomeBanner currentUserProfile={currentUserProfile} />
        )}
        <TrendingPeople />
        <StoriesList />
        <InterestsFilter 
          selectedInterest={selectedInterest} 
          onInterestClick={handleInterestClick} 
        />
        <HomeTabs selectedInterest={selectedInterest} />
      </div>
      
      <div className="space-y-6 hidden lg:block">
        <PeopleNearYou />
      </div>
    </div>
  );
};

export default HomePage;
