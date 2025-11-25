import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { resolveImageUrl } from '../utils/media';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState(() => window.location.pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('auth_token'));
  const [userName, setUserName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('auth_user'));
      return u?.name || '';
    } catch (_) { return ''; }
  });
  const [userEmail, setUserEmail] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('auth_user'))?.email) || ''; } catch (_) { return ''; }
  });
  const [userRole, setUserRole] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('auth_user'))?.role) || ''; } catch (_) { return ''; }
  });
  const [avatarUrl, setAvatarUrl] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('auth_user'))?.avatarUrl) || ''; } catch (_) { return ''; }
  });
  // Force light theme: remove any stored theme and ensure no dark class is applied
  useEffect(() => {
    try { localStorage.removeItem('theme'); } catch (_) {}
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const handler = () => setActivePath(window.location.pathname);
    window.addEventListener('popstate', handler);
    window.addEventListener('hashchange', handler);
    return () => {
      window.removeEventListener('popstate', handler);
      window.removeEventListener('hashchange', handler);
    };
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsLoggedIn(!!token);
      try {
        const u = JSON.parse(localStorage.getItem('auth_user'));
        setUserName(u?.name || '');
        setUserEmail(u?.email || '');
        setUserRole(u?.role || '');
        setAvatarUrl(u?.avatarUrl || '');
      } catch (_) { setUserName(''); }
    };
    syncAuth();
    const onStorage = () => syncAuth();
    const onAuthChanged = () => syncAuth();
    const onFocus = () => syncAuth();
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const isActive = (path) => activePath === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Theme toggle removed: always use light theme

  const handleLogoClick = () => {
    // Navigate to home page logic here
    window.location.href = '/';
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (_) {}
    setIsLoggedIn(false);
    setUserName('');
    window.dispatchEvent(new Event('auth-changed'));
    window.location.href = '/';
  };

  const handleProfile = () => { window.location.href = '/profile'; };
  const handleSaved = () => { window.location.href = '/saved'; };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={handleLogoClick}>
          <span className="brand-name">Job Box</span>
        </div>

        {/* Navigation Links */}
        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <a href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</a>
          <a href="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</a>
          <a href="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>Jobs / Browse Jobs</a>
          <a href="/blogs" className={`nav-link ${isActive('/blogs') ? 'active' : ''}`}>Blogs</a>
          <a href="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</a>
          {(() => {
            const role = String(userRole || '').toLowerCase();
            const showAdmin = isLoggedIn && role === 'admin';
            return showAdmin ? (
              <a href="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</a>
            ) : null;
          })()}
        </div>

        {/* Actions: Login */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="user-menu">
              <div className="user-avatar" onClick={handleProfile} title="Open profile">
                {avatarUrl ? (
                  <img src={resolveImageUrl(avatarUrl)} alt="avatar" onError={() => { setAvatarUrl(''); }} />
                ) : (
                  (userName||'?').slice(0,1).toUpperCase()
                )}
              </div>
              <div className="user-dropdown">
                <div className="info">
                  <div className="name">{userName}</div>
                  {!!userRole && <div className="muted">{userRole}</div>}
                  {!!userEmail && <div className="email">{userEmail}</div>}
                </div>
                <div className="actions">
                  <button onClick={handleProfile}>Profile</button>
                  <button onClick={handleSaved}>Saved Items</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button className="login-btn" onClick={() => (window.location.href = '/login')}>Login</button>
              <button className="login-btn" onClick={() => (window.location.href = '/signup')}>Signup</button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;