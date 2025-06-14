
import { ProfileWithDetails } from "@/api/profiles";

interface ProfileBioProps {
  profile: ProfileWithDetails;
}

export const ProfileBio = ({ profile }: ProfileBioProps) => (
  <div className="mb-8 text-center md:text-left">
    {profile.full_name && <h2 className="font-semibold text-lg">{profile.full_name}</h2>}
    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{profile.bio || "No bio provided."}</p>
  </div>
);
