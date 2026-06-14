const express = require('express');
const router = express.Router();
const { adminDb } = require('../config/firebase');

/**
 * POST /api/sos/trigger
 * Trigger SOS - logs the event and notifies volunteers
 */
router.post('/trigger', async (req, res) => {
  try {
    const { userId, userName, userPhone, location, sessionId, trackingLink, timestamp } = req.body;

    if (!userId || !location) {
      return res.status(400).json({ error: 'userId and location are required' });
    }

    // 1. Log SOS event to Firestore
    const sosEvent = {
      userId,
      userName: userName || 'Unknown',
      userPhone: userPhone || '',
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || null,
      },
      sessionId: sessionId || null,
      trackingLink: trackingLink || null,
      status: 'active',
      triggeredAt: timestamp || new Date().toISOString(),
      resolvedAt: null,
    };

    const docRef = await adminDb.collection('sosEvents').add(sosEvent);

    // 2. Find nearby volunteers (within 5km radius)
    const volunteersSnapshot = await adminDb
      .collection('volunteers')
      .where('isOnDuty', '==', true)
      .get();

    const nearbyVolunteers = [];
    volunteersSnapshot.forEach((doc) => {
      const vol = doc.data();
      const distance = calculateDistance(
        location.lat, location.lng,
        vol.lat, vol.lng
      );
      if (distance <= 5) {
        nearbyVolunteers.push({
          id: doc.id,
          name: vol.name,
          distance: Math.round(distance * 100) / 100,
        });
      }
    });

    // Sort by distance
    nearbyVolunteers.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      sosEventId: docRef.id,
      nearbyVolunteers: nearbyVolunteers.slice(0, 5),
      message: `SOS logged. ${nearbyVolunteers.length} volunteer(s) nearby.`,
    });
  } catch (error) {
    console.error('SOS trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger SOS' });
  }
});

/**
 * POST /api/sos/resolve
 * Resolve an active SOS event
 */
router.post('/resolve', async (req, res) => {
  try {
    const { sosEventId } = req.body;

    if (!sosEventId) {
      return res.status(400).json({ error: 'sosEventId is required' });
    }

    await adminDb.collection('sosEvents').doc(sosEventId).update({
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'SOS resolved' });
  } catch (error) {
    console.error('SOS resolve error:', error);
    res.status(500).json({ error: 'Failed to resolve SOS' });
  }
});

/**
 * POST /api/sos/sms
 * Send SMS using Twilio (For Demo/Video purposes)
 */
router.post('/sms', async (req, res) => {
  try {
    const { userName, trackingLink, userPhone, toPhone } = req.body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
      return res.status(400).json({ error: 'Twilio credentials not configured in server/.env' });
    }

    const client = require('twilio')(accountSid, authToken);

    const messageBody = `🚨 URGENT: SOS Alert from ${userName || 'SafeHer User'}. They need immediate help! Track live location: ${trackingLink || 'N/A'}`;

    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhone,
      to: toPhone || process.env.TWILIO_VERIFIED_PHONE // Fallback to verified phone for free trials
    });

    res.json({ success: true, messageId: message.sid });
  } catch (error) {
    console.error('Twilio SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS via Twilio', details: error.message });
  }
});

/**
 * GET /api/sos/history/:userId
 * Get SOS event history for a user
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await adminDb
      .collection('sosEvents')
      .where('userId', '==', userId)
      .orderBy('triggeredAt', 'desc')
      .limit(20)
      .get();

    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.json({ events });
  } catch (error) {
    console.error('SOS history error:', error);
    res.status(500).json({ error: 'Failed to fetch SOS history' });
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
