
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

const formSchema = z.object({
  intent: z.string().optional(),
  personality_tags: z.array(z.string()).optional(),
  cultural_preferences: z.object({
    film: z.string().optional(),
    music: z.string().optional(),
    youtuber: z.string().optional(),
  }).optional(),
  location_city: z.string().optional(),
  location_postal_code: z.string().optional(),
});

type IntentOption = Tables<'intent_options'>;
type PersonalityTagOption = Tables<'personality_tags_options'>;

const fetchIntentOptions = async (): Promise<IntentOption[]> => {
  const { data, error } = await supabase.from('intent_options').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const fetchPersonalityTags = async (): Promise<PersonalityTagOption[]> => {
  const { data, error } = await supabase.from('personality_tags_options').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const DiscoverySettingsPage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useProfile(user?.id);
  const queryClient = useQueryClient();

  const { data: intentOptions, isLoading: isLoadingIntents } = useQuery({ queryKey: ['intentOptions'], queryFn: fetchIntentOptions });
  const { data: personalityTags, isLoading: isLoadingTags } = useQuery({ queryKey: ['personalityTags'], queryFn: fetchPersonalityTags });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intent: '',
      personality_tags: [],
      cultural_preferences: { film: '', music: '', youtuber: '' },
      location_city: '',
      location_postal_code: '',
    },
  });
  
  useEffect(() => {
    if (profile) {
      form.reset({
        intent: profile.intent || '',
        personality_tags: profile.personality_tags || [],
        cultural_preferences: profile.cultural_preferences ? {
          film: (profile.cultural_preferences as any)?.film || '',
          music: (profile.cultural_preferences as any)?.music || '',
          youtuber: (profile.cultural_preferences as any)?.youtuber || '',
        } : { film: '', music: '', youtuber: '' },
        location_city: profile.location_city || '',
        location_postal_code: profile.location_postal_code || '',
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('profiles')
        .update({
          intent: values.intent,
          personality_tags: values.personality_tags,
          cultural_preferences: values.cultural_preferences,
          location_city: values.location_city,
          location_postal_code: values.location_postal_code,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Your discovery settings have been updated." });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateProfileMutation.mutate(values);
  };

  if (isLoadingProfile || isLoadingIntents || isLoadingTags) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discovery Settings</CardTitle>
        <CardDescription>
          Help others discover you by sharing your personality, interests, and what you're looking for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="intent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you looking for right now?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an intent..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {intentOptions?.map(option => (
                        <SelectItem key={option.id} value={option.name}>{option.description}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personality_tags"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>What's your vibe?</FormLabel>
                    <FormDescription>Select up to two personality tags that best describe you.</FormDescription>
                  </div>
                  {personalityTags?.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="personality_tags"
                      render={({ field }) => {
                        return (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.name)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                      if (currentValue.length < 2) {
                                          field.onChange([...currentValue, item.name]);
                                      } else {
                                          toast({ title: "You can select up to 2 tags.", variant: "destructive" });
                                      }
                                  } else {
                                      field.onChange(currentValue.filter((value) => value !== item.name));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.description}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
                <h3 className="text-lg font-medium">Cultural Preferences</h3>
                <p className="text-sm text-muted-foreground">What kind of content do you enjoy?</p>
            </div>
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="cultural_preferences.film"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Favorite Film / Web Series / Anime</FormLabel>
                        <FormControl><Input placeholder="e.g., 'Spirited Away'" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cultural_preferences.music"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Favorite Music Genre / Vibe</FormLabel>
                        <FormControl><Input placeholder="e.g., 'Lofi beats'" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cultural_preferences.youtuber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Favorite YouTuber / Creator</FormLabel>
                        <FormControl><Input placeholder="e.g., 'MKBHD'" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div>
                <h3 className="text-lg font-medium">Your Location</h3>
                <p className="text-sm text-muted-foreground">Used to find people nearby.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="location_city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input placeholder="e.g., 'San Francisco'" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location_postal_code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl><Input placeholder="e.g., '94107'" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>


            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DiscoverySettingsPage;
