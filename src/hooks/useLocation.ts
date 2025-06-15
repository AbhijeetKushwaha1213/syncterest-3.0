
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export const useLocation = () => {
  const { user, profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateProfileLocation = async (latitude: number, longitude: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ latitude, longitude, last_active_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      toast({
          title: "Location updated!",
          description: "You can now see people near you."
      });
      // A page reload might be needed for all components to get the new profile info,
      // but for now, we will rely on react-query to refetch data.
      
    } catch (e: any) {
      setError(e.message);
      toast({
          title: "Error updating location",
          description: e.message,
          variant: "destructive"
      });
      console.error("Error updating location:", e);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setError(msg);
      toast({ title: "Location Error", description: msg, variant: "destructive" });
      return;
    }

    setLoading(true);

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      updateProfileLocation(latitude, longitude);
    };

    const handleError = (err: GeolocationPositionError) => {
      let msg = `Unable to retrieve your location: ${err.message}`;
      switch (err.code) {
        case err.PERMISSION_DENIED:
          msg = "Location access was denied. Please enable it in your browser settings.";
          break;
        case err.POSITION_UNAVAILABLE:
          msg = "Your location could not be determined. Please ensure location services are enabled on your device and try again.";
          break;
        case err.TIMEOUT:
          msg = "The request to get your location timed out. Please try again.";
          break;
      }
      setError(msg);
      toast({ title: "Location Error", description: msg, variant: "destructive" });
      setLoading(false);
      console.error("Geolocation error:", err);
    };

    // First attempt: High accuracy
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (highAccuracyErr) => {
        console.warn("High accuracy location failed, trying low accuracy.", highAccuracyErr);
        
        // If permission is denied, don't try again.
        if (highAccuracyErr.code === highAccuracyErr.PERMISSION_DENIED) {
            handleError(highAccuracyErr);
            return;
        }

        // Second attempt: Low accuracy
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (lowAccuracyErr) => {
            console.error("Low accuracy location also failed.", lowAccuracyErr);
            handleError(lowAccuracyErr); // Show final error
          },
          {
            enableHighAccuracy: false, // Fallback
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };
  
  const hasLocation = !!profile?.latitude && !!profile?.longitude;

  return { error, loading, getLocation, hasLocation, profileLocation: { latitude: profile?.latitude, longitude: profile?.longitude } };
};
