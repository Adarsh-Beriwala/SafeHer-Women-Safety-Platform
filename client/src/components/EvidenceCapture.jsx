import { useRef, useEffect, useState } from 'react';
import { FiCamera, FiCheck, FiX } from 'react-icons/fi';
import './EvidenceCapture.css';

const EvidenceCapture = ({ stream, onCapture, lastCaptureUrl }) => {
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
        <div className="evidence-last-capture">
          <FiCheck className="evidence-check" />
          <span>Evidence captured & uploaded</span>
        </div>
      )}
    </div>
  );
};

export default EvidenceCapture;
