
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';

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
    <Card>
      <CardHeader>
        <CardTitle>Privacy & Security</CardTitle>
        <CardDescription>
          Manage your privacy settings and control who can see your information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Profile Visibility</Label>
          <Select
            value={settings.profile_visibility}
            onValueChange={(value: 'public' | 'friends_only' | 'private') => 
              updateSetting('profile_visibility', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
              <SelectItem value="friends_only">Friends Only - Only mutual connections</SelectItem>
              <SelectItem value="private">Private - Only you can see your profile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Online Status</Label>
            <p className="text-sm text-muted-foreground">Let others see when you're online</p>
          </div>
          <Switch
            checked={settings.show_activity_status}
            onCheckedChange={(checked) => updateSetting('show_activity_status', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Location Sharing</Label>
            <p className="text-sm text-muted-foreground">Allow sharing your location for nearby features</p>
          </div>
          <Switch
            checked={settings.location_sharing_enabled}
            onCheckedChange={(checked) => updateSetting('location_sharing_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Location on Profile</Label>
            <p className="text-sm text-muted-foreground">Display your city on your profile</p>
          </div>
          <Switch
            checked={settings.show_location_on_profile}
            onCheckedChange={(checked) => updateSetting('show_location_on_profile', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettingsPage;
