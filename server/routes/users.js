const express = require('express');
const router = express.Router();
const { adminDb } = require('../config/firebase');

/**
 * GET /api/users/:userId
 * Get user profile
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await adminDb.collection('users').doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile (emergency contacts, safety settings)
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Only allow certain fields to be updated
    const allowedFields = [
      'name', 'phone', 'emergencyContacts',
      'safetyWord', 'fakeCallSettings', 'role'
    ];

    const sanitizedUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    sanitizedUpdates.updatedAt = new Date().toISOString();

    await adminDb.collection('users').doc(userId).update(sanitizedUpdates);

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * GET /api/users/:userId/contacts
 * Get emergency contacts for a user
 */
router.get('/:userId/contacts', async (req, res) => {
  try {
    const { userId } = req.params;
    const doc = await adminDb.collection('users').doc(userId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const data = doc.data();
    res.json({ contacts: data.emergencyContacts || [] });
  } catch (error) {
    console.error('Contacts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

module.exports = router;
