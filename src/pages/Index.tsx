
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import UserCard from "@/components/UserCard";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const interestTags = [
  { name: "Gaming", color: "from-purple-500 to-indigo-600" },
  { name: "Hiking", color: "from-green-500 to-teal-600" },
  { name: "Art", color: "from-pink-500 to-rose-600" },
  { name: "Coding", color: "from-blue-500 to-cyan-600" },
  { name: "Music", color: "from-yellow-500 to-orange-600" },
  { name: "Photography", color: "from-gray-500 to-slate-600" },
  { name: "Cooking", color: "from-red-500 to-orange-600" },
  { name: "Fitness", color: "from-emerald-500 to-green-600" },
];

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [hoveredText, setHoveredText] = useState({ x: 0, y: 0, visible: false });

  // Sample profiles query for demonstration
  const { data: sampleProfiles } = useQuery<Profile[]>({
    queryKey: ["sample_profiles", selectedInterest],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .not("username", "is", null)
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedInterest,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredText({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setHoveredText(prev => ({ ...prev, visible: false }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 animate-gradient-xy"></div>
      
      <header className="px-4 lg:px-6 h-14 flex items-center relative z-10">
        <Link to="/" className="flex items-center justify-center">
          <span className="text-xl font-bold">syncterest</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            to="/login"
            className="text-sm font-medium hover:underline underline-offset-4 transition-all duration-300"
          >
            Login
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="transition-all duration-300 hover:scale-105">Sign Up</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        <section className="w-full py-20 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-2">
                {/* Interactive headline with spotlight effect */}
                <div
                  className="relative inline-block cursor-pointer"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none relative">
                    Meet. Create. Connect.
                  </h1>
                  {hoveredText.visible && (
                    <div
                      className="absolute pointer-events-none rounded-full bg-primary/20 blur-xl transition-all duration-200"
                      style={{
                        left: hoveredText.x - 50,
                        top: hoveredText.y - 50,
                        width: 100,
                        height: 100,
                      }}
                    />
                  )}
                </div>
                {/* Animated sub-headline */}
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  <span className="inline-block animate-fade-in-words">
                    syncterest helps you find people nearby to play sports, discuss ideas, or build something amazing together. Ditch the endless scrolling and start making real connections.
                  </span>
                </p>
              </div>
              <div className="space-x-4">
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced "Find Your Crew" section */}
        <section 
          className="w-full py-12 md:py-24 lg:py-32 transition-colors duration-700"
          style={{
            backgroundColor: selectedInterest 
              ? `hsl(var(--${selectedInterest.toLowerCase()}-color, var(--muted)))` 
              : 'hsl(var(--muted))'
          }}
        >
          <div className="container grid items-center justify-center gap-8 px-4 text-center md:px-6">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Find Your Crew
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Whatever your passion, find others who share it. From pickup basketball games to collaborative art projects, your next adventure is just a connection away.
              </p>
              
              {/* Interactive interest tags marquee */}
              <div className="relative overflow-hidden py-8">
                <div className="flex animate-marquee space-x-4 hover:[animation-play-state:paused]">
                  {[...interestTags, ...interestTags].map((tag, index) => (
                    <button
                      key={`${tag.name}-${index}`}
                      onClick={() => setSelectedInterest(selectedInterest === tag.name ? null : tag.name)}
                      className={`
                        flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg
                        ${selectedInterest === tag.name 
                          ? `bg-gradient-to-r ${tag.color} text-white shadow-lg` 
                          : 'bg-background/80 text-foreground hover:bg-background'
                        }
                      `}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample user cards */}
              {selectedInterest && sampleProfiles && sampleProfiles.length > 0 && (
                <div className="mt-12 animate-fade-in">
                  <h3 className="text-xl font-semibold mb-6">
                    People interested in {selectedInterest}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
                    {sampleProfiles.slice(0, 6).map((profile, index) => (
                      <div 
                        key={profile.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <UserCard profile={profile} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t relative z-10">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} syncterest. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link to="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Index;
