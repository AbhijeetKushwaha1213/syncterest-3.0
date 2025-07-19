
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface MatchCardProps {
  profile: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    age?: number;
    location_city?: string;
    personality_tags?: string[];
    last_active_at?: string;
  };
  matchScore: number;
  matchingCategory: string;
  matchingDescription: string;
}

export const MatchCard = ({ 
  profile, 
  matchScore, 
  matchingCategory, 
  matchingDescription 
}: MatchCardProps) => {
  const isActive = profile.last_active_at && 
    (new Date().getTime() - new Date(profile.last_active_at).getTime()) < 24 * 60 * 60 * 1000;

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const mbtiType = profile.personality_tags?.[0] || "XXXX";

  return (
    <Card className="w-80 flex-shrink-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <Link to={`/profile/${profile.id}`} className="block h-full">
        <div className="relative">
          <Badge 
            className={`absolute top-3 left-3 z-10 text-white ${getMatchScoreColor(matchScore)}`}
          >
            {matchScore}% Match
          </Badge>
          
          <div className="h-64 bg-gradient-to-b from-transparent to-black/60 relative">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage 
                src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}`}
                alt={profile.full_name || profile.username || 'user'}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <AvatarFallback className="rounded-none text-4xl w-full h-full">
                {(profile.full_name || profile.username || 'U').charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">
                {profile.full_name || profile.username}
                {profile.age && <span className="text-muted-foreground">, {profile.age}</span>}
              </h3>
              
              {profile.location_city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.location_city}</span>
                </div>
              )}
            </div>
            
            <Badge variant="outline" className="text-xs">
              {mbtiType}
            </Badge>
          </div>

          {isActive && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Active today</span>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {matchingCategory}
            </h4>
            <p className="text-sm font-semibold text-pink-600">
              {matchingDescription}
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
