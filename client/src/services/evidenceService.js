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
  const fileRef = storageRef(storage, `evidence/${userId}/${filename}`);

  await uploadBytes(fileRef, imageBlob, {
    contentType: 'image/jpeg',
    customMetadata: {
      capturedAt: new Date().toISOString(),
      userId: userId,
    },
  });

  const downloadURL = await getDownloadURL(fileRef);

  // Save metadata to Firestore
  await addDoc(collection(db, 'evidence'), {
    userId,
    imageUrl: downloadURL,
    filename,
    capturedAt: new Date().toISOString(),
    timestamp,
  });

  return downloadURL;
};

export const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
    });
    return stream;
  } catch (error) {
    console.error('Camera access denied:', error);
    throw error;
  }
};

export const stopCamera = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};
