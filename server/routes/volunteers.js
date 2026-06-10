const express = require('express');
const router = express.Router();
const { adminDb } = require('../config/firebase');

/**
 * POST /api/volunteers/toggle
 * Toggle volunteer on-duty / off-duty status
 */
router.post('/toggle', async (req, res) => {
  try {
    const { userId, name, location, isOnDuty } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const volunteerData = {
      userId,
      name: name || 'Volunteer',
      isOnDuty: !!isOnDuty,
      lastUpdated: new Date().toISOString(),
    };

    if (isOnDuty && location) {
      volunteerData.lat = location.lat;
      volunteerData.lng = location.lng;
    }

    await adminDb.collection('volunteers').doc(userId).set(volunteerData, { merge: true });

    res.json({
      success: true,
      message: isOnDuty ? 'You are now on duty!' : 'You are now off duty.',
      volunteer: volunteerData,
    });
  } catch (error) {
    console.error('Volunteer toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle volunteer status' });
  }
});

/**
 * POST /api/volunteers/update-location
 * Update volunteer's current location
 */
router.post('/update-location', async (req, res) => {
  try {
    const { userId, location } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ error: 'userId and location required' });
    }

    await adminDb.collection('volunteers').doc(userId).update({
      lat: location.lat,
      lng: location.lng,
      lastUpdated: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Volunteer location update error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

/**
 * GET /api/volunteers/nearby
 * Find on-duty volunteers near a given location
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query params required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius) || 5; // Default 5km

    const snapshot = await adminDb
      .collection('volunteers')
      .where('isOnDuty', '==', true)
      .get();

    const nearby = [];
    snapshot.forEach((doc) => {
      const vol = doc.data();
      const distance = calculateDistance(userLat, userLng, vol.lat, vol.lng);
      if (distance <= maxRadius) {
        nearby.push({
          id: doc.id,
          name: vol.name,
          distance: Math.round(distance * 100) / 100,
          lastUpdated: vol.lastUpdated,
        });
      }
    });

    nearby.sort((a, b) => a.distance - b.distance);

    res.json({
      volunteers: nearby.slice(0, 10),
      total: nearby.length,
    });
  } catch (error) {
    console.error('Nearby volunteers error:', error);
    res.status(500).json({ error: 'Failed to find nearby volunteers' });
  }
});

/**
 * GET /api/volunteers/stats
 * Get overall volunteer stats
 */
router.get('/stats', async (req, res) => {
  try {
    const allSnapshot = await adminDb.collection('volunteers').get();
    const onDutySnapshot = await adminDb
      .collection('volunteers')
      .where('isOnDuty', '==', true)
      .get();

    res.json({
      totalVolunteers: allSnapshot.size,
      onDutyCount: onDutySnapshot.size,
    });
  } catch (error) {
    console.error('Volunteer stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * (Math.PI / 180); }

module.exports = router;
