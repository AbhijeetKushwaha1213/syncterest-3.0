
import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const LanguageSettingsPage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (profile?.language) {
      setSelectedLanguage(profile.language);
    }
  }, [profile]);

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLanguage: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('profiles')
        .update({ language: newLanguage })
        .eq('id', user.id);
      if (error) throw error;
      return newLanguage;
    },
    onSuccess: () => {
      toast({
        title: "Language updated",
        description: `Your preferred language has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update language: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    updateLanguageMutation.mutate(newLanguage);
  };
  
  if (profileLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language</CardTitle>
        <CardDescription>
          Choose your preferred language for the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
          className="space-y-2"
          disabled={updateLanguageMutation.isPending}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en" id="en" />
            <Label htmlFor="en">English</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="es" id="es" />
            <Label htmlFor="es">Español</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fr" id="fr" />
            <Label htmlFor="fr">Français</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingsPage;
