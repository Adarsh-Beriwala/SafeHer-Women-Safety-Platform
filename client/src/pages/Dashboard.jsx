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
import FakeCall from '../components/FakeCall';
import PeriodicCheckIn from '../components/PeriodicCheckIn';
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
  const [evidenceVault, setEvidenceVault] = useState([]);
  const [dispatchedVolunteers, setDispatchedVolunteers] = useState([]);
  const videoRef = useRef(null);

  // Get initial location and evidence
  useEffect(() => {
    getCurrentPosition()
      .then(setCurrentLocation)
      .catch(() => console.log('Location not available yet'));

    if (currentUser?.uid) {
      import('../services/evidenceService').then(({ fetchUserEvidence }) => {
        fetchUserEvidence(currentUser.uid).then(setEvidenceVault);
      });
    }
  }, [currentUser]);

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
      const link = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : getTrackingLink(newSessionId);
      setTrackingLink(link);
      addLog('🔗 Google Maps link generated');

      // 3. Start live tracking (push immediate location)
      startTracking(newSessionId, location, (loc) => {
        setCurrentLocation(loc);
      }).catch(console.error);
      addLog('📡 Live tracking started');

      // 4. Start Camera for Evidence
      try {
        const stream = await startCamera();
        setCameraStream(stream);
        addLog('📸 Camera started, auto-capturing...');
      } catch (camErr) {
        console.error('Camera error:', camErr);
        addLog('⚠️ Camera not available');
      }

      // 5. Send alerts (In-App & Twilio SMS)
      if (userProfile?.emergencyContacts?.length > 0) {
        // Send In-App Alerts
        const results = await sendSOSAlert(
          userProfile.emergencyContacts,
          { name: userProfile.name, phone: userProfile.phone },
          location,
          link
        );
        const sentCount = results.filter((r) => r.status === 'sent').length;
        
        // Trigger Twilio SMS to all emergency contacts
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
          
          for (const contact of userProfile.emergencyContacts) {
            if (!contact.phone) continue;
            
            addLog(`🔄 Attempting to send Twilio SMS to ${contact.name || 'Contact'}...`);
            
            fetch(`${apiUrl}/api/sos/sms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userName: userProfile.name,
                trackingLink: link,
                userPhone: userProfile.phone,
                toPhone: contact.phone
              })
            }).then(res => res.json())
              .then(data => {
                if (data.success) {
                  addLog(`📱 SMS successfully dispatched to ${contact.name}`);
                  toast.success(`Real SMS sent to ${contact.name}!`);
                } else {
                  addLog(`⚠️ Twilio SMS failed for ${contact.name}`);
                  console.error("Twilio Data Error:", data);
                }
              }).catch(e => {
                addLog(`⚠️ Twilio network error for ${contact.name}`);
                console.error('Twilio fetch network error:', e);
              });
          }
        } catch (smsErr) {
          addLog('⚠️ Twilio block crashed');
          console.error("SMS Block Error:", smsErr);
        }

        addLog(`📧 In-App Alerts sent to ${sentCount} contact(s)`);
      } else {
        addLog('⚠️ No emergency contacts configured');
        toast.error('No emergency contacts! Add them in Profile.');
      }

      // 6. Alert nearby volunteers
      if (location) {
        alertNearbyVolunteers(location, { name: userProfile.name }, link)
          .then((results) => {
            if (results.length > 0) {
              setDispatchedVolunteers(results);
              addLog(`🤝 ${results.length} volunteer(s) alerted`);
              toast.success(`🤝 ${results.length} volunteer(s) nearby alerted`);
            } else {
              setDispatchedVolunteers([]);
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
    setDispatchedVolunteers([]);
    toast.success("✅ You're marked safe!");
  }, [sessionId, cameraStream]);

  return (
    <div className="dashboard">
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
            triggerWord={'help me'}
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
            <EvidenceCapture 
              stream={cameraStream} 
              lastCaptureUrl={lastCaptureUrl} 
              onCapture={async (blob) => {
                try {
                  const url = await uploadEvidence(currentUser.uid, blob);
                  setLastCaptureUrl(url);
                  addLog('📸 Evidence photo captured & uploaded');
                  toast.success('📸 Evidence photo captured');
                } catch (err) {
                  console.error('Evidence photo upload failed:', err);
                  toast.error(`Photo upload error: ${err.message}`);
                  alert(`Photo Upload Failed: ${err.message}`);
                  addLog('⚠️ Photo upload failed');
                }
              }}
              onAudioCapture={async (blob) => {
                try {
                  const { uploadAudio } = await import('../services/evidenceService');
                  await uploadAudio(currentUser.uid, blob);
                  addLog('🎤 10s Audio evidence uploaded');
                  toast.success('🎤 Audio evidence saved');
                } catch (err) {
                  console.error('Audio upload failed:', err);
                  toast.error(`Audio upload error: ${err.message}`);
                  alert(`Audio Upload Failed: ${err.message}`);
                  addLog('⚠️ Audio upload failed');
                }
              }}
            />
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

          {/* Fake Call Feature */}
          <div className="dashboard-card glass-card animate-fadeInUp delay-5">
            <div className="card-title"><FiPhone /> Fake Call</div>
            <FakeCall 
              defaultCallerName={userProfile?.fakeCallSettings?.callerName || 'Mom'} 
              delaySeconds={userProfile?.fakeCallSettings?.delaySeconds || 3} 
            />
          </div>

          {/* Periodic Safety Check */}
          <div className="dashboard-card glass-card animate-fadeInUp delay-5">
            <PeriodicCheckIn onSOS={triggerSOS} />
          </div>

          <div className="dashboard-card glass-card animate-fadeInUp delay-5">
            <div className="card-title"><FiUsers /> Volunteer Network</div>
            <div className="volunteer-network-content" style={{ padding: '10px 0' }}>
              {sosActive ? (
                dispatchedVolunteers.length > 0 ? (
                  <div>
                    <p style={{ color: '#00e676', marginBottom: '10px', fontSize: '14px' }}>
                      ✓ Alerted {dispatchedVolunteers.length} nearby volunteer(s)
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {dispatchedVolunteers.map((v, i) => (
                        <li key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '5px', marginBottom: '5px', fontSize: '13px' }}>
                          <span style={{ fontWeight: 'bold' }}>{v.volunteer}</span> • {v.distance} km away
                          <span style={{ float: 'right', color: v.status === 'sent' ? '#00e676' : '#ff4d4d' }}>
                            {v.status === 'sent' ? 'Dispatched' : 'Failed'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#a89cc4' }}>Scanning 5km radius for active volunteers...</p>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '10px 0', color: '#a89cc4' }}>
                  <p style={{ fontSize: '14px' }}>Haversine dispatch system is active.</p>
                  <p style={{ fontSize: '12px', marginTop: '5px' }}>Volunteers within 5km will be alerted when SOS is triggered.</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Vault */}
          <div className="dashboard-card glass-card animate-fadeInUp delay-6" style={{ gridColumn: '1 / -1' }}>
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><FiCamera /> Evidence Vault</span>
              <button className="btn btn-ghost btn-sm" onClick={async () => {
                const { fetchUserEvidence } = await import('../services/evidenceService');
                const data = await fetchUserEvidence(currentUser.uid);
                setEvidenceVault(data);
              }}>
                Refresh
              </button>
            </div>
            <div className="evidence-vault-grid" style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 0' }}>
              {evidenceVault.length === 0 ? (
                <p className="log-empty">No evidence saved yet. Trigger SOS to capture.</p>
              ) : (
                evidenceVault.map((item) => (
                  <div key={item.id} className="vault-item" style={{ flexShrink: 0, position: 'relative' }}>
                    {item.type === 'image' ? (
                      <img src={item.imageUrl} alt="Evidence" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #2d1054' }} />
                    ) : (
                      <div style={{ width: '220px', height: '120px', background: '#1a1128', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #2d1054' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                          <FiMic size={18} color="#a89cc4" />
                          <span style={{ fontSize: '12px', color: '#a89cc4' }}>10s Audio Recording</span>
                        </div>
                        <audio controls src={item.audioUrl} style={{ width: '200px', height: '35px' }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px 0', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
