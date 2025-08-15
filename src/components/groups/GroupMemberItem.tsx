
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';

const GroupMemberItem = ({ userId }: { userId: string }) => {
    const { data: profile, isLoading } = useProfile(userId);

    if (isLoading) {
        return (
            <div className="p-2 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <Link to={`/profile/${profile.id}`} className="block hover:bg-muted/50 transition-colors rounded-lg">
            <div className="p-2 flex items-center gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url ?? ""} alt={profile.username ?? "avatar"} />
                    <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{profile.username}</p>
                </div>
            </div>
        </Link>
    );
};

export default GroupMemberItem;
