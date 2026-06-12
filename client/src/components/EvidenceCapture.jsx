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
      // Auto-capture up to 10 photos (1 every 2 seconds)
      let captureCount = 0;
      let captureInterval;
      
      const startCapturing = () => {
        // Take immediate first shot
        handleCapture();
        captureCount++;
        
        captureInterval = setInterval(() => {
          if (captureCount >= 10) {
            clearInterval(captureInterval);
            return;
          }
          handleCapture();
          captureCount++;
        }, 2000);
      };

      // Delay first capture by 1s to let camera sensor adjust to light
      const warmupTimeout = setTimeout(startCapturing, 1000);

      // Record 10 seconds of audio reliably
      if (stream) {
        try {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            if (audioChunks.length > 0) {
              const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
              if (onAudioCapture) {
                 onAudioCapture(audioBlob);
              }
            } else {
              console.warn("Audio recording stopped but no chunks were captured.");
            }
          };
          
          // Emit chunks every 1000ms
          mediaRecorder.start(1000);
          
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.requestData();
              setTimeout(() => mediaRecorder.stop(), 100);
            }
          }, 10000); // 10 seconds limit
        } catch (err) {
          console.error("Audio recording failed:", err);
        }
      }

      return () => {
        clearTimeout(warmupTimeout);
        if (captureInterval) clearInterval(captureInterval);
      };
    }
  }, [hasStream]);

  const handleCapture = async () => {
    try {
      if (!videoRef.current || !hasStream) return;
      
      if (videoRef.current.readyState < 2) return;

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
    } catch (err) {
      console.error("Canvas drawImage Error:", err);
    }
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
