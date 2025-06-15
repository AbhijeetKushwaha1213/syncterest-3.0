
import { ProfileWithDetails } from "@/api/profiles";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface InterestsSectionProps {
  profile: ProfileWithDetails;
  isOwnProfile: boolean;
}

export const InterestsSection = ({ profile, isOwnProfile }: InterestsSectionProps) => {
  return (
    <div className="my-8">
      <h3 className="font-semibold text-lg text-center mb-4 uppercase text-muted-foreground tracking-wider">Interests</h3>
      <div className="flex flex-wrap gap-3 justify-center items-center">
        {profile.interests?.length > 0 ? profile.interests.map((interest) => (
          <div key={interest} className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full">{interest}</div>
        )) : (
          !isOwnProfile && <p className="text-muted-foreground text-sm">No interests listed.</p>
        )}
        
        {isOwnProfile && (
            <Link to="/settings/account">
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Edit Interests">
                <Edit className="h-5 w-5" />
              </Button>
            </Link>
        )}
      </div>
    </div>
  );
};
