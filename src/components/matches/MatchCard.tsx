
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
    if (score >= 0.9) return "bg-green-500 text-white";
    if (score >= 0.8) return "bg-blue-500 text-white";
    if (score >= 0.6) return "bg-purple-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getMatchingCategory = () => {
    const categories = [
      "Ideal weekend plans",
      "Best way to unwind",
      "Perfect date idea",
      "Life philosophy",
      "Career goals",
      "Travel preferences",
      "Communication style"
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  };

  const getMatchingDescription = () => {
    const descriptions = [
      "You both like spending the weekend lost in a new book or a hiking trail.",
      "Both prefer quiet evenings at home with good music and meaningful conversations.",
      "You share similar values about work-life balance and personal growth.",
      "Both enjoy exploring new places and trying different cuisines.",
      "You both value deep connections and authentic relationships.",
      "Similar approach to handling life's challenges with optimism.",
      "You both appreciate art, culture, and intellectual discussions."
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const isActive = profile.show_activity_status && profile.last_active_at && 
    new Date(profile.last_active_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  const personalityType = profile.personality_tags?.[0] || "ISFP";
  const age = 25; // Since we don't have age in the profile, using a default
  const matchScore = Math.round(profile.compatibility_score * 100);

  return (
    <Link to={`/profile/${profile.id}`}>
      <Card className="w-80 flex-shrink-0 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] border-0 shadow-lg">
        <div className="relative">
          {/* Match Score Badge */}
          <Badge 
            className={`absolute top-4 left-4 z-10 ${getCompatibilityColor(profile.compatibility_score)} font-semibold text-sm px-3 py-1 shadow-lg`}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {matchScore}% Match
          </Badge>
          
          <CardContent className="p-6 space-y-4">
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}`} 
                  alt={profile.full_name || profile.username || 'user'} 
                />
                <AvatarFallback className="text-lg font-bold">
                  {(profile.full_name || profile.username || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                {/* Name and Age */}
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-gray-900">
                    {profile.full_name || profile.username}
                  </h3>
                  <span className="text-lg text-gray-600 font-medium">{age}</span>
                </div>
                
                {/* Location */}
                {profile.location_city && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{profile.location_city}</span>
                  </div>
                )}
                
                {/* MBTI Badge */}
                <Badge variant="outline" className="font-semibold text-xs px-2 py-1 border-gray-300">
                  {personalityType}
                </Badge>
                
                {/* Active Status */}
                {isActive && (
                  <div className="flex items-center gap-1 text-green-600">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Active today</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Matching Information */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-semibold text-sm text-gray-700">
                {getMatchingCategory()}
              </h4>
              <p className="text-sm font-bold text-pink-600 leading-relaxed">
                {getMatchingDescription()}
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
};

export default MatchCard;
