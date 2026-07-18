import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface DeliveryMapProps {
  className?: string;
}

const KATRAJ_COORDS: [number, number] = [18.4575, 73.8677];

// Animation component
const FadeInMap = () => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.opacity = '0';
    container.style.transition = 'opacity 1s ease-in-out';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 100);
  }, [map]);
  return null;
};

export const DeliveryMap: React.FC<DeliveryMapProps> = ({ className }) => {
  return (
    <div className={`relative w-full max-w-4xl mx-auto overflow-hidden rounded-3xl shadow-soft border border-border group ${className}`}>
      <div className="h-[400px] w-full relative">
        <MapContainer
          center={KATRAJ_COORDS}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full rounded-3xl"
        >
          <FadeInMap />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Primary Zone - 5km */}
          <Circle
            center={KATRAJ_COORDS}
            pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15, weight: 2 }}
            radius={5000}
          >
            <Popup>Primary Zone (5 km)</Popup>
          </Circle>

          {/* Extended Zone - 10km */}
          <Circle
            center={KATRAJ_COORDS}
            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.05, weight: 2, dashArray: '5, 10' }}
            radius={10000}
          >
            <Popup>Extended Zone (10 km)</Popup>
          </Circle>

          <Marker position={KATRAJ_COORDS}>
            <Popup className="font-display">
              <div className="text-center p-1">
                <strong className="text-leaf">Etato Foods</strong><br />
                Katraj Dairy Kitchen
              </div>
            </Popup>
          </Marker>

          {/* Legend Overlay */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-border pointer-events-auto">
            <h4 className="text-xs font-bold text-primary mb-3">Delivery Zones</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-xs font-medium">Primary Zone (5 km)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f97316] border border-dashed border-orange-600" />
                <span className="text-xs font-medium">Extended Zone (10 km)</span>
              </div>
            </div>
          </div>
        </MapContainer>
      </div>
    </div>
  );
};
