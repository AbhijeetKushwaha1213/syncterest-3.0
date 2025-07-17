
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useLocation = () => {
  const { user, profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileLocation = async (latitude: number, longitude: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      console.log("useLocation: Updating profile with location:", { latitude, longitude });
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ latitude, longitude, last_active_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast({
          title: "Location updated!",
          description: "You can now see people near you."
      });
      // Invalidate the profile query to refetch data across the app.
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      
    } catch (e: any) {
      setError(e.message);
      toast({
          title: "Error updating location",
          description: e.message,
          variant: "destructive"
      });
      console.error("useLocation: Error updating profile location in Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      console.log("useLocation: getLocation triggered.");
      if (!navigator.geolocation) {
        const msg = 'Geolocation is not supported by your browser.';
        console.error(`useLocation: ${msg}`);
        setError(msg);
        toast({ title: "Location Error", description: msg, variant: "destructive" });
        resolve(null);
        return;
      }

      setLoading(true);
      console.log("useLocation: Attempting quick location fetch...");

      // First attempt: Quick, low-accuracy fetch
      const attemptQuickLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("useLocation: Quick location success.", position.coords);
            const { latitude, longitude } = position.coords;
            updateProfileLocation(latitude, longitude);
            resolve({ latitude, longitude });
          },
          (err) => {
            console.log("useLocation: Quick location failed, trying accurate fetch...");
            handleQuickLocationError(err);
          },
          {
            enableHighAccuracy: false,
            timeout: 5000, // 5 seconds
            maximumAge: 60000, // Allow 1-minute cached position
          }
        );
      };

      const handleQuickLocationError = (err: GeolocationPositionError) => {
        // Don't show error for quick attempt, just inform about trying accurate search
        if (err.code === err.PERMISSION_DENIED) {
          const msg = "Location access is blocked. Please enable it in your browser's site settings to use this feature.";
          setError(msg);
          toast({ title: "Location Access Blocked", description: msg, variant: "destructive" });
          setLoading(false);
          resolve(null);
          return;
        }

        // Inform user we're trying a more accurate search
        toast({ 
          title: "Getting location...", 
          description: "Having trouble getting a quick location, trying a more accurate search..." 
        });

        // Second attempt: High-accuracy fetch
        attemptAccurateLocation();
      };

      const attemptAccurateLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("useLocation: Accurate location success.", position.coords);
            const { latitude, longitude } = position.coords;
            updateProfileLocation(latitude, longitude);
            resolve({ latitude, longitude });
          },
          (err) => {
            console.error("useLocation: Accurate location failed.", err);
            handleAccurateLocationError(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // 15 seconds
            maximumAge: 0, // Force fresh location
          }
        );
      };

      const handleAccurateLocationError = (err: GeolocationPositionError) => {
        let msg = `Unable to retrieve your location: ${err.message}`;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = "Location access is blocked. Please enable it in your browser's site settings to use this feature.";
            break;
          case err.POSITION_UNAVAILABLE:
            msg = "Your location could not be determined. This can be due to a poor signal. Please ensure location services are enabled on your device and try again.";
            break;
          case err.TIMEOUT:
            msg = "The request to get your location timed out. This can happen with a poor signal. Please try again.";
            break;
        }
        setError(msg);
        toast({ title: "Location Error", description: msg, variant: "destructive" });
        setLoading(false);
        resolve(null);
      };

      // Start with quick location attempt
      attemptQuickLocation();
    });
  };
  
  const hasLocation = !!profile?.latitude && !!profile?.longitude;

  return { error, loading, getLocation, hasLocation, profileLocation: { latitude: profile?.latitude, longitude: profile?.longitude } };
};
