
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
      const { data, error } = await supabase
        .from('personality_responses')
        .select('*')
        .single();

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

      const { data, error } = await supabase
        .from('personality_responses')
        .upsert({
          user_id: user.id,
          ...responses,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-responses'] });
    },
    onError: (error: any) => {
      console.error('Error saving personality responses:', error);
      throw error; // Re-throw to be handled by the calling component
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
