import React from 'react';
import { Link } from 'react-router-dom';
import "./Settings.css"
const Settings = () => {
  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <h1 className="admin-settings__title">Settings</h1>
        <p className="admin-settings__description">Quick access cards for recent jobs and blogs management.</p>
      </div>
      <div className="admin-settings__grid">
        <Link to="/admin/recent-jobs" className="admin-settings__card">
          <h3 className="admin-settings__card-title">Recent Jobs Table</h3>
          <p className="admin-settings__card-description">View, edit, or delete latest job posts.</p>
        </Link>
        <Link to="/admin/recent-blogs" className="admin-settings__card">
          <h3 className="admin-settings__card-title">Recent Blogs Table</h3>
          <p className="admin-settings__card-description">Manage blog posts with edit and delete.</p>
        </Link>
      </div>
    </div>
  );
};

export default Settings;