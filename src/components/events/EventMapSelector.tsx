
import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface EventMapSelectorProps {
  onLocationChange: (location: LocationData | null) => void;
  initialLocation?: LocationData;
}

const LocationMarker = ({ 
  position, 
  onPositionChange 
}: { 
  position: [number, number] | null; 
  onPositionChange: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const EventMapSelector = ({ onLocationChange, initialLocation }: EventMapSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [selectedAddress, setSelectedAddress] = useState(initialLocation?.address || "");

  useEffect(() => {
    if (initialLocation) {
      setMapCenter([initialLocation.latitude, initialLocation.longitude]);
      setMarkerPosition([initialLocation.latitude, initialLocation.longitude]);
      setSelectedAddress(initialLocation.address);
    }
  }, [initialLocation]);

  const geocodeLocation = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // Using Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const address = result.display_name;

        setMapCenter([lat, lng]);
        setMarkerPosition([lat, lng]);
        setSelectedAddress(address);
        
        onLocationChange({
          address,
          latitude: lat,
          longitude: lng
        });

        toast({
          title: "Location found!",
          description: "Click on the map to adjust the position if needed.",
        });
      } else {
        toast({
          title: "Location not found",
          description: "Try a more specific address or place name.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Search failed",
        description: "Unable to search for location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);

    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      setSelectedAddress(address);
      onLocationChange({
        address,
        latitude: lat,
        longitude: lng
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelectedAddress(address);
      onLocationChange({
        address,
        latitude: lat,
        longitude: lng
      });
    }
  }, [onLocationChange]);

  const clearLocation = () => {
    setMarkerPosition(null);
    setSelectedAddress("");
    setSearchQuery("");
    onLocationChange(null);
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Event Location</label>
      
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                geocodeLocation(searchQuery);
              }
            }}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          onClick={() => geocodeLocation(searchQuery)}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm">{selectedAddress}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLocation}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Map */}
      <div className="h-64 rounded-md overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={markerPosition} 
            onPositionChange={handleMapClick}
          />
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        Search for a location or click on the map to set the event location.
      </p>
    </div>
  );
};

export default EventMapSelector;
