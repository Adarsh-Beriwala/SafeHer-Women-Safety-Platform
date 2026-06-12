import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

let watchId = null;

export const generateSessionId = () => {
  return `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const startTracking = async (sessionId, initialLocation, onLocationUpdate) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported');
  }

  // Push the initial location immediately so the tracking link doesn't hang
  if (initialLocation) {
    try {
      await setDoc(doc(db, 'tracking', sessionId), {
        currentLocation: initialLocation,
        active: true,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.error('Failed to push initial location:', err);
    }
  }

  return new Promise((resolve, reject) => {
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

        // Push to Firestore
        try {
          await setDoc(doc(db, 'tracking', sessionId), {
            currentLocation: locationData,
            active: true,
            updatedAt: Date.now()
          }, { merge: true });
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
      await updateDoc(doc(db, 'tracking', sessionId), { active: false });
    } catch (err) {
      console.error('Failed to update tracking status:', err);
    }
  }
};

export const listenToTracking = (sessionId, callback) => {
  const locationRef = doc(db, 'tracking', sessionId);
  return onSnapshot(locationRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data().currentLocation;
      if (data) {
        callback(data);
      }
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
