
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const PrivacySettingsPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy & Security</CardTitle>
        <CardDescription>
          Manage your privacy settings and control who can see your information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Profile Visibility</Label>
            <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Online Status</Label>
            <p className="text-sm text-muted-foreground">Let others see when you're online</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Location Sharing</Label>
            <p className="text-sm text-muted-foreground">Share your location with matches</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettingsPage;
