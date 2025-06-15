
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfileData, ProfileWithDetails } from "@/api/profiles";
import { UserProfileSkeleton } from "@/features/profile/components/UserProfileSkeleton";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { StoryHighlights } from "@/features/profile/components/StoryHighlights";
import { ProfileTabs } from "@/features/profile/components/ProfileTabs";
import { InterestsSection } from "@/features/profile/components/InterestsSection";
import { EditProfileDialog } from "@/features/profile/components/EditProfileDialog";

const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", id, user?.id],
    queryFn: (): Promise<ProfileWithDetails | null> => fetchProfileData(id!, user?.id),
    enabled: !!id,
  });

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (error) {
    return <p className="p-4 text-destructive">Error loading profile: {error.message}</p>;
  }

  if (!profile) {
    return (
       <div className="p-4 md:p-6 text-center">
         <p>Profile not found.</p>
         <Button asChild variant="link" className="mt-4">
           <Link to="/home"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
         </Button>
       </div>
    );
  }
  
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-6">
            <Button asChild variant="ghost" className="-ml-4">
                <Link to="/home"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
            </Button>
            {isOwnProfile && (
                <EditProfileDialog profile={profile}>
                    <Button variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile Details
                    </Button>
                </EditProfileDialog>
            )}
       </div>
       
       <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

       <StoryHighlights profile={profile} />
       
       <InterestsSection profile={profile} isOwnProfile={isOwnProfile} />
       
       <ProfileTabs profile={profile} isOwnProfile={isOwnProfile} />
    </div>
  );
};

export default UserProfilePage;
