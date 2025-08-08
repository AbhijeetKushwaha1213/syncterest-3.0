
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePersonalityResponses } from '@/hooks/usePersonalityResponses';

interface AccountFormValues {
  username: string;
  full_name?: string;
  bio?: string;
  interests?: string[];
  gender?: string;
  height?: string;
  ethnicity?: string;
  conversation_style?: string;
  values_in_partner?: string;
  sports_excitement?: string;
  trip_handling?: string;
  group_behavior?: string;
  social_energy?: string;
  day_planning?: string;
  weekend_recharge?: string;
  new_experiences?: string;
}

export const useAccountFormSubmit = (
  user: any,
  form: UseFormReturn<AccountFormValues>
) => {
  const [formLoading, setFormLoading] = useState(false);
  const { saveResponses, isSaving } = usePersonalityResponses();

  const onSubmit = async (data: AccountFormValues) => {
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
  };

  return {
    onSubmit,
    formLoading,
    isSaving
  };
};
