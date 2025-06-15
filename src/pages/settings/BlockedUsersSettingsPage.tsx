
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const BlockedUsersSettingsPage = () => {
  const { blockedUsers, isLoading, unblockUser, isUnblocking } = useBlockedUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocked Users</CardTitle>
        <CardDescription>
          Manage users you have blocked. Once you unblock someone, you will be able to see their content and they will be able to interact with you again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !blockedUsers || blockedUsers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>You haven't blocked any users.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedUsers.map((blockedUser) => (
                <TableRow key={blockedUser.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={blockedUser.avatar_url || undefined} alt={blockedUser.username || 'avatar'} />
                        <AvatarFallback>{(blockedUser.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{blockedUser.full_name || blockedUser.username}</p>
                        <p className="text-sm text-muted-foreground">@{blockedUser.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => unblockUser(blockedUser.id)}
                      disabled={isUnblocking}
                    >
                      Unblock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockedUsersSettingsPage;
