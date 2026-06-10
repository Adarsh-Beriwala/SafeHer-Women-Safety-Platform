import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { toggleVolunteerDuty, updateVolunteerLocation } from '../services/volunteerService';
import { getCurrentPosition } from '../services/locationService';
import { FiShield, FiMapPin, FiClock, FiAlertTriangle, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './VolunteerDashboard.css';

const VolunteerDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load initial duty state
  useEffect(() => {
    if (userProfile?.role === 'volunteer') {
      // In a real app, we'd fetch this from their specific volunteer doc
      // For now, we'll default to off duty on load
    }
  }, [userProfile]);

  // Listen for active SOS alerts
  useEffect(() => {
    if (!currentUser || !isOnDuty) {
      setActiveAlerts([]);
      return;
    }

    const q = query(
      collection(db, 'sosEvents'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = [];
      snapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by newest first
      alerts.sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
      setActiveAlerts(alerts);
      
      // Notify if new alert came in
      if (snapshot.docChanges().some(change => change.type === 'added')) {
        toast.error('🚨 NEW EMERGENCY NEARBY!', { duration: 5000 });
        // Play notification sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        audio.play().catch(e => console.log(e));
      }
    });

    return () => unsubscribe();
  }, [currentUser, isOnDuty]);

  const handleToggleDuty = async () => {
    setLoading(true);
    try {
      const newStatus = !isOnDuty;
      let loc = location;
      
      if (newStatus) {
        toast.loading('Acquiring location...', { id: 'locToast' });
        loc = await getCurrentPosition();
        setLocation(loc);
        toast.dismiss('locToast');
      }

      await toggleVolunteerDuty(currentUser.uid, userProfile.name, loc, newStatus);
      setIsOnDuty(newStatus);
      toast.success(newStatus ? 'You are now ON DUTY' : 'You are now OFF DUTY');
      
    } catch (error) {
      console.error('Duty toggle failed:', error);
      toast.error('Failed to update duty status. Please allow location access.');
      toast.dismiss('locToast');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!isOnDuty) return;
    try {
      const loc = await getCurrentPosition();
      setLocation(loc);
      await updateVolunteerLocation(currentUser.uid, loc);
      toast.success('Location updated');
    } catch (error) {
      toast.error('Failed to get location');
    }
  };

  if (userProfile?.role !== 'volunteer') {
    return (
      <div className="volunteer-page">
        <div className="container">
          <div className="volunteer-restricted">
            <FiShield className="restricted-icon" />
            <h2>Volunteer Access Only</h2>
            <p>You need to be registered as a volunteer to access this dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteer-page">
      <div className="container">
        <div className="volunteer-header animate-fadeInUp">
          <div>
            <h1>Volunteer Hub</h1>
            <p>Help make your community safer, {userProfile.name}</p>
          </div>
          
          <div className={`duty-toggle ${isOnDuty ? 'active' : ''}`}>
            <span className="duty-status">{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isOnDuty} 
                onChange={handleToggleDuty} 
                disabled={loading}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {isOnDuty && location && (
          <div className="volunteer-location animate-fadeInUp delay-1">
            <FiMapPin /> Current Patrol Area: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            <button className="btn btn-ghost btn-sm" onClick={handleUpdateLocation}>Update</button>
          </div>
        )}

        <div className="volunteer-content animate-fadeInUp delay-2">
          {!isOnDuty ? (
            <div className="duty-offline">
              <FiShield className="offline-icon" />
              <h3>You are currently Offline</h3>
              <p>Go On Duty to receive emergency SOS alerts in your area.</p>
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="duty-all-clear">
              <div className="radar"></div>
              <h3>Area is Clear</h3>
              <p>Listening for SOS alerts within 5km of your location...</p>
            </div>
          ) : (
            <div className="active-alerts-grid">
              <h2><FiAlertTriangle className="text-danger" /> Active Emergencies ({activeAlerts.length})</h2>
              {activeAlerts.map(alert => (
                <div key={alert.id} className="alert-card">
                  <div className="alert-card-header">
                    <span className="badge badge-danger blink">LIVE SOS</span>
                    <span className="alert-time"><FiClock /> {new Date(alert.triggeredAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="alert-details">
                    <p><strong>Victim:</strong> {alert.userName}</p>
                    {alert.userPhone && <p><FiPhone /> {alert.userPhone}</p>}
                    <p className="alert-address"><FiMapPin /> {alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}</p>
                  </div>
                  <div className="alert-actions">
                    {alert.trackingLink && (
                      <a href={alert.trackingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Track Live
                      </a>
                    )}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${alert.location.lat},${alert.location.lng}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                      Navigate
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
