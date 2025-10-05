import React from 'react';
import { useLocation } from '@/hooks/useLocation';
import { useLocationCoords } from '@/hooks/useLocationCoords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, RefreshCw } from 'lucide-react';

/**
 * Demo component showing different ways to access and use location data
 */
const LocationDemo = () => {
  // Method 1: Using the original useLocation hook (as you tried to implement)
  const { profileLocation, getLocation, loading, error, hasLocation } = useLocation();
  const latitude = profileLocation?.latitude;
  const longitude = profileLocation?.longitude;

  // Method 2: Using the new useLocationCoords hook for cleaner code
  const { 
    latitude: lat, 
    longitude: lng, 
    hasCoordinates 
  } = useLocationCoords();

  const handleGetLocation = async () => {
    const newLocation = await getLocation();
    if (newLocation) {
      console.log('New location received:', newLocation);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Demo - Your Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-mono text-sm font-semibold mb-2">Method 1: Your Original Code</h4>
            <pre className="text-xs text-gray-700">
{`const { profileLocation } = useLocation();
const latitude = profileLocation?.latitude;
const longitude = profileLocation?.longitude;`}
            </pre>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Results:</p>
              <div className="text-sm space-y-1">
                <p><strong>Latitude:</strong> {latitude || 'Not available'}</p>
                <p><strong>Longitude:</strong> {longitude || 'Not available'}</p>
                <p><strong>Has Location:</strong> {hasLocation ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Loading:</strong> {loading ? '⏳ Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold">Actions:</p>
              <Button 
                onClick={handleGetLocation} 
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Location
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-red-700 text-sm"><strong>Error:</strong> {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Alternative: Cleaner Implementation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-mono text-sm font-semibold mb-2">Method 2: Using useLocationCoords Hook</h4>
            <pre className="text-xs text-gray-700">
{`const { latitude, longitude, hasCoordinates } = useLocationCoords();`}
            </pre>
          </div>
          
          <div className="text-sm space-y-1">
            <p><strong>Latitude:</strong> {lat || 'Not available'}</p>
            <p><strong>Longitude:</strong> {lng || 'Not available'}</p>
            <p><strong>Has Coordinates:</strong> {hasCoordinates ? '✅ Yes' : '❌ No'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Example usage in a practical scenario */}
      <Card>
        <CardHeader>
          <CardTitle>Practical Usage Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Using Location for Nearby Search:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs text-gray-700">
{`// Example: Search nearby users
if (latitude && longitude) {
  const nearbyUsers = await supabase.rpc('get_nearby_users', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_radius_km: 20
  });
}

// Example: Display distance
const distance = calculateDistance(
  latitude, longitude,
  otherUserLat, otherUserLng
);`}
              </pre>
            </div>
            
            {latitude && longitude && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  🎉 Perfect! Your location is available and ready to use for nearby features!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationDemo;