import { ref, set, onValue, remove } from 'firebase/database';
import { rtdb } from './firebase';

let watchId = null;

export const generateSessionId = () => {
  return `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const startTracking = (sessionId, onLocationUpdate) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: Date.now(),
        };

        // Push to Firebase Realtime DB
        try {
          await set(ref(rtdb, `tracking/${sessionId}/currentLocation`), locationData);
        } catch (err) {
          console.error('Failed to push location:', err);
        }

        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }

        resolve(locationData);
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export const stopTracking = async (sessionId) => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  if (sessionId) {
    try {
      await set(ref(rtdb, `tracking/${sessionId}/active`), false);
    } catch (err) {
      console.error('Failed to update tracking status:', err);
    }
  }
};

export const listenToTracking = (sessionId, callback) => {
  const locationRef = ref(rtdb, `tracking/${sessionId}/currentLocation`);
  return onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

export const getTrackingLink = (sessionId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/track/${sessionId}`;
};
