import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Shield, Clock, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLocationSharing } from '@/hooks/useLocationSharing';
import LocationAccessAuditViewer from './LocationAccessAuditViewer';

const PermissionCard = ({ 
  permission, 
  type, 
  onRevoke, 
  isRevoking 
}: { 
  permission: any; 
  type: 'granted' | 'received'; 
  onRevoke?: (userId: string) => void; 
  isRevoking: boolean;
}) => {
  const profile = type === 'granted' ? permission.profiles : permission.profiles;
  const displayName = profile?.full_name || profile?.username || 'Unknown User';
  const isExpired = permission.expires_at && new Date(permission.expires_at) < new Date();
  
  return (
    <div className={`p-4 border rounded-lg ${isExpired ? 'opacity-60 bg-muted/50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback>
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{displayName}</span>
              {isExpired && <Badge variant="destructive">Expired</Badge>}
              {!permission.expires_at && <Badge variant="secondary">Permanent</Badge>}
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              {permission.expires_at 
                ? `Expires ${formatDistanceToNow(new Date(permission.expires_at), { addSuffix: true })}`
                : 'Never expires'
              }
            </div>
          </div>
        </div>
        
        {type === 'granted' && onRevoke && !isExpired && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(permission.grantee_id)}
            disabled={isRevoking}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
};

const GrantLocationAccessDialog = ({ 
  grantAccess, 
  isGranting 
}: { 
  grantAccess: (params: { userId: string; hours?: number }) => void; 
  isGranting: boolean; 
}) => {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [duration, setDuration] = useState<number>(24);

  const handleGrant = () => {
    if (!selectedUserId) return;
    grantAccess({ userId: selectedUserId, hours: duration });
    setOpen(false);
    setSelectedUserId('');
    setDuration(24);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Grant Location Access
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Grant Location Access
          </DialogTitle>
          <DialogDescription>
            Allow someone to see your live activities with location data. This should only be granted to people you trust.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Privacy Warning
            </div>
            <p className="text-sm text-orange-700">
              Granting location access allows this person to see your precise GPS coordinates when you post live activities. 
              Only grant this to people you completely trust.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">User ID or Username</label>
            <input
              type="text"
              placeholder="Enter user ID..."
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <p className="text-xs text-muted-foreground">
              For now, you need to get the user ID from the person directly. User search will be added in a future update.
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Access Duration</label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Hour</SelectItem>
                <SelectItem value="6">6 Hours</SelectItem>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="168">1 Week</SelectItem>
                <SelectItem value="720">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleGrant} 
              disabled={!selectedUserId || isGranting}
              className="flex-1"
            >
              {isGranting ? 'Granting...' : 'Grant Access'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EnhancedLocationPermissions = () => {
  const { 
    grantedPermissions, 
    receivedPermissions, 
    isLoadingGranted, 
    isLoadingReceived, 
    grantAccess, 
    revokeAccess, 
    isGranting, 
    isRevoking 
  } = useLocationSharing();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Sharing Permissions
          </CardTitle>
          <CardDescription>
            Manage who can see your location data and view permissions others have granted you.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">People I've Given Access To</h3>
              <Badge variant="outline">{grantedPermissions?.length || 0}</Badge>
            </div>
            
            {isLoadingGranted ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : grantedPermissions && grantedPermissions.length > 0 ? (
              <div className="space-y-3">
                {grantedPermissions.map(permission => (
                  <PermissionCard
                    key={permission.id}
                    permission={permission}
                    type="granted"
                    onRevoke={revokeAccess}
                    isRevoking={isRevoking}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You haven't granted location access to anyone yet.</p>
                <p className="text-sm">Your location data remains private.</p>
              </div>
            )}
            
            <div className="mt-4">
              <GrantLocationAccessDialog grantAccess={grantAccess} isGranting={isGranting} />
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">People Who've Given Me Access</h3>
              <Badge variant="outline">{receivedPermissions?.length || 0}</Badge>
            </div>
            
            {isLoadingReceived ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : receivedPermissions && receivedPermissions.length > 0 ? (
              <div className="space-y-3">
                {receivedPermissions.map(permission => (
                  <PermissionCard
                    key={permission.id}
                    permission={permission}
                    type="received"
                    isRevoking={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No one has granted you location access yet.</p>
                <p className="text-sm">Ask friends to share their location with you.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <LocationAccessAuditViewer />
    </div>
  );
};

export default EnhancedLocationPermissions;