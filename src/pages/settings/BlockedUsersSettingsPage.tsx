
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const BlockedUsersSettingsPage = () => {
  // Mock data - in real app this would come from a hook
  const blockedUsers = [
    { id: '1', username: 'user1', avatar_url: null },
    { id: '2', username: 'user2', avatar_url: null },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked Users</CardTitle>
        <CardDescription>
          Manage users you have blocked. Blocked users cannot contact you or see your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {blockedUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No blocked users</p>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url ?? ""} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">@{user.username}</span>
                </div>
                <Button variant="outline" size="sm">
                  Unblock
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
