
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const DiscoverySettingsPage = () => {
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
          <div className="space-y-0.5">
            <Label>Discoverable</Label>
            <p className="text-sm text-muted-foreground">Allow others to find and connect with you</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="space-y-3">
          <Label>Discovery Radius (km)</Label>
          <Slider
            defaultValue={[50]}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">Show people within 50 km</p>
        </div>
        <div className="space-y-3">
          <Label>Age Range</Label>
          <Slider
            defaultValue={[18, 35]}
            max={100}
            min={18}
            step={1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">Show people aged 18-35</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoverySettingsPage;
