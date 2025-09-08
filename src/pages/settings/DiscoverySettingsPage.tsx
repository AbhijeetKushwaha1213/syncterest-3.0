
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';

const DiscoverySettingsPage = () => {
  const { settings, isLoading, updateSetting } = useUserSettings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discovery</CardTitle>
          <CardDescription>
            Control how others can discover and connect with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  return (
    <Card className="mx-2 sm:mx-0">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Discovery</CardTitle>
        <CardDescription className="text-sm">
          Control how others can discover and connect with you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Discoverable</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">Allow others to find and connect with you</p>
          </div>
          <Switch
            checked={settings.discoverable}
            onCheckedChange={(checked) => updateSetting('discoverable', checked)}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Discovery Radius ({settings.discovery_radius} km)</Label>
            <div className="px-2">
              <Slider
                value={[settings.discovery_radius]}
                onValueChange={([value]) => updateSetting('discovery_radius', value)}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Show people within {settings.discovery_radius} km
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Age Range ({settings.min_age}-{settings.max_age})</Label>
            <div className="px-2">
              <Slider
                value={[settings.min_age, settings.max_age]}
                onValueChange={([min, max]) => {
                  updateSetting('min_age', min);
                  updateSetting('max_age', max);
                }}
                max={100}
                min={18}
                step={1}
                className="w-full"
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Show people aged {settings.min_age}-{settings.max_age}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoverySettingsPage;
