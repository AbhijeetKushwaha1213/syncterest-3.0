
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PersonalityResponses {
  id?: string;
  user_id?: string;
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
  created_at?: string;
  updated_at?: string;
}

export const usePersonalityResponses = () => {
  const queryClient = useQueryClient();

  const { data: personalityData, isLoading } = useQuery({
    queryKey: ['personality-responses'],
    queryFn: async () => {
      // Always scope to the authenticated user to avoid multi-row .single errors
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('personality_responses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (responses: PersonalityResponses) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Select existing row for this user (avoid requiring a unique constraint)
      const { data: existing, error: selectError } = await supabase
        .from('personality_responses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing?.id) {
        const { data, error } = await supabase
          .from('personality_responses')
          .update({
            ...responses,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('personality_responses')
          .insert({
            user_id: user.id,
            ...responses,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-responses'] });
    },
    onError: (error: any) => {
      console.error('Error saving personality responses:', error);
      // Re-throw so callers can handle it (e.g., forms)
      throw error;
    },
  });

  return {
    personalityData,
    isLoading,
    saveResponses: (responses: PersonalityResponses) => {
      return upsertMutation.mutateAsync(responses);
    },
    isSaving: upsertMutation.isPending,
  };
};
