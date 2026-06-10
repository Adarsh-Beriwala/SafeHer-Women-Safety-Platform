const express = require('express');
const router = express.Router();
const { adminDb } = require('../config/firebase');

/**
 * GET /api/evidence/:userId
 * Get all evidence records for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit: queryLimit } = req.query;

    const maxResults = parseInt(queryLimit) || 50;

    const snapshot = await adminDb
      .collection('evidence')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(maxResults)
      .get();

    const evidence = [];
    snapshot.forEach((doc) => {
      evidence.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      evidence,
      total: evidence.length,
    });
  } catch (error) {
    console.error('Evidence fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

/**
 * POST /api/evidence/log
 * Log evidence metadata (uploaded from client to Firebase Storage)
 */
router.post('/log', async (req, res) => {
  try {
    const { userId, imageUrl, filename, sosEventId } = req.body;

    if (!userId || !imageUrl) {
      return res.status(400).json({ error: 'userId and imageUrl required' });
    }

    const evidenceRecord = {
      userId,
      imageUrl,
      filename: filename || `evidence_${Date.now()}.jpg`,
      sosEventId: sosEventId || null,
      capturedAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    const docRef = await adminDb.collection('evidence').add(evidenceRecord);

    res.json({
      success: true,
      evidenceId: docRef.id,
      evidence: evidenceRecord,
    });
  } catch (error) {
    console.error('Evidence log error:', error);
    res.status(500).json({ error: 'Failed to log evidence' });
  }
});

/**
 * DELETE /api/evidence/:evidenceId
 * Delete an evidence record
 */
router.delete('/:evidenceId', async (req, res) => {
  try {
    const { evidenceId } = req.params;

    await adminDb.collection('evidence').doc(evidenceId).delete();

    res.json({ success: true, message: 'Evidence deleted' });
  } catch (error) {
    console.error('Evidence delete error:', error);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

module.exports = router;
