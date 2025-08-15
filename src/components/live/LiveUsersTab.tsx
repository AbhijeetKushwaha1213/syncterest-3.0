import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers, fetchNearbyUsers, User } from '@/api/users';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import LoadingBoundary from '@/components/LoadingBoundary';

interface LiveUsersTabProps {
  myStatus: string;
  onStatusChange: (status: string) => void;
}

interface UserStatusCardProps {
  user: User;
}

const UserStatusCard: React.FC<UserStatusCardProps> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{user.status}</p>
      </CardContent>
    </Card>
  );
};

const UserStatusCardSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-32" />
    </CardContent>
  </Card>
);

const LiveUsersTab = ({ myStatus, onStatusChange }: LiveUsersTabProps) => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: nearbyUsers, isLoading: nearbyUsersLoading, error: nearbyUsersError } = useQuery({
    queryKey: ['nearbyUsers'],
    queryFn: fetchNearbyUsers,
  });

  const handleStatusChange = (status: string) => {
    onStatusChange(status);
  };

  const filteredUsers = users
    ?.filter((user) => user.status === selectedFilter || selectedFilter === 'All')
    ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Users</h2>
        <Select value={myStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Set Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Online">Online</SelectItem>
            <SelectItem value="Away">Away</SelectItem>
            <SelectItem value="Busy">Busy</SelectItem>
            <SelectItem value="Offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Filter by Status</h3>
        <div className="flex space-x-2 mt-2">
          {['All', 'Online', 'Away', 'Busy', 'Offline'].map((status) => (
            <button
              key={status}
              className={cn(
                'px-3 py-1 rounded-full text-sm',
                selectedFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
              onClick={() => setSelectedFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <LoadingBoundary
        isLoading={isLoading}
        loadingComponent={<UserStatusCardSkeleton />}
        errorComponent={<div className="text-center text-muted-foreground">Error loading users</div>}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserStatusCard key={user.id} user={user} />
          ))}
        </div>
      </LoadingBoundary>

      <div>
        <h3 className="text-lg font-semibold">Nearby Users</h3>
        {nearbyUsersError && (
          <div className="text-center text-muted-foreground">Error loading nearby users</div>
        )}
      </div>
      
      <LoadingBoundary
        isLoading={nearbyUsersLoading}
        loadingComponent={<UserStatusCardSkeleton />}
        errorComponent={<div className="text-center text-muted-foreground">Error loading nearby users</div>}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nearbyUsers.map((user) => (
            <UserStatusCard key={user.id} user={user} />
          ))}
        </div>
      </LoadingBoundary>
    </div>
  );
};

export default LiveUsersTab;
