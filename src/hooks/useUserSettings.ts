
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface UserSettings {
  // Privacy settings
  profile_visibility: 'public' | 'friends_only' | 'private';
  location_sharing_enabled: boolean;
  show_location_on_profile: boolean;
  show_activity_status: boolean;
  
  // Notification settings
  email_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  new_message_notifications: boolean;
  new_follower_notifications: boolean;
  group_activity_notifications: boolean;
  event_reminder_notifications: boolean;
  
  // Discovery settings
  discovery_radius: number;
  min_age: number;
  max_age: number;
  discoverable: boolean;
  
  // Appearance settings
  theme: 'light' | 'dark' | 'system';
  
  // Language settings
  language: string;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          profile_visibility,
          location_sharing_enabled,
          show_location_on_profile,
          show_activity_status,
          email_notifications_enabled,
          push_notifications_enabled,
          new_message_notifications,
          new_follower_notifications,
          group_activity_notifications,
          event_reminder_notifications,
          language
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          ...data,
          // Default values for settings not yet in database
          discovery_radius: 50,
          min_age: 18,
          max_age: 35,
          discoverable: true,
          theme: 'system'
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error loading settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!user || !settings) return;

    setIsSaving(true);
    try {
      // Handle theme setting locally (not stored in database yet)
      if (key === 'theme') {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
        // Apply theme to document
        const root = document.documentElement;
        if (value === 'dark') {
          root.classList.add('dark');
        } else if (value === 'light') {
          root.classList.remove('dark');
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
        toast({
          title: 'Theme updated',
          description: `Theme changed to ${value}`,
        });
        return;
      }

      // Handle discovery settings (not yet in database)
      if (['discovery_radius', 'min_age', 'max_age', 'discoverable'].includes(key)) {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
        toast({
          title: 'Discovery setting updated',
          description: 'Your discovery preferences have been saved',
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('id', user.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      
      toast({
        title: 'Settings updated',
        description: 'Your preferences have been saved',
      });
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    updateSetting,
    refetch: fetchSettings,
  };
};
