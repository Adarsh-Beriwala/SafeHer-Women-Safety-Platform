import { Link } from 'react-router-dom';
import {
  FiShield, FiMic, FiMapPin, FiCamera, FiPhone,
  FiUsers, FiCpu, FiMessageCircle, FiClock, FiArrowRight,
  FiCheck, FiZap, FiLock, FiHeart
} from 'react-icons/fi';
import './Landing.css';

const features = [
  {
    icon: <FiShield />,
    title: 'Emergency SOS',
    desc: 'One-click panic button that instantly alerts your emergency contacts with your live location and evidence.',
    color: '#ef4444',
  },
  {
    icon: <FiMic />,
    title: 'Voice Activation',
    desc: 'Say "Help Me" hands-free to trigger the full SOS system without touching your device.',
    color: '#8b5cf6',
  },
  {
    icon: <FiCamera />,
    title: 'Auto Evidence',
    desc: 'Automatically captures photo evidence from your camera and securely stores it in the cloud.',
    color: '#3b82f6',
  },
  {
    icon: <FiMapPin />,
    title: 'Live Tracking',
    desc: 'Real-time GPS tracking lets your contacts watch your live movement on a map.',
    color: '#10b981',
  },
  {
    icon: <FiPhone />,
    title: 'Fake Call',
    desc: 'Simulate a realistic incoming call to escape dangerous situations discreetly.',
    color: '#f59e0b',
  },
  {
    icon: <FiUsers />,
    title: 'Volunteer Network',
    desc: 'Nearby volunteers are automatically alerted and dispatched to your location.',
    color: '#ec4899',
  },
  {
    icon: <FiCpu />,
    title: 'AI Safety Score',
    desc: 'ML-powered area safety ratings using XGBoost on real crime data to plan safer routes.',
    color: '#06b6d4',
  },
  {
    icon: <FiMessageCircle />,
    title: 'AI Safety Chatbot',
    desc: 'Get instant, context-aware safety advice powered by Google Gemini AI.',
    color: '#a855f7',
  },
  {
    icon: <FiClock />,
    title: 'Safety Check-in',
    desc: 'Periodic check-in timer auto-triggers SOS if you don\'t respond — your fail-safe.',
    color: '#f43f5e',
  },
];

const stats = [
  { value: '10+', label: 'Safety Features' },
  { value: '<2s', label: 'Alert Response' },
  { value: '24/7', label: 'Always Active' },
  { value: 'AI', label: 'ML-Powered' },
];

const Landing = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="container hero-content">
          <div className="hero-badge animate-fadeInUp">
            <FiZap /> AI-Powered Safety Platform
          </div>
          <h1 className="hero-title animate-fadeInUp delay-1">
            Your Safety,<br />
            <span className="hero-gradient-text">Our Priority</span>
          </h1>
          <p className="hero-subtitle animate-fadeInUp delay-2">
            SafeHer is an intelligent women safety platform that combines real-time SOS alerts,
            live location tracking, AI-driven safety analysis, and community volunteer networks
            — all in one powerful web application.
          </p>
          <div className="hero-buttons animate-fadeInUp delay-3">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>

          <div className="hero-stats animate-fadeInUp delay-4">
            {stats.map((stat, i) => (
              <div key={i} className="hero-stat">
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need to Stay Safe</h2>
            <p className="section-subtitle">
              A comprehensive safety suite powered by cutting-edge AI, real-time communication, and community support.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className="feature-card glass-card">
                <div className="feature-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Safety in Three Simple Steps</h2>
            <p className="section-subtitle">
              Getting started with SafeHer takes less than a minute.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Create Your Account</h3>
              <p>Sign up with your email, add your emergency contacts and set your safety preferences.</p>
              <div className="step-icon"><FiLock /></div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Stay Protected</h3>
              <p>Use voice commands, SOS buttons, fake calls, and periodic check-ins during your daily activities.</p>
              <div className="step-icon"><FiShield /></div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Get Instant Help</h3>
              <p>Your contacts and nearby volunteers are alerted instantly with your live location and evidence.</p>
              <div className="step-icon"><FiHeart /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Technology</span>
            <h2 className="section-title">Built with Modern Tech</h2>
            <p className="section-subtitle">
              Powered by industry-leading technologies for reliability, speed, and intelligence.
            </p>
          </div>

          <div className="tech-grid">
            {[
              { name: 'React.js', desc: 'Frontend UI' },
              { name: 'Node.js', desc: 'Backend API' },
              { name: 'Firebase', desc: 'Auth & Database' },
              { name: 'Google Maps', desc: 'Location & Maps' },
              { name: 'Google Gemini', desc: 'AI Chatbot' },
              { name: 'XGBoost', desc: 'ML Safety Score' },
            ].map((tech, i) => (
              <div key={i} className="tech-card glass-card">
                <FiCheck className="tech-check" />
                <h4>{tech.name}</h4>
                <p>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-glow"></div>
            <h2>Ready to Feel Safer?</h2>
            <p>Join SafeHer today and carry a powerful safety companion wherever you go.</p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create Free Account <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="navbar-logo">
              <div className="logo-icon"><FiShield /></div>
              <span className="logo-text">Safe<span className="logo-accent">Her</span></span>
            </div>
            <p>AI-powered women safety platform. Built with ❤️ for a safer world.</p>
          </div>
          <div className="footer-links">
            <h4>Platform</h4>
            <Link to="/signup">Get Started</Link>
            <Link to="/login">Sign In</Link>
          </div>
          <div className="footer-links">
            <h4>Features</h4>
            <a href="#features">SOS System</a>
            <a href="#features">AI Safety Score</a>
            <a href="#features">Volunteer Network</a>
          </div>
        </div>
        <div className="footer-bottom container">
          <p>© 2025 SafeHer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
