import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { House } from '@workspace/api-client-react';
import { formatCurrency } from '@/lib/format';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** Nairobi — the default centre for the whole app. */
export const KENYA_CENTER: [number, number] = [-1.286389, 36.817223];
export const KENYA_DEFAULT_ZOOM = 7;

interface MapProps {
  houses?: House[];
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  /** Position of the pin the user has chosen (location-picker mode). */
  selectedPosition?: [number, number];
  interactive?: boolean;
}

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * MapContainer only reads `center`/`zoom` on first render, so move the map
 * whenever those props change (e.g. after picking a county or town).
 */
function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [map, lat, lng, zoom]);

  // Leaflet measures its box once; re-measure when the layout around it
  // changes (sidebar loading, window resize) so no grey strips appear.
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export function PropertyMap({
  houses = [],
  center = KENYA_CENTER,
  zoom = KENYA_DEFAULT_ZOOM,
  onLocationSelect,
  selectedPosition,
  interactive = true,
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} zoom={zoom} />
      {houses.map((house) => (
        <Marker key={house.id} position={[house.latitude, house.longitude]}>
          <Popup className="min-w-[200px]">
            <div className="space-y-2">
              {house.images && house.images.length > 0 && (
                <img src={house.images[0]} alt={house.title} className="w-full h-24 object-cover rounded-md" />
              )}
              <div>
                <h4 className="font-semibold text-sm line-clamp-1">{house.title}</h4>
                <p className="text-primary font-bold text-xs">{formatCurrency(house.rentPrice)}/mo</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[house.estate, house.town, house.county || house.city].filter(Boolean).join(", ")}
                </p>
              </div>
              <Button size="sm" className="w-full text-xs h-8" asChild>
                <Link href={`/house/${house.id}`}>View Details</Link>
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}

      {onLocationSelect && <LocationPicker onSelect={onLocationSelect} />}
      {selectedPosition && <Marker position={selectedPosition} />}
    </MapContainer>
  );
}
