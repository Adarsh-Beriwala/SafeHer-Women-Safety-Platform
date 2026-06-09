import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import './LiveMap.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '350px',
  borderRadius: '12px',
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1128' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1128' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a89cc4' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2d1054' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2d1054' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a2060' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1128' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0818' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2d1054' }] },
];

const LiveMap = ({ location, sosActive }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const defaultCenter = { lat: 18.5204, lng: 73.8567 }; // Pune
  const center = location ? { lat: location.lat, lng: location.lng } : defaultCenter;

  if (loadError) {
    return (
      <div className="map-placeholder">
        <p>⚠️ Map failed to load. Check your Google Maps API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-placeholder">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="live-map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {location && (
          <Marker
            position={{ lat: location.lat, lng: location.lng }}
            icon={sosActive ? {
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="#fff" stroke-width="3"/>
                  <circle cx="16" cy="16" r="6" fill="#fff"/>
                </svg>
              `),
              scaledSize: { width: 32, height: 32 },
            } : {
              url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="12" fill="#7c3aed" stroke="#fff" stroke-width="3"/>
                  <circle cx="14" cy="14" r="5" fill="#fff"/>
                </svg>
              `),
              scaledSize: { width: 28, height: 28 },
            }}
          />
        )}
      </GoogleMap>

      {location && (
        <div className="map-coords">
          📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          {location.accuracy && <span> • ±{Math.round(location.accuracy)}m</span>}
        </div>
      )}
    </div>
  );
};

export default LiveMap;
