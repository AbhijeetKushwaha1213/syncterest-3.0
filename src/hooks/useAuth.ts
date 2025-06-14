
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async (user: User | null) => {
      if (!user) {
        setProfile(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`*`)
          .eq('id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      }
    };

    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await fetchProfileData(currentUser);
      setLoading(false);
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Use setTimeout to defer profile fetching and avoid potential issues.
      setTimeout(() => {
        fetchProfileData(session?.user ?? null);
      }, 0);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { session, user, profile, loading };
};
