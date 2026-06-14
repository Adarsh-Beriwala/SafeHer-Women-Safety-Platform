import { doc, setDoc, getDocs, collection, query, where, deleteField, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { calculateDistance } from '../utils/haversine';
import { sendVolunteerAlert } from './alertService';

export const goOnDuty = async (userId, location, userName) => {
  await setDoc(doc(db, 'volunteers', userId), {
    userId,
    name: userName,
    lat: location.lat,
    lng: location.lng,
    isOnDuty: true,
    lastUpdated: new Date().toISOString(),
  }, { merge: true });
};

export const goOffDuty = async (userId) => {
  await updateDoc(doc(db, 'volunteers', userId), {
    isOnDuty: false,
    lastUpdated: new Date().toISOString(),
  });
};

export const toggleVolunteerDuty = async (userId, userName, location, newStatus) => {
  if (newStatus) {
    await goOnDuty(userId, location, userName);
  } else {
    await goOffDuty(userId);
  }
};

export const updateVolunteerLocation = async (userId, location) => {
  await updateDoc(doc(db, 'volunteers', userId), {
    lat: location.lat,
    lng: location.lng,
    lastUpdated: new Date().toISOString(),
  });
};

export const findNearbyVolunteers = async (userLocation, radiusKm = 5) => {
  const q = query(
    collection(db, 'volunteers'),
    where('isOnDuty', '==', true)
  );

  const snapshot = await getDocs(q);
  const volunteers = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      data.lat,
      data.lng
    );

    if (distance <= radiusKm) {
      volunteers.push({
        ...data,
        id: doc.id,
        distance: Math.round(distance * 100) / 100,
      });
    }
  });

  // Sort by distance (nearest first)
  volunteers.sort((a, b) => a.distance - b.distance);

  return volunteers.slice(0, 5); // Return top 5 nearest
};

export const alertNearbyVolunteers = async (userLocation, victimData, trackingLink) => {
  const volunteers = await findNearbyVolunteers(userLocation);
  const results = [];

  for (const volunteer of volunteers) {
    // We need volunteer email - get from users collection
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', volunteer.userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const result = await sendVolunteerAlert(
          userData.email || '',
          volunteer.name,
          victimData,
          trackingLink
        );

        // Also send Twilio SMS to the volunteer if they have a phone number
        if (userData.phone) {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await fetch(`${apiUrl}/api/sos/sms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userName: victimData.name,
                trackingLink: trackingLink,
                userPhone: victimData.phone,
                toPhone: userData.phone
              })
            });
            console.log(`Twilio SMS sent to volunteer ${volunteer.name}`);
          } catch (smsErr) {
            console.error(`Failed to send SMS to volunteer ${volunteer.name}:`, smsErr);
          }
        }

        results.push({ volunteer: volunteer.name, distance: volunteer.distance, ...result });
      } else {
        console.warn('Volunteer user doc not found:', volunteer.userId);
        results.push({ volunteer: volunteer.name, distance: volunteer.distance, status: 'failed' });
      }
    } catch (err) {
      console.error(`Failed to alert volunteer ${volunteer.name}:`, err);
      results.push({ volunteer: volunteer.name, distance: volunteer.distance, status: 'failed' });
    }
  }

  return results;
};
