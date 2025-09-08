
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Monitor, Moon, Sun } from 'lucide-react';

const AppearanceSettingsPage = () => {
  const { settings, isLoading, updateSetting } = useUserSettings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how your app looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4 mr-2" />;
      case 'dark':
        return <Moon className="h-4 w-4 mr-2" />;
      default:
        return <Monitor className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Card className="mx-2 sm:mx-0">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Appearance</CardTitle>
        <CardDescription className="text-sm">
          Customize how your app looks and feels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Theme</Label>
          <Select
            value={settings.theme}
            onValueChange={(value: 'light' | 'dark' | 'system') => 
              updateSetting('theme', value)
            }
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue>
                <div className="flex items-center">
                  {getThemeIcon(settings.theme)}
                  {settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center">
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center">
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Choose your preferred theme or sync with your system settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettingsPage;
