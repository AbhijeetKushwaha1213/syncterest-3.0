import { useLocation } from './useLocation';

/**
 * Custom hook to easily extract latitude and longitude coordinates
 * from the user's profile location.
 * 
 * @returns Object containing latitude, longitude, hasLocation, and the original profileLocation
 */
export const useLocationCoords = () => {
  const { profileLocation, ...rest } = useLocation();
  
  const latitude = profileLocation?.latitude;
  const longitude = profileLocation?.longitude;
  const hasCoordinates = !!(latitude && longitude);
  
  return {
    latitude,
    longitude,
    hasCoordinates,
    profileLocation,
    ...rest
  };
};

export default useLocationCoords;