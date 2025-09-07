import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Eye, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocationAccessAudit, LocationAccessAuditRecord } from '@/hooks/useLocationAccessAudit';

const AccessTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'view':
      return <Eye className="w-4 h-4" />;
    case 'query':
      return <MapPin className="w-4 h-4" />;
    default:
      return <Shield className="w-4 h-4" />;
  }
};

const AccessTypeLabel = ({ type }: { type: string }) => {
  const labels = {
    view: 'Viewed Activity',
    query: 'Queried Location',
    permission_check: 'Permission Check',
  };
  return labels[type as keyof typeof labels] || type;
};

const AuditRecordItem = ({ record, isIncoming }: { record: LocationAccessAuditRecord; isIncoming: boolean }) => {
  const profile = isIncoming ? record.accessor_profile : record.target_profile;
  const displayName = profile?.full_name || profile?.username || 'Unknown User';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback>
          {displayName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{displayName}</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <AccessTypeIcon type={record.access_type} />
            <AccessTypeLabel type={record.access_type} />
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(record.created_at), { addSuffix: true })}
        </div>
      </div>
      
      {record.activity_id && (
        <Badge variant="outline">Activity Access</Badge>
      )}
    </div>
  );
};

const AuditSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

const LocationAccessAuditViewer = () => {
  const { accessToMyLocation, myAccessToOthers, isLoading } = useLocationAccessAudit();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Location Access Audit
        </CardTitle>
        <CardDescription>
          View who has accessed your location data and track your own location access activity.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">
              Access to My Location ({accessToMyLocation.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              My Location Access ({myAccessToOthers.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="incoming" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Shows who has accessed your location data or live activities.
            </div>
            
            {isLoading ? (
              <AuditSkeleton />
            ) : accessToMyLocation.length > 0 ? (
              <div className="space-y-3">
                {accessToMyLocation.map(record => (
                  <AuditRecordItem
                    key={record.id}
                    record={record}
                    isIncoming={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No one has accessed your location data yet.</p>
                <p className="text-sm">Your privacy is protected!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="outgoing" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Shows when you have accessed others' location data.
            </div>
            
            {isLoading ? (
              <AuditSkeleton />
            ) : myAccessToOthers.length > 0 ? (
              <div className="space-y-3">
                {myAccessToOthers.map(record => (
                  <AuditRecordItem
                    key={record.id}
                    record={record}
                    isIncoming={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You haven't accessed anyone's location data yet.</p>
                <p className="text-sm">Location access will be logged here for transparency.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LocationAccessAuditViewer;