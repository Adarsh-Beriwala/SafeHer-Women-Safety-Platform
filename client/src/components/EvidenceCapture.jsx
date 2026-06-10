import { useRef, useEffect, useState } from 'react';
import { FiCamera, FiCheck, FiX } from 'react-icons/fi';
import './EvidenceCapture.css';

const EvidenceCapture = ({ stream, onCapture, onAudioCapture, lastCaptureUrl }) => {
  const videoRef = useRef(null);
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => setHasStream(true)).catch(() => {});
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  // Auto capture after stream is established
  useEffect(() => {
    if (hasStream) {
      let photoCount = 0;
      
      // Take 10 photos (1 per second)
      const photoInterval = setInterval(() => {
        if (photoCount < 10) {
          handleCapture();
          photoCount++;
        } else {
          clearInterval(photoInterval);
        }
      }, 1000);

      // Record 10 seconds of audio
      if (stream) {
        try {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
          };
          
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            if (onAudioCapture) {
               onAudioCapture(audioBlob);
            }
          };
          
          mediaRecorder.start();
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
          }, 10000); // 10 seconds
        } catch (err) {
          console.error("Audio recording failed:", err);
        }
      }

      return () => {
        clearInterval(photoInterval);
      };
    }
  }, [hasStream]);

  const handleCapture = async () => {
    if (!videoRef.current || !hasStream) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob && onCapture) {
        onCapture(blob);
      }
    }, 'image/jpeg', 0.85);
  };

  return (
    <div className="evidence-capture">
      <div className="evidence-video-wrapper">
        <video ref={videoRef} muted playsInline className="evidence-video" />
        {!hasStream && (
          <div className="evidence-placeholder">
            <FiCamera />
            <p>Camera will activate on SOS</p>
          </div>
        )}
        {hasStream && (
          <div className="evidence-status">
            <span className="evidence-live-dot"></span> LIVE
          </div>
        )}
      </div>

      {hasStream && (
        <button className="btn btn-ghost btn-sm evidence-capture-btn" onClick={handleCapture}>
          <FiCamera /> Capture Now
        </button>
      )}

      {lastCaptureUrl && (
        <div className="evidence-last-capture" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <img src={lastCaptureUrl} alt="Captured Evidence" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #10b981' }} />
          <div>
            <FiCheck className="evidence-check" style={{ color: '#10b981', marginRight: '5px' }} />
            <span style={{ color: '#a89cc4', fontSize: '14px' }}>Evidence captured & saved</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceCapture;
