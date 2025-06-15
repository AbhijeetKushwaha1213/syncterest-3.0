
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
      console.log("useLocation: Requesting location from browser...");

      const handleSuccess = (position: GeolocationPosition) => {
        console.log("useLocation: Geolocation success.", position.coords);
        const { latitude, longitude } = position.coords;
        updateProfileLocation(latitude, longitude);
        resolve({ latitude, longitude });
      };

      const handleError = (err: GeolocationPositionError) => {
        console.error("useLocation: Geolocation error.", err);
        let msg = `Unable to retrieve your location: ${err.message}`;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = "Location access was denied. Please enable it in your browser settings.";
            break;
          case err.POSITION_UNAVAILABLE:
            msg = "Your location could not be determined. Please ensure location services are enabled on your device and try again.";
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

      // Using lower accuracy for a potentially faster response. High accuracy can be slow, 
      // especially indoors, and may not be necessary for this app's purpose.
      // A single attempt avoids long wait times for the user.
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: false,
          timeout: 15000, // 15 seconds
          maximumAge: 60000, // Use a cached position if it's less than a minute old
        }
      );
    });
  };
  
  const hasLocation = !!profile?.latitude && !!profile?.longitude;

  return { error, loading, getLocation, hasLocation, profileLocation: { latitude: profile?.latitude, longitude: profile?.longitude } };
};
