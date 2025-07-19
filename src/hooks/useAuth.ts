
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useProfile } from './useProfile';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  useEffect(() => {
    console.log("Setting up auth listeners");
    setAuthLoading(true);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }
      console.log("Initial session:", session?.user?.email || "No session");
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.email || "No session");
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      console.log("Cleaning up auth listeners");
      subscription?.unsubscribe();
    };
  }, []);

  const loading = authLoading || (!!user && profileLoading);

  return { session, user, profile: profile ?? null, loading };
};
