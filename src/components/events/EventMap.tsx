
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface EventMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  className?: string;
}

const EventMap = ({ latitude, longitude, title, address, className = "h-64" }: EventMapProps) => {
  return (
    <div className={`rounded-md overflow-hidden border ${className}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-center">
              <div className="font-medium">{title}</div>
              {address && <div className="text-sm text-muted-foreground mt-1">{address}</div>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default EventMap;
