
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  latitude?: number | null;
  longitude?: number | null;
};

export const useEvent = (eventId: string | undefined) => {
  return useQuery<Event | null>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const { data, error } = await supabase
        .from('events')
        .select('*, latitude, longitude')
        .eq('id', eventId)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      return data;
    },
    enabled: !!eventId,
  });
};
