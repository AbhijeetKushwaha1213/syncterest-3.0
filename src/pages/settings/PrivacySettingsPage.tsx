
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertTriangle } from 'lucide-react';
import EnhancedLocationPermissions from '@/components/live/EnhancedLocationPermissions';

const PrivacySettingsPage = () => {
  const { settings, isLoading, updateSetting } = useUserSettings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>
            Manage your privacy settings and control who can see your information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="mx-2 sm:mx-0">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Privacy & Security</CardTitle>
          <CardDescription className="text-sm">
            Manage your privacy settings and control who can see your information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Profile Visibility</Label>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value: 'public' | 'friends_only' | 'private') => 
                updateSetting('profile_visibility', value)
              }
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                <SelectItem value="friends_only">Friends Only - Only mutual connections</SelectItem>
                <SelectItem value="private">Private - Only you can see your profile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Show Online Status</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Let others see when you're online</p>
            </div>
            <Switch
              checked={settings.show_activity_status}
              onCheckedChange={(checked) => updateSetting('show_activity_status', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Location Sharing</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Allow sharing your location for nearby features</p>
            </div>
            <Switch
              checked={settings.location_sharing_enabled}
              onCheckedChange={(checked) => updateSetting('location_sharing_enabled', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Show Location on Profile</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Display your city on your profile</p>
            </div>
            <Switch
              checked={settings.show_location_on_profile}
              onCheckedChange={(checked) => updateSetting('show_location_on_profile', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mx-2 sm:mx-0">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="w-5 h-5 text-orange-600" />
            Enhanced Location Privacy
          </CardTitle>
          <CardDescription className="text-sm">
            Advanced location sharing controls with audit trail and granular permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
            <div className="flex items-center gap-2 text-orange-800 font-medium mb-2 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Important Privacy Information
            </div>
            <p className="text-xs sm:text-sm text-orange-700 mb-2">
              Your location data is now protected by enhanced security measures:
            </p>
            <ul className="text-xs sm:text-sm text-orange-700 space-y-1 list-disc list-inside">
              <li>All location access is logged and auditable</li>
              <li>Precise GPS coordinates require explicit permission</li>
              <li>Access permissions expire automatically</li>
              <li>You can revoke access at any time</li>
            </ul>
          </div>
          
          <EnhancedLocationPermissions />
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettingsPage;
