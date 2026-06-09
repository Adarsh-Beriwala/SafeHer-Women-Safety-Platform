import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../services/auth';
import { FiMail, FiLock, FiUser, FiPhone, FiUserPlus, FiShield, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, phone, role } = form;

    if (!name || !email || !password || !phone) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, phone, role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : err.code === 'auth/weak-password'
        ? 'Password too weak (min 6 chars)'
        : 'Signup failed. Please try again';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-effects">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-card glass-card animate-scaleIn" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <FiShield />
          </div>
          <h1>Create Account</h1>
          <p>Join SafeHer and stay protected</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input id="signup-name" type="text" name="name" className="input-field" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input id="signup-email" type="email" name="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-phone">Phone Number</label>
            <div className="input-wrapper">
              <FiPhone className="input-icon" />
              <input id="signup-phone" type="tel" name="phone" className="input-field" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input id="signup-password" type="password" name="password" className="input-field" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input id="signup-confirm" type="password" name="confirmPassword" className="input-field" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>I want to join as</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${form.role === 'user' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'user' })}
              >
                <FiShield />
                <span>User</span>
                <small>I need protection</small>
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'volunteer' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'volunteer' })}
              >
                <FiUsers />
                <span>Volunteer</span>
                <small>I want to help</small>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> : <><FiUserPlus /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
