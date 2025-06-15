
import { ProfileWithDetails } from "@/api/profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface InterestsSectionProps {
  profile: ProfileWithDetails;
  isOwnProfile: boolean;
}

export const InterestsSection = ({ profile, isOwnProfile }: InterestsSectionProps) => {
  const groupedInterests: Record<string, Record<string, string[]>> = (profile.interests || [])
    .reduce(
      (acc: Record<string, Record<string, string[]>>, interestString: string) => {
        const parts = interestString.split(':');
        if (parts.length < 2) return acc;

        const mainCategory = parts[0];
        // Handle both new format (Main:Sub:Value) and old format (Main:Value)
        const subCategory = parts.length > 2 ? parts[1] : 'General';
        const value = parts.length > 2 ? parts.slice(2).join(':') : parts.slice(1).join(':');
        
        if (!value.trim()) return acc; // Don't show empty values

        if (!acc[mainCategory]) {
          acc[mainCategory] = {};
        }
        if (!acc[mainCategory][subCategory]) {
          acc[mainCategory][subCategory] = [];
        }
        acc[mainCategory][subCategory].push(value);
        return acc;
      },
      {}
    );

  const hasInterests = Object.keys(groupedInterests).length > 0;

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg uppercase text-muted-foreground tracking-wider">Interests</h3>
        {isOwnProfile && (
          <Link to="/settings/account">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Edit Interests">
              <Edit className="h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>

      {hasInterests ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedInterests).map(([mainCategory, subGroups]) => (
            <Card key={mainCategory}>
              <CardHeader className="p-4">
                <CardTitle className="text-base">{mainCategory}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {Object.entries(subGroups).map(([subCategory, values]) => (
                   <div key={subCategory}>
                     {subCategory !== 'General' && <p className="text-sm font-medium text-muted-foreground mb-1">{subCategory}</p>}
                     <div className="flex flex-wrap gap-2">
                       {values.map((value, index) => (
                         <div key={index} className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full">
                           {value}
                         </div>
                       ))}
                     </div>
                   </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          {isOwnProfile ? (
            <>
              <p className="text-muted-foreground text-sm">You haven't added any interests yet.</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/settings/account">Add interests to connect!</Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No interests listed.</p>
          )}
        </div>
      )}
    </div>
  );
};
