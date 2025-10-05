import React from 'react';
import { useLocation } from '@/hooks/useLocation';

const LocationExample = () => {
  const { profileLocation } = useLocation();
  const latitude = profileLocation?.latitude;
  const longitude = profileLocation?.longitude;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Current Location</h3>
      {latitude && longitude ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Latitude:</strong> {latitude}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Longitude:</strong> {longitude}
          </p>
          <p className="text-xs text-green-600">
            ✓ Location is available
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No location data available. Please enable location sharing.
        </p>
      )}
    </div>
  );
};

export default LocationExample;