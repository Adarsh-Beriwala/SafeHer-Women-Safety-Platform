import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listenToTracking } from '../services/locationService';
import { formatTimeAgo } from '../utils/helpers';
import { FiMapPin, FiClock, FiNavigation, FiShield } from 'react-icons/fi';
import './Track.css';

// Fix for leaflet default icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// SOS custom icon (Red)
const sosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Auto-updater component for Leaflet center
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Track = () => {
  const { sessionId } = useParams();
  const [location, setLocation] = useState(null);
  const [pathHistory, setPathHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = listenToTracking(sessionId, (data) => {
      setLocation(data);
      setLastUpdated(data.timestamp);
      setPathHistory((prev) => {
        const newPoint = [data.lat, data.lng];
        // Avoid duplicate points
        const last = prev[prev.length - 1];
        if (last && last[0] === newPoint[0] && last[1] === newPoint[1]) return prev;
        return [...prev, newPoint];
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="track-page">
        <div className="track-error">
          <FiShield />
          <h2>Invalid Tracking Link</h2>
          <p>This tracking session doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  const center = location ? [location.lat, location.lng] : [18.5204, 73.8567]; // Pune default

  return (
    <div className="track-page">
      {/* Header Bar */}
      <div className="track-header">
        <div className="track-header-left">
          <div className="track-logo">
            <FiShield />
          </div>
          <div>
            <h1>SafeHer Live Tracking</h1>
            <p>Session: {sessionId.substring(0, 16)}...</p>
          </div>
        </div>
        <div className="track-header-right">
          {location ? (
            <span className="badge badge-danger">🔴 LIVE</span>
          ) : (
            <span className="badge badge-warning">⏳ Waiting...</span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="track-map-container" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 140px)', zIndex: 1 }}>
        {location ? (
          <MapContainer 
            center={center} 
            zoom={16} 
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater center={center} />
            <Marker 
              position={center} 
              icon={sosIcon} 
            />
            {pathHistory.length > 1 && (
              <Polyline
                positions={pathHistory}
                pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.8 }}
              />
            )}
          </MapContainer>
        ) : (
          <div className="track-loading">
            <div className="spinner"></div>
            <p>Waiting for live location data...</p>
          </div>
        )}
      </div>

      {/* Info Bar */}
      {location && (
        <div className="track-info-bar">
          <div className="track-info-item">
            <FiMapPin />
            <span>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
          </div>
          {location.speed && (
            <div className="track-info-item">
              <FiNavigation />
              <span>{(location.speed * 3.6).toFixed(1)} km/h</span>
            </div>
          )}
          {lastUpdated && (
            <div className="track-info-item">
              <FiClock />
              <span>Updated {formatTimeAgo(lastUpdated)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Track;
