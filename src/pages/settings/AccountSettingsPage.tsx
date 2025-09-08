
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUploader from "@/components/settings/AvatarUploader";
import { InterestsFormSection } from "@/components/settings/InterestsFormSection";
import PersonalityFormSection from "@/components/settings/PersonalityFormSection";
import BasicAccountFields from "@/components/settings/BasicAccountFields";
import { usePersonalityResponses } from "@/hooks/usePersonalityResponses";
import { useAccountFormSubmit, AccountFormValues } from "@/hooks/useAccountFormSubmit";

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

type FormValues = z.infer<typeof accountFormSchema>;

const AccountSettingsPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { personalityData, isLoading: personalityLoading } = usePersonalityResponses();

  const form = useForm<FormValues>({
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

  const { onSubmit, formLoading, isSaving } = useAccountFormSubmit(user, form);

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

  return (
      <Card className="mx-2 sm:mx-0">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Account</CardTitle>
          <CardDescription className="text-sm">
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <AvatarUploader initialAvatarUrl={profile?.avatar_url} username={profile?.username} />
              </FormItem>
              
              <BasicAccountFields control={form.control} />
              
              <InterestsFormSection control={form.control} />
              
              <Separator />
              
              <PersonalityFormSection control={form.control} />
              
              <Button 
                type="submit" 
                disabled={formLoading || isSaving || !profile}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {formLoading || isSaving ? 'Saving...' : 'Update profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
  );
};

export default AccountSettingsPage;
