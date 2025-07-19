
import HomeTabs from "@/components/home/HomeTabs";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import TrendingChannels from "@/components/home/TrendingChannels";
import { MatchesList } from "@/components/matches/MatchesList";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <WelcomeBanner />
        
        {/* Matches Section */}
        <div className="mb-6">
          <div className="px-4 md:px-0 mb-4">
            <h2 className="text-xl font-bold">Your Matches</h2>
            <p className="text-muted-foreground text-sm">
              People with high compatibility based on your interests and personality
            </p>
          </div>
          <MatchesList />
        </div>
        
        <TrendingChannels />
        <HomeTabs selectedInterest={null} />
      </div>
    </div>
  );
};

export default HomePage;
