
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationsSettingsPage = () => {
  const { settings, isLoading, updateSetting } = useUserSettings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you want to be notified about activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
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
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you want to be notified about activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
          </div>
          <Switch
            checked={settings.push_notifications_enabled}
            onCheckedChange={(checked) => updateSetting('push_notifications_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch
            checked={settings.email_notifications_enabled}
            onCheckedChange={(checked) => updateSetting('email_notifications_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Message Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified about new messages</p>
          </div>
          <Switch
            checked={settings.new_message_notifications}
            onCheckedChange={(checked) => updateSetting('new_message_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Follower Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
          </div>
          <Switch
            checked={settings.new_follower_notifications}
            onCheckedChange={(checked) => updateSetting('new_follower_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Group Activity Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified about group activities</p>
          </div>
          <Switch
            checked={settings.group_activity_notifications}
            onCheckedChange={(checked) => updateSetting('group_activity_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Event Reminder Notifications</Label>
            <p className="text-sm text-muted-foreground">Get reminded about upcoming events</p>
          </div>
          <Switch
            checked={settings.event_reminder_notifications}
            onCheckedChange={(checked) => updateSetting('event_reminder_notifications', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsSettingsPage;
