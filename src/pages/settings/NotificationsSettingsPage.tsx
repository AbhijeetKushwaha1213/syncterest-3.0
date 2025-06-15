
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';

const notificationsFormSchema = z.object({
  email_notifications_enabled: z.boolean(),
  push_notifications_enabled: z.boolean(),
  new_message_notifications: z.boolean(),
  new_follower_notifications: z.boolean(),
  event_reminder_notifications: z.boolean(),
  group_activity_notifications: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

type ProfileWithNotificationSettings = Database['public']['Tables']['profiles']['Row'] & {
    email_notifications_enabled?: boolean;
    push_notifications_enabled?: boolean;
    new_message_notifications?: boolean;
    new_follower_notifications?: boolean;
    event_reminder_notifications?: boolean;
    group_activity_notifications?: boolean;
};

const NotificationsSettingsPage = () => {
    const { user } = useAuth();
    const { data: profile, isLoading } = useProfile(user?.id);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<NotificationsFormValues>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: {
            email_notifications_enabled: true,
            push_notifications_enabled: true,
            new_message_notifications: true,
            new_follower_notifications: true,
            event_reminder_notifications: true,
            group_activity_notifications: true,
        },
    });

    useEffect(() => {
        if (profile) {
            const profileData = profile as ProfileWithNotificationSettings;
            form.reset({
                email_notifications_enabled: profileData.email_notifications_enabled ?? true,
                push_notifications_enabled: profileData.push_notifications_enabled ?? true,
                new_message_notifications: profileData.new_message_notifications ?? true,
                new_follower_notifications: profileData.new_follower_notifications ?? true,
                event_reminder_notifications: profileData.event_reminder_notifications ?? true,
                group_activity_notifications: profileData.group_activity_notifications ?? true,
            });
        }
    }, [profile, form]);

    const onSubmit = async (data: NotificationsFormValues) => {
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
            toast({ title: 'Error updating notification settings', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Your notification settings have been updated.' });
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
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
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
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email_notifications_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Email Notifications</FormLabel>
                                            <FormDescription>
                                                Receive emails for important updates and announcements.
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
                                name="push_notifications_enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Push Notifications</FormLabel>
                                            <FormDescription>
                                                Get real-time alerts on your devices.
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

                            <div className="space-y-2 pt-4">
                                <h3 className="text-lg font-medium">Activity Notifications</h3>
                                <p className="text-sm text-muted-foreground">Choose which specific activities you want to be notified about.</p>
                            </div>

                            <FormField
                                control={form.control}
                                name="new_message_notifications"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">New Messages</FormLabel>
                                            <FormDescription>
                                                Notify me when I receive a new message.
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
                                name="new_follower_notifications"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">New Followers</FormLabel>
                                            <FormDescription>
                                                Notify me when someone new follows me.
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
                                name="event_reminder_notifications"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Event Reminders</FormLabel>
                                            <FormDescription>
                                                Remind me about upcoming events I'm interested in.
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
                                name="group_activity_notifications"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Group Activity</FormLabel>
                                            <FormDescription>
                                                Notify me about new posts or activity in my groups.
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

export default NotificationsSettingsPage;
