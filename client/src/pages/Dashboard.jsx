import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { sendSOSAlert } from '../services/alertService';
import { startTracking, stopTracking, generateSessionId, getTrackingLink, getCurrentPosition } from '../services/locationService';
import { startCamera, stopCamera, captureEvidence, uploadEvidence } from '../services/evidenceService';
import { alertNearbyVolunteers } from '../services/volunteerService';
import SOSButton from '../components/SOSButton';
import VoiceListener from '../components/VoiceListener';
import EvidenceCapture from '../components/EvidenceCapture';
import LiveMap from '../components/LiveMap';
import {
  FiMapPin, FiCamera, FiMic, FiShield, FiUser,
  FiArrowRight, FiPhone, FiCpu, FiMessageCircle,
  FiClock, FiUsers, FiLink, FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [trackingLink, setTrackingLink] = useState('');
  const [cameraStream, setCameraStream] = useState(null);
  const [lastCaptureUrl, setLastCaptureUrl] = useState(null);
  const [sosLog, setSosLog] = useState([]);
  const videoRef = useRef(null);

  // Get initial location
  useEffect(() => {
    getCurrentPosition()
      .then(setCurrentLocation)
      .catch(() => console.log('Location not available yet'));
  }, []);

  const addLog = (message) => {
    setSosLog((prev) => [{ message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const triggerSOS = useCallback(async () => {
    if (sosActive) return;
    setSosActive(true);
    addLog('🚨 SOS TRIGGERED');

    const sosToast = toast.loading('🚨 SOS Activated! Sending alerts...');

    try {
      // 1. Get current location
      let location = currentLocation;
      try {
        location = await getCurrentPosition();
        setCurrentLocation(location);
        addLog('📍 Location acquired');
      } catch {
        addLog('⚠️ Using last known location');
      }

      // 2. Generate tracking session
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      const link = getTrackingLink(newSessionId);
      setTrackingLink(link);
      addLog('🔗 Tracking link generated');

      // 3. Start live tracking
      startTracking(newSessionId, (loc) => {
        setCurrentLocation(loc);
      }).catch(console.error);
      addLog('📡 Live tracking started');

      // 4. Capture evidence
      try {
        const stream = await startCamera();
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
          canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
          if (blob) {
            const url = await uploadEvidence(currentUser.uid, blob);
            setLastCaptureUrl(url);
            addLog('📸 Evidence captured & uploaded');
            toast.success('📸 Evidence captured');
          }
        }
      } catch (camErr) {
        console.error('Camera error:', camErr);
        addLog('⚠️ Camera not available');
      }

      // 5. Send alerts
      if (userProfile?.emergencyContacts?.length > 0) {
        const results = await sendSOSAlert(
          userProfile.emergencyContacts,
          { name: userProfile.name, phone: userProfile.phone },
          location,
          link
        );
        const sentCount = results.filter((r) => r.status === 'sent').length;
        addLog(`📧 Alerts sent to ${sentCount} contact(s)`);
        toast.success(`📧 Alerts sent to ${sentCount} contact(s)`);
      } else {
        addLog('⚠️ No emergency contacts configured');
        toast.error('No emergency contacts! Add them in Profile.');
      }

      // 6. Alert nearby volunteers
      if (location) {
        alertNearbyVolunteers(location, { name: userProfile.name }, link)
          .then((results) => {
            if (results.length > 0) {
              addLog(`🤝 ${results.length} volunteer(s) alerted`);
              toast.success(`🤝 ${results.length} volunteer(s) nearby alerted`);
            }
          })
          .catch(console.error);
      }

      toast.dismiss(sosToast);
      toast.success('🚨 SOS Alert Complete!', { duration: 5000 });
    } catch (error) {
      console.error('SOS Error:', error);
      toast.dismiss(sosToast);
      toast.error('SOS alert partially failed');
      addLog('❌ SOS error occurred');
    }
  }, [sosActive, currentLocation, currentUser, userProfile]);

  const deactivateSOS = useCallback(() => {
    if (sessionId) stopTracking(sessionId);
    if (cameraStream) {
      stopCamera(cameraStream);
      setCameraStream(null);
    }
    setSosActive(false);
    setSessionId(null);
    setTrackingLink('');
    setLastCaptureUrl(null);
    setSosLog([]);
    toast.success("✅ You're marked safe!");
  }, [sessionId, cameraStream]);

  return (
    <div className="dashboard">
      {/* Hidden video element for evidence capture */}
      <video ref={videoRef} style={{ display: 'none' }} muted playsInline />

      <div className="container">
        {/* Header */}
        <div className="dashboard-header animate-fadeInUp">
          <div>
            <h1>Safety Dashboard</h1>
            <p>Welcome back, <strong>{userProfile?.name || 'User'}</strong></p>
          </div>
          <div className="dashboard-status">
            {sosActive ? (
              <span className="badge badge-danger">🚨 SOS ACTIVE</span>
            ) : (
              <span className="badge badge-success">✅ All Safe</span>
            )}
          </div>
        </div>

        {/* No contacts warning */}
        {(!userProfile?.emergencyContacts || userProfile.emergencyContacts.length === 0) && (
          <div className="dashboard-alert animate-fadeInUp delay-1">
            <FiAlertTriangle />
            <p>Add emergency contacts to receive SOS alerts!</p>
            <Link to="/profile" className="btn btn-primary btn-sm"><FiUser /> Add Contacts</Link>
          </div>
        )}

        {/* SOS + Voice Section */}
        <div className="dashboard-sos-section animate-fadeInUp delay-1">
          <SOSButton onTrigger={triggerSOS} onDeactivate={deactivateSOS} isActive={sosActive} />
          <VoiceListener
            triggerWord={userProfile?.safetyWord || 'help me'}
            onTrigger={triggerSOS}
          />
        </div>

        {/* Tracking Link */}
        {trackingLink && (
          <div className="tracking-link-box animate-slideDown">
            <FiLink />
            <span>Live Tracking:</span>
            <a href={trackingLink} target="_blank" rel="noopener noreferrer">{trackingLink}</a>
          </div>
        )}

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Live Map - Full Width */}
          <div className="dashboard-card large glass-card animate-fadeInUp delay-2">
            <div className="card-title"><FiMapPin /> Live Location</div>
            <LiveMap location={currentLocation} sosActive={sosActive} sessionId={sessionId} />
          </div>

          {/* Evidence Capture */}
          <div className="dashboard-card glass-card animate-fadeInUp delay-3">
            <div className="card-title"><FiCamera /> Evidence Capture</div>
            <EvidenceCapture stream={cameraStream} lastCaptureUrl={lastCaptureUrl} />
          </div>

          {/* SOS Activity Log */}
          <div className="dashboard-card glass-card animate-fadeInUp delay-4">
            <div className="card-title"><FiShield /> Activity Log</div>
            <div className="sos-log">
              {sosLog.length === 0 ? (
                <p className="log-empty">No activity yet. Trigger SOS to see logs here.</p>
              ) : (
                sosLog.map((log, i) => (
                  <div key={i} className="log-entry">
                    <span className="log-time">{log.time}</span>
                    <span className="log-msg">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Coming Soon Cards */}
          <div className="dashboard-card glass-card coming-soon animate-fadeInUp delay-5">
            <div className="card-title"><FiPhone /> Fake Call</div>
            <div className="coming-soon-content">
              <p>Simulate realistic incoming calls</p>
              <span className="badge badge-warning">Coming Day 3</span>
            </div>
          </div>

          <div className="dashboard-card glass-card coming-soon animate-fadeInUp delay-5">
            <div className="card-title"><FiUsers /> Volunteer Network</div>
            <div className="coming-soon-content">
              <p>Nearby volunteer dispatch system</p>
              <span className="badge badge-warning">Coming Day 3</span>
            </div>
          </div>

          <div className="dashboard-card glass-card coming-soon animate-fadeInUp delay-6">
            <div className="card-title"><FiCpu /> AI Safety Score</div>
            <div className="coming-soon-content">
              <p>ML-powered area safety ratings</p>
              <span className="badge badge-warning">Coming Day 4</span>
            </div>
          </div>

          <div className="dashboard-card glass-card coming-soon animate-fadeInUp delay-6">
            <div className="card-title"><FiMessageCircle /> AI Chatbot</div>
            <div className="coming-soon-content">
              <p>Gemini-powered safety advice</p>
              <span className="badge badge-warning">Coming Day 4</span>
            </div>
          </div>

          <div className="dashboard-card glass-card coming-soon animate-fadeInUp delay-6">
            <div className="card-title"><FiClock /> Safety Check-in</div>
            <div className="coming-soon-content">
              <p>Periodic auto-SOS check-in timer</p>
              <span className="badge badge-warning">Coming Day 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
