const admin = require('firebase-admin');

// Initialize Firebase Admin
// In production, use service account JSON file
// For development, use Application Default Credentials
let app;
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const serviceAccount = require(serviceAccountPath);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Fallback: initialize without credentials (limited functionality)
    app = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'safeher-app',
    });
  }
} catch (error) {
  console.error('Firebase Admin init error:', error.message);
  app = admin.initializeApp();
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

module.exports = { admin, adminDb, adminAuth };
