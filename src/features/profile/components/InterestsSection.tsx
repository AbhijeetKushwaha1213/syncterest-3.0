
import { ProfileWithDetails } from "@/api/profiles";

interface InterestsSectionProps {
  profile: ProfileWithDetails;
}

export const InterestsSection = ({ profile }: InterestsSectionProps) => (
  <div className="my-8">
    <h3 className="font-semibold text-lg text-center mb-4 uppercase text-muted-foreground tracking-wider">Interests</h3>
    <div className="flex flex-wrap gap-3 justify-center">
      {profile.interests?.length > 0 ? profile.interests.map((interest) => (
        <div key={interest} className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">{interest}</div>
      )) : <p className="text-muted-foreground text-sm">No interests listed.</p>}
    </div>
  </div>
);
