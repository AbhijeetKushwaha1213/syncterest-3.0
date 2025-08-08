
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUploader from "@/components/settings/AvatarUploader";
import { InterestsFormSection } from "@/components/settings/InterestsFormSection";
import PersonalityFormSection from "@/components/settings/PersonalityFormSection";
import { usePersonalityResponses } from "@/hooks/usePersonalityResponses";

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
  // Personality fields
  gender: z.string().optional(),
  height: z.string().optional(),
  ethnicity: z.string().optional(),
  conversation_style: z.string().optional(),
  values_in_partner: z.string().optional(),
  sports_excitement: z.string().optional(),
  trip_handling: z.string().optional(),
  group_behavior: z.string().optional(),
  social_energy: z.string().optional(),
  day_planning: z.string().optional(),
  weekend_recharge: z.string().optional(),
  new_experiences: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const AccountSettingsPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);
  const { personalityData, isLoading: personalityLoading, saveResponses, isSaving } = usePersonalityResponses();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      interests: [],
      gender: "",
      height: "",
      ethnicity: "",
      conversation_style: "",
      values_in_partner: "",
      sports_excitement: "",
      trip_handling: "",
      group_behavior: "",
      social_energy: "",
      day_planning: "",
      weekend_recharge: "",
      new_experiences: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        interests: profile.interests || [],
        gender: personalityData?.gender || "",
        height: personalityData?.height || "",
        ethnicity: personalityData?.ethnicity || "",
        conversation_style: personalityData?.conversation_style || "",
        values_in_partner: personalityData?.values_in_partner || "",
        sports_excitement: personalityData?.sports_excitement || "",
        trip_handling: personalityData?.trip_handling || "",
        group_behavior: personalityData?.group_behavior || "",
        social_energy: personalityData?.social_energy || "",
        day_planning: personalityData?.day_planning || "",
        weekend_recharge: personalityData?.weekend_recharge || "",
        new_experiences: personalityData?.new_experiences || "",
      });
    }
  }, [profile, personalityData, form]);

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

    try {
      // Update profile
      const { error: profileError } = await supabase.from("profiles").update({
        username: data.username,
        full_name: data.full_name,
        bio: data.bio,
        interests: data.interests,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

      // Update personality responses (await to ensure save completes)
      const personalityPayload = {
        gender: data.gender,
        height: data.height,
        ethnicity: data.ethnicity,
        conversation_style: data.conversation_style,
        values_in_partner: data.values_in_partner,
        sports_excitement: data.sports_excitement,
        trip_handling: data.trip_handling,
        group_behavior: data.group_behavior,
        social_energy: data.social_energy,
        day_planning: data.day_planning,
        weekend_recharge: data.weekend_recharge,
        new_experiences: data.new_experiences,
      };
      await saveResponses(personalityPayload);

      if (profileError) {
        if (profileError.code === '23505') {
          form.setError('username', { type: 'manual', message: 'This username is already taken.' });
        } else {
          toast({
            title: "Error updating profile",
            description: profileError.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        window.location.reload();
      }
    } catch (e: any) {
      console.error("AccountSettingsPage: Error during save:", e);
      toast({
        title: "Error updating profile",
        description: e?.message ?? "Something went wrong while saving your changes.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
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
              
              <InterestsFormSection control={form.control} />
              
              <Separator />
              
              <PersonalityFormSection control={form.control} />
              
              <Button type="submit" disabled={formLoading || isSaving || !profile}>
                {formLoading || isSaving ? 'Saving...' : 'Update profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
};

export default AccountSettingsPage;
