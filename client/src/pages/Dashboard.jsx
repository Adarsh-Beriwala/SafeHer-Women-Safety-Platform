import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FiShield, FiMapPin, FiPhone, FiCpu,
  FiMessageCircle, FiClock, FiMic, FiCamera,
  FiUsers, FiUser, FiArrowRight
} from 'react-icons/fi';
import './Dashboard.css';

const features = [
  {
    icon: <FiShield />,
    title: 'Emergency SOS',
    desc: 'One-click panic button with instant alerts',
    color: '#ef4444',
    status: 'Coming Day 2',
  },
  {
    icon: <FiMic />,
    title: 'Voice Activation',
    desc: 'Say "Help Me" hands-free to trigger SOS',
    color: '#8b5cf6',
    status: 'Coming Day 2',
  },
  {
    icon: <FiCamera />,
    title: 'Auto Evidence',
    desc: 'Auto-capture photo evidence on SOS trigger',
    color: '#3b82f6',
    status: 'Coming Day 2',
  },
  {
    icon: <FiMapPin />,
    title: 'Live Location',
    desc: 'Real-time GPS tracking on Google Maps',
    color: '#10b981',
    status: 'Coming Day 2',
  },
  {
    icon: <FiPhone />,
    title: 'Fake Call',
    desc: 'Simulate a realistic incoming phone call',
    color: '#f59e0b',
    status: 'Coming Day 3',
  },
  {
    icon: <FiUsers />,
    title: 'Volunteer Network',
    desc: 'Nearby volunteers alerted automatically',
    color: '#ec4899',
    status: 'Coming Day 3',
  },
  {
    icon: <FiCpu />,
    title: 'AI Safety Score',
    desc: 'XGBoost ML model for area safety ratings',
    color: '#06b6d4',
    status: 'Coming Day 4',
  },
  {
    icon: <FiMessageCircle />,
    title: 'AI Chatbot',
    desc: 'Gemini-powered safety advice chatbot',
    color: '#a855f7',
    status: 'Coming Day 4',
  },
  {
    icon: <FiClock />,
    title: 'Safety Check-in',
    desc: 'Periodic check-in with auto-SOS escalation',
    color: '#f43f5e',
    status: 'Coming Day 5',
  },
];

const Dashboard = () => {
  const { userProfile } = useAuth();

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header animate-fadeInUp">
          <div>
            <h1>Safety Dashboard</h1>
            <p>Welcome back, <strong>{userProfile?.name || 'User'}</strong>. Stay safe!</p>
          </div>
          <div className="dashboard-status">
            <span className="badge badge-success">✅ All Safe</span>
          </div>
        </div>

        {/* Profile Reminder */}
        {(!userProfile?.emergencyContacts || userProfile.emergencyContacts.length === 0) && (
          <div className="dashboard-alert animate-fadeInUp delay-1">
            <FiUser />
            <p>⚠️ You haven't added any emergency contacts yet.</p>
            <Link to="/profile" className="btn btn-primary btn-sm">
              Add Contacts <FiArrowRight />
            </Link>
          </div>
        )}

        {/* SOS Placeholder */}
        <div className="dashboard-sos-section animate-fadeInUp delay-1">
          <div className="sos-placeholder">
            <div className="sos-placeholder-circle">
              <span>SOS</span>
            </div>
            <p>Full SOS system coming in Day 2 update</p>
          </div>
        </div>

        {/* Features Coming Soon Grid */}
        <h2 className="dashboard-section-title animate-fadeInUp delay-2">Features Overview</h2>
        <div className="dashboard-features-grid animate-fadeInUp delay-3">
          {features.map((feature, i) => (
            <div key={i} className="dashboard-feature-card glass-card">
              <div className="feature-card-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                {feature.icon}
              </div>
              <div className="feature-card-content">
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
              <span className="feature-status badge badge-warning">{feature.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
