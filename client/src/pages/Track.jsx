import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { listenToTracking } from '../services/locationService';
import { formatTimeAgo } from '../utils/helpers';
import { FiMapPin, FiClock, FiNavigation, FiShield } from 'react-icons/fi';
import './Track.css';

const mapContainerStyle = { width: '100%', height: '100%' };

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1128' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1128' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a89cc4' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a2060' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0818' }] },
];

const Track = () => {
  const { sessionId } = useParams();
  const [location, setLocation] = useState(null);
  const [pathHistory, setPathHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = listenToTracking(sessionId, (data) => {
      setLocation(data);
      setLastUpdated(data.timestamp);
      setPathHistory((prev) => {
        const newPoint = { lat: data.lat, lng: data.lng };
        // Avoid duplicate points
        const last = prev[prev.length - 1];
        if (last && last.lat === newPoint.lat && last.lng === newPoint.lng) return prev;
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
      <div className="track-map-container">
        {isLoaded && location ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={{ lat: location.lat, lng: location.lng }}
            zoom={16}
            options={{
              styles: darkMapStyle,
              disableDefaultUI: true,
              zoomControl: true,
              fullscreenControl: true,
            }}
          >
            <Marker
              position={{ lat: location.lat, lng: location.lng }}
              icon={{
                url: 'data:image/svg+xml,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="#ef4444" stroke="#fff" stroke-width="3"/>
                    <circle cx="18" cy="18" r="6" fill="#fff"/>
                  </svg>
                `),
                scaledSize: { width: 36, height: 36 },
              }}
            />
            {pathHistory.length > 1 && (
              <Polyline
                path={pathHistory}
                options={{
                  strokeColor: '#7c3aed',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="track-loading">
            <div className="spinner"></div>
            <p>{!isLoaded ? 'Loading map API...' : 'Waiting for live location data...'}</p>
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
