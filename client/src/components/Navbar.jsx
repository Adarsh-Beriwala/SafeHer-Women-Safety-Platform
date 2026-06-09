import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../services/auth';
import { FiShield, FiMenu, FiX, FiLogOut, FiUser, FiHome, FiGrid, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const isActive = (path) => location.pathname === path;

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo" onClick={closeMobile}>
          <div className="logo-icon">
            <FiShield />
          </div>
          <span className="logo-text">Safe<span className="logo-accent">Her</span></span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          {currentUser ? (
            <>
              <Link
                to={userProfile?.role === 'volunteer' ? '/volunteer-dashboard' : '/dashboard'}
                className={`nav-link ${isActive('/dashboard') || isActive('/volunteer-dashboard') ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <FiGrid /> Dashboard
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <FiUser /> Profile
              </Link>
              <Link
                to="/evidence"
                className={`nav-link ${isActive('/evidence') ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <FiCamera /> Evidence
              </Link>
              <div className="nav-user-info">
                <span className="nav-user-name">{userProfile?.name || 'User'}</span>
                <span className="nav-user-role badge badge-success">{userProfile?.role}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMobile}>
                <FiHome /> Home
              </Link>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMobile}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" onClick={closeMobile}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
