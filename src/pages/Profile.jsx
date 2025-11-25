import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { fetchProfile, updateProfile, changePassword, deleteAccount, uploadAvatar } from '../utils/profile';
import { resolveImageUrl } from '../utils/media';
import SavedItems from './SavedItems';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [avatarMode, setAvatarMode] = useState('url');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    role: 'Job Seeker',
    location: '',
    profession: '',
    bio: '',
    phone: '',
    avatarUrl: '',
    notifications: { email: true, jobAlerts: true, marketing: false },
  });

  const isAuthed = useMemo(() => {
    try { return !!localStorage.getItem('auth_token'); } catch (_) { return false; }
  }, []);

  useEffect(() => {
    if (!isAuthed) {
      navigate('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProfile();
        setUser(data);
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'Job Seeker',
          location: data.location || data.country || '',
          profession: data.profession || '',
          bio: data.bio || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '',
          notifications: data.notifications || { email: true, jobAlerts: true, marketing: false },
        });
      } catch (err) {
        const msg = err.message || 'Failed to load profile';
        setError(msg);
        if (/Invalid token|Missing token/i.test(msg)) {
          try { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); } catch (_) {}
          window.dispatchEvent(new Event('auth-changed'));
          navigate('/login');
          return;
        }
      }
      setLoading(false);
    };
    load();
  }, [isAuthed, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((f) => ({ ...f, [name]: value }));
  };

  const handleNotifChange = (e) => {
    const { name, checked } = e.target;
    setProfileForm((f) => ({ ...f, notifications: { ...f.notifications, [name]: checked } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: profileForm.name,
        role: profileForm.role,
        location: profileForm.location,
        profession: profileForm.profession,
        bio: profileForm.bio,
        phone: profileForm.phone,
        avatarUrl: profileForm.avatarUrl,
        notifications: profileForm.notifications,
      };
      const resp = await updateProfile(payload);
      setSuccess(resp?.message || 'Profile updated successfully');
      setUser(resp?.user || user);
      try { localStorage.setItem('auth_user', JSON.stringify(resp?.user || {})); } catch (_) {}
      window.dispatchEvent(new Event('auth-changed'));
    } catch (err) {
      const msg = err.message || 'Failed to update profile';
      setError(msg);
      if (/Invalid token|Missing token/i.test(msg)) {
        try { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); } catch (_) {}
        window.dispatchEvent(new Event('auth-changed'));
        navigate('/login');
      }
    }
    setSaving(false);
  };

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setError('');
    setSuccess('');
    if (pwd.newPassword !== pwd.confirmPassword) {
      setError('New passwords do not match');
      setPwdSaving(false);
      return;
    }
    try {
      const resp = await changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setSuccess(resp?.message || 'Password changed successfully');
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
    setPwdSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      const resp = await deleteAccount();
      setSuccess(resp?.message || 'Account deleted successfully');
      try { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); } catch (_) {}
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
    }
  };

  const TabNav = () => (
    <div className="profile-tabs-container">
      <div className="profile-tabs">
        <button 
          className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          Profile Overview
        </button>
        <button 
          className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
          Saved Items
        </button>
        <button 
          className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Account Settings
        </button>
      </div>
    </div>
  );

  return (
    <main className="profile-container">
      <div className="profile-header-section">
        <div className="container">
          <h1 className="profile-main-title">Account Profile</h1>
          <p className="profile-subtitle">Manage your personal information and preferences</p>
        </div>
      </div>

      <div className="container profile-content">
        {error && (
          <div className="alert-message error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="alert-message success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {success}
          </div>
        )}

        {loading ? (
          <div className="profile-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ) : (
          <>
            <TabNav />
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="profile-card">
                <div className="card-header">
                  <h2>Personal Information</h2>
                  <p>Update your basic profile details</p>
                </div>
                
                <div className="profile-avatar-section">
                  <div className="avatar-container">
                    {profileForm.avatarUrl ? (
                      <img 
                        className="profile-avatar" 
                        src={resolveImageUrl(profileForm.avatarUrl)} 
                        alt="avatar" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                      />
                    ) : (
                      <div className="profile-avatar-placeholder">
                        {(profileForm.name || '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="avatar-overlay">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="avatar-info">
                    <h3>{profileForm.name}</h3>
                    <p>{profileForm.profession || 'No profession set'}</p>
                    <span className="location-tag">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {profileForm.location || 'No location set'}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSave} className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        className="form-input" 
                        name="name" 
                        value={profileForm.name} 
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input 
                        className="form-input" 
                        value={profileForm.email} 
                        readOnly 
                      />
                      <div className="input-note">Email cannot be changed</div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Account Role</label>
                      <select 
                        className="form-select" 
                        name="role" 
                        value={profileForm.role} 
                        onChange={handleChange}
                      >
                        <option value="Job Seeker">Job Seeker</option>
                        <option value="Employer">Employer</option>
                        <option value="Admin">Administrator</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        className="form-input" 
                        name="phone" 
                        value={profileForm.phone} 
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Profession / Title</label>
                      <input 
                        className="form-input" 
                        name="profession" 
                        value={profileForm.profession} 
                        onChange={handleChange}
                        placeholder="e.g. Senior Developer"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input 
                        className="form-input" 
                        name="location" 
                        value={profileForm.location} 
                        onChange={handleChange}
                        placeholder="e.g. New York, USA"
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Bio</label>
                    <textarea 
                      className="form-textarea" 
                      rows={4} 
                      name="bio" 
                      value={profileForm.bio} 
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your skills, and experience..."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Profile Picture</label>
                    <div className="avatar-upload-section">
                      <div className="upload-mode-toggle">
                        <button 
                          type="button" 
                          className={`mode-btn ${avatarMode === 'url' ? 'active' : ''}`}
                          onClick={() => setAvatarMode('url')}
                        >
                          Image URL
                        </button>
                        <button 
                          type="button" 
                          className={`mode-btn ${avatarMode === 'upload' ? 'active' : ''}`}
                          onClick={() => setAvatarMode('upload')}
                        >
                          Upload File
                        </button>
                      </div>
                      
                      {avatarMode === 'url' ? (
                        <input 
                          className="form-input" 
                          name="avatarUrl" 
                          value={profileForm.avatarUrl} 
                          onChange={handleChange}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      ) : (
                        <div className="file-upload-area">
                          <input 
                            type="file" 
                            className="file-input" 
                            accept="image/*" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setAvatarUploading(true);
                              setError('');
                              setSuccess('');
                              try {
                                const resp = await uploadAvatar(file);
                                const newUrl = resp?.url || '';
                                setProfileForm((f) => ({ ...f, avatarUrl: newUrl || f.avatarUrl }));
                                // Immediately reflect in Navbar by updating localStorage and notifying listeners
                                try {
                                  const currentUser = (() => {
                                    try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch (_) { return {}; }
                                  })();
                                  const updatedUser = { ...currentUser, avatarUrl: newUrl };
                                  localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                                  // Signal to Navbar and other listeners to re-read auth state
                                  window.dispatchEvent(new Event('auth-changed'));
                                } catch (_) {}
                                setSuccess('Avatar uploaded successfully. Navbar updated.');
                              } catch (err) {
                                setError(err.message || 'Failed to upload avatar');
                              }
                              setAvatarUploading(false);
                            }} 
                          />
                          <div className="upload-placeholder">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </svg>
                            <span>Click to upload or drag and drop</span>
                            <small>SVG, PNG, JPG or GIF (max. 5MB)</small>
                          </div>
                          {avatarUploading && (
                            <div className="upload-progress">
                              <div className="progress-bar"></div>
                              <span>Uploading...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      className="btn-primary" 
                      type="submit" 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="spinner"></div>
                          Saving Changes...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Saved Tab */}
            {activeTab === 'saved' && (
              <div className="profile-card">
                <div className="card-header">
                  <h2>Saved Items</h2>
                  <p>Your bookmarked jobs and articles</p>
                </div>
                <SavedItems />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="settings-grid">
                <div className="settings-card">
                  <div className="card-header">
                    <h3>Change Password</h3>
                    <p>Update your account password</p>
                  </div>
                  <form onSubmit={handleChangePassword} className="password-form">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="Enter current password" 
                        value={pwd.currentPassword} 
                        onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="Enter new password" 
                        value={pwd.newPassword} 
                        onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="Confirm new password" 
                        value={pwd.confirmPassword} 
                        onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))} 
                        required 
                      />
                    </div>
                    <button 
                      className="btn-primary" 
                      type="submit" 
                      disabled={pwdSaving}
                    >
                      {pwdSaving ? (
                        <>
                          <div className="spinner"></div>
                          Updating Password...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </form>
                </div>

                <div className="settings-card">
                  <div className="card-header">
                    <h3>Notification Preferences</h3>
                    <p>Manage how we communicate with you</p>
                  </div>
                  <div className="notifications-list">
                    <div className="notification-item">
                      <div className="notification-info">
                        <h4>Email Notifications</h4>
                        <p>Important updates about your account</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          name="email" 
                          checked={!!profileForm.notifications?.email} 
                          onChange={handleNotifChange} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    
                    <div className="notification-item">
                      <div className="notification-info">
                        <h4>Job Alerts</h4>
                        <p>New job opportunities matching your profile</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          name="jobAlerts" 
                          checked={!!profileForm.notifications?.jobAlerts} 
                          onChange={handleNotifChange} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    
                    <div className="notification-item">
                      <div className="notification-info">
                        <h4>Marketing Communications</h4>
                        <p>Updates about new features and promotions</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          name="marketing" 
                          checked={!!profileForm.notifications?.marketing} 
                          onChange={handleNotifChange} 
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  <button 
                    className="btn-outline" 
                    onClick={handleSave} 
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>

                <div className="settings-card danger-zone">
                  <div className="card-header">
                    <h3>Danger Zone</h3>
                    <p>Permanent account actions</p>
                  </div>
                  <div className="danger-content">
                    <div className="danger-warning">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <div>
                        <h4>Delete Account</h4>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                      </div>
                    </div>
                    <button 
                      className="btn-danger" 
                      onClick={handleDelete}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Profile;