
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { UserX } from 'lucide-react';

const BlockedUsersSettingsPage = () => {
  const { blockedUsers, isLoading, unblockUser, isUnblocking } = useBlockedUsers();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>
            Manage users you have blocked. Blocked users cannot contact you or see your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked Users</CardTitle>
        <CardDescription>
          Manage users you have blocked. Blocked users cannot contact you or see your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!blockedUsers || blockedUsers.length === 0 ? (
          <div className="text-center py-8">
            <UserX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No blocked users</p>
            <p className="text-sm text-muted-foreground mt-1">
              Users you block will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url ?? ""} alt={user.username || 'User'} />
                    <AvatarFallback>
                      {(user.username || user.full_name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">
                      {user.full_name || `@${user.username}`}
                    </span>
                    {user.full_name && user.username && (
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => unblockUser(user.id)}
                  disabled={isUnblocking}
                >
                  {isUnblocking ? 'Unblocking...' : 'Unblock'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockedUsersSettingsPage;
