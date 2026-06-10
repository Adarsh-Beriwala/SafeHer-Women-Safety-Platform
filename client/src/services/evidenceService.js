import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from './firebase';

export const captureEvidence = async (videoElement) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to capture image'));
          }
        },
        'image/jpeg',
        0.85
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const uploadEvidence = async (userId, imageBlob) => {
  const timestamp = Date.now();
  const filename = `evidence_${timestamp}.jpg`;
  
  // Convert blob to base64
  const base64data = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    reader.onloadend = () => resolve(reader.result);
  });

  await addDoc(collection(db, 'evidence'), {
    userId,
    imageUrl: base64data,
    filename,
    capturedAt: new Date().toISOString(),
    timestamp,
    type: 'image'
  });

  return base64data;
};

export const fetchUserEvidence = async (userId) => {
  try {
    const { query, where, getDocs, limit } = await import('firebase/firestore');
    const evidenceRef = collection(db, 'evidence');
    // Remove orderBy to avoid requiring a manual Firestore composite index
    const q = query(evidenceRef, where("userId", "==", userId), limit(30));
    const querySnapshot = await getDocs(q);
    
    let evidenceList = [];
    querySnapshot.forEach((doc) => {
      evidenceList.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort locally in JS
    evidenceList.sort((a, b) => b.timestamp - a.timestamp);
    
    return evidenceList;
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return [];
  }
};

export const uploadAudio = async (userId, audioBlob) => {
  const timestamp = Date.now();
  const filename = `audio_${timestamp}.webm`;
  
  // Convert blob to base64
  const base64data = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => resolve(reader.result);
  });

  await addDoc(collection(db, 'evidence'), {
    userId,
    audioUrl: base64data,
    filename,
    capturedAt: new Date().toISOString(),
    timestamp,
    type: 'audio'
  });

  return base64data;
};

export const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
      audio: true // Enabled audio for recording
    });
    return stream;
  } catch (error) {
    console.error('Camera/Mic access denied:', error);
    throw error;
  }
};

export const stopCamera = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};
