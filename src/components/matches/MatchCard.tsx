
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MatchCardProps {
  profile: Profile & { compatibility_score: number };
}

const MatchCard = ({ profile }: MatchCardProps) => {
  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-blue-500";
    if (score >= 0.4) return "bg-purple-500";
    return "bg-gray-500";
  };

  const getMatchingCategory = () => {
    const categories = [
      "Ideal weekend plans",
      "Best way to unwind",
      "Perfect date idea",
      "Life philosophy",
      "Career goals"
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const getMatchingDescription = () => {
    const descriptions = [
      "You both like spending the weekend lost in a new book or a hiking trail.",
      "Both prefer quiet evenings at home with good music and meaningful conversations.",
      "You share similar values about work-life balance and personal growth.",
      "Both enjoy exploring new places and trying different cuisines.",
      "You both value deep connections and authentic relationships."
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const isActive = profile.show_activity_status && profile.last_active_at && 
    new Date(profile.last_active_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  const personalityType = profile.personality_tags?.[0] || "ISFP";
  const age = 25; // Since we don't have age in the profile, using a default

  return (
    <Card className="w-80 flex-shrink-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        <Badge 
          className={`absolute top-3 left-3 z-10 ${getCompatibilityColor(profile.compatibility_score)} text-white`}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          {Math.round(profile.compatibility_score * 100)}% Match
        </Badge>
        
        <Link to={`/profile/${profile.id}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}`} 
                  alt={profile.full_name || profile.username || 'user'} 
                />
                <AvatarFallback>
                  {(profile.full_name || profile.username || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">
                    {profile.full_name || profile.username}
                  </h3>
                  <span className="text-muted-foreground">{age}</span>
                </div>
                
                {profile.location_city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{profile.location_city}</span>
                  </div>
                )}
                
                <Badge variant="outline" className="text-xs">
                  {personalityType}
                </Badge>
                
                {isActive && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>Active today</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                {getMatchingCategory()}
              </h4>
              <p className="text-sm font-semibold text-pink-600">
                {getMatchingDescription()}
              </p>
            </div>
          </CardContent>
        </Link>
      </div>
    </Card>
  );
};

export default MatchCard;
