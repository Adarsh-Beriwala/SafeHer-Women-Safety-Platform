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
  try {
    const timestamp = Date.now();
    const filename = `evidence_${timestamp}.jpg`;
    
    // Fallback base64 conversion
    const getBase64 = (blob) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    let downloadUrl;
    try {
      const imageRef = storageRef(storage, `evidence/${userId}/${filename}`);
      // Timeout after 5 seconds to prevent hanging if Storage is not enabled
      const uploadTask = uploadBytes(imageRef, imageBlob);
      const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error('Storage Upload Timeout')), 5000));
      await Promise.race([uploadTask, timeoutTask]);
      downloadUrl = await getDownloadURL(imageRef);
    } catch (storageErr) {
      console.warn("Storage upload failed/timed out, falling back to base64 Firestore:", storageErr);
      downloadUrl = await getBase64(imageBlob);
    }
    
    // Save metadata to Firestore
    await addDoc(collection(db, 'evidence'), {
      userId,
      imageUrl: downloadUrl,
      filename,
      capturedAt: new Date().toISOString(),
      timestamp,
      type: 'image'
    });
    
    return downloadUrl;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
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
  try {
    const timestamp = Date.now();
    const filename = `audio_${timestamp}.webm`;
    
    const getBase64 = (blob) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    let downloadUrl;
    try {
      // Upload to Firebase Storage
      const audioReference = storageRef(storage, `evidence/${userId}/${filename}`);
      const uploadTask = uploadBytes(audioReference, audioBlob);
      const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error('Storage Upload Timeout')), 5000));
      await Promise.race([uploadTask, timeoutTask]);
      downloadUrl = await getDownloadURL(audioReference);
    } catch (storageErr) {
      console.warn("Storage audio upload failed/timed out, falling back to base64 Firestore:", storageErr);
      // Limit base64 audio to prevent 1MB Firestore crash (take only first 500KB of Blob if needed)
      const safeBlob = audioBlob.size > 700000 ? audioBlob.slice(0, 700000, audioBlob.type) : audioBlob;
      downloadUrl = await getBase64(safeBlob);
    }
    
    // Save metadata to Firestore
    await addDoc(collection(db, 'evidence'), {
      userId,
      audioUrl: downloadUrl,
      filename,
      capturedAt: new Date().toISOString(),
      timestamp,
      type: 'audio'
    });
    
    return downloadUrl;
  } catch (error) {
    console.error("Audio upload failed:", error);
    throw error;
  }
};

export const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: true
    });
    return stream;
  } catch (error) {
    console.warn('Ideal camera constraints failed, trying basic fallback:', error);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      return stream;
    } catch (fallbackError) {
      console.error('Camera/Mic access denied or unavailable:', fallbackError);
      throw fallbackError;
    }
  }
};

export const stopCamera = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};
