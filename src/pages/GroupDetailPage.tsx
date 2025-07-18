
import { useParams } from 'react-router-dom';
import { useGroup } from '@/hooks/useGroup';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Image, AlertTriangle } from 'lucide-react';
import GroupMemberItem from '@/components/groups/GroupMemberItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const GroupDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { data: group, isLoading: isLoadingGroup, error: groupError } = useGroup(id);
    const { data: members, isLoading: isLoadingMembers, error: membersError } = useGroupMembers(id);
    const { isMember, isLoadingMembership, joinOrLeave, isJoiningOrLeaving } = useGroupMembership(id);

    const isLoading = isLoadingGroup || isLoadingMembers;
    const hasError = groupError || membersError;

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <Skeleton className="h-12 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-80 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Unable to load group</h2>
                    <p className="text-muted-foreground">
                        There was an error loading the group details. Please try refreshing the page.
                    </p>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Group not found</h2>
                    <p className="text-muted-foreground">
                        The group you're looking for doesn't exist or may have been removed.
                    </p>
                </div>
            </div>
        );
    }

    const isCreator = user?.id === group.created_by;

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <div className="mb-8">
                {group.image_url ? (
                    <img src={group.image_url} alt={group.name} className="w-full h-64 object-cover rounded-lg mb-4" />
                ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                        <Image className="h-24 w-24 text-muted-foreground" />
                    </div>
                )}
                <h1 className="text-4xl font-bold tracking-tight">{group.name}</h1>
                <p className="text-muted-foreground mt-2">{group.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Group activity feed will be shown here.</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Users className="h-5 w-5 mr-2" />
                                    Members ({members?.length ?? 0})
                                </span>
                                {!isCreator && (
                                     <Button
                                        variant={isMember ? "outline" : "default"}
                                        onClick={() => joinOrLeave()}
                                        disabled={isLoadingMembership || isJoiningOrLeaving}
                                        size="sm"
                                    >
                                        {isMember ? "Leave" : "Join"}
                                    </Button>
                                )}
                                {isCreator && <span className="text-xs font-semibold text-muted-foreground bg-accent text-accent-foreground px-2 py-1 rounded-md">CREATOR</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                             {members && members.length > 0 ? (
                                members.map(member => <GroupMemberItem key={member.user_id} userId={member.user_id} />)
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">No members yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailPage;
