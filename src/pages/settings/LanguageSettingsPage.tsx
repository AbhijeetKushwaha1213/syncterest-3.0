
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Skeleton } from '@/components/ui/skeleton';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const LanguageSettingsPage = () => {
  const { settings, isLoading, updateSetting } = useUserSettings();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
          <CardDescription>
            Choose your preferred language for the app interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  const selectedLanguage = languages.find(lang => lang.code === settings.language) || languages[0];

  return (
    <Card className="mx-2 sm:mx-0">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Language</CardTitle>
        <CardDescription className="text-sm">
          Choose your preferred language for the app interface.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Interface Language</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => updateSetting('language', value)}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue>
                <div className="flex items-center">
                  <span className="mr-2">{selectedLanguage.flag}</span>
                  <span className="text-sm sm:text-base">{selectedLanguage.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  <div className="flex items-center">
                    <span className="mr-2">{language.flag}</span>
                    <span className="text-sm sm:text-base">{language.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Note: Language translations are not yet implemented. This setting will be functional in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingsPage;
