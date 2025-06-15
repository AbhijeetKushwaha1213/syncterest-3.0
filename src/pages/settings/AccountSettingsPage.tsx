import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUploader from "@/components/settings/AvatarUploader";

const accountFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must not be longer than 20 characters." }),
  full_name: z
    .string()
    .max(50, { message: "Full name must not be longer than 50 characters." })
    .optional()
    .or(z.literal('')),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional().or(z.literal('')),
  interests: z.array(z.string()).optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const interestsList = [
  { id: "sports", label: "Sports" },
  { id: "music", label: "Music" },
  { id: "coding", label: "Coding" },
  { id: "discussions", label: "Discussions" },
  { id: "art", label: "Art" },
  { id: "reading", label: "Reading" },
  { id: "collaboration", label: "Collaborative Work" },
];

const AccountSettingsPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      interests: [],
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        interests: profile.interests || [],
      });
    }
  }, [profile, form]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading && !profile) {
    return (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
    );
  }

  async function onSubmit(data: AccountFormValues) {
    if (!user) return;
    setFormLoading(true);
    const { error } = await supabase.from("profiles").update({
      username: data.username,
      full_name: data.full_name,
      bio: data.bio,
      interests: data.interests,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    setFormLoading(false);

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        form.setError('username', { type: 'manual', message: 'This username is already taken.' });
      } else {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      // This will trigger a re-fetch in useAuth and show the updated profile
      // Forcing a reload to ensure profile updates are reflected everywhere.
      window.location.reload();
    }
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <AvatarUploader initialAvatarUrl={profile?.avatar_url} username={profile?.username} />
              </FormItem>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name. It must be unique.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>
                      Your full name, if you'd like to share it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                         value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about you and your interests.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Interests</FormLabel>
                      <FormDescription>
                        Select the interests that you'd like to share.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {interestsList.map((interest) => (
                        <FormField
                          key={interest.id}
                          control={form.control}
                          name="interests"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={interest.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(interest.label)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), interest.label])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (value) => value !== interest.label
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {interest.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={formLoading || !profile}>
                {formLoading ? 'Saving...' : 'Update profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
};

export default AccountSettingsPage;
