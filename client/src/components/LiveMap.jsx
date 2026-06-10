import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

// Fix for leaflet default icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const safeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LiveMap = ({ location, sosActive }) => {
  const defaultCenter = [18.5204, 73.8567]; // Pune
  const center = location ? [location.lat, location.lng] : defaultCenter;

  return (
    <div className="live-map-container" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '350px', borderRadius: '12px', overflow: 'hidden', zIndex: 1 }}>
      <MapContainer 
        center={center} 
        zoom={15} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} />
        {location && (
          <Marker 
            position={[location.lat, location.lng]} 
            icon={sosActive ? sosIcon : safeIcon} 
          />
        )}
      </MapContainer>

      {location && (
        <div className="map-coords" style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, background: 'rgba(26, 17, 40, 0.8)', color: '#a89cc4', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>
          📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          {location.accuracy && <span> • ±{Math.round(location.accuracy)}m</span>}
        </div>
      )}
    </div>
  );
};

export default LiveMap;
