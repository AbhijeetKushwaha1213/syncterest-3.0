
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const privacyFormSchema = z.object({
  profile_visibility: z.enum(['public', 'friends_only', 'private']),
  location_sharing_enabled: z.boolean(),
  show_location_on_profile: z.boolean(),
  show_activity_status: z.boolean(),
});

type PrivacyFormValues = z.infer<typeof privacyFormSchema>;

const PrivacySettingsPage = () => {
    const { user } = useAuth();
    const { data: profile, isLoading } = useProfile(user?.id);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<PrivacyFormValues>({
        resolver: zodResolver(privacyFormSchema),
        defaultValues: {
            profile_visibility: 'public',
            location_sharing_enabled: true,
            show_location_on_profile: true,
            show_activity_status: true,
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                profile_visibility: profile.profile_visibility as 'public' | 'friends_only' | 'private' || 'public',
                location_sharing_enabled: profile.location_sharing_enabled ?? true,
                show_location_on_profile: profile.show_location_on_profile ?? true,
                show_activity_status: profile.show_activity_status ?? true,
            });
        }
    }, [profile, form]);


    const onSubmit = async (data: PrivacyFormValues) => {
        if (!user) {
            toast({ title: 'Error', description: 'You must be logged in to update your settings.', variant: 'destructive' });
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) {
            toast({ title: 'Error updating privacy settings', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Your privacy settings have been updated.' });
            queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        }
    };
    
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full max-w-sm" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Manage your privacy settings and secure your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="profile_visibility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Visibility</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select who can see your profile" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="public">Public</SelectItem>
                                            <SelectItem value="friends_only">Friends Only</SelectItem>
                                            <SelectItem value="private">Private</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Choose who can see your profile details.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="location_sharing_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Location Sharing</FormLabel>
                                            <FormDescription>
                                                Allow the app to access your location for discovery features.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="show_location_on_profile"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Show Location on Profile</FormLabel>
                                            <FormDescription>
                                                Display your general location on your public profile.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="show_activity_status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Show Activity Status</FormLabel>
                                            <FormDescription>
                                                Let others see when you are online or last active.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default PrivacySettingsPage;
