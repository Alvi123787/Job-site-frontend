// AdminPanel.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import JobManagement from '../components/JobManagement';
import Applications from '../components/Applications';
import Analytics from '../components/Analytics';
import Settings from '../components/Settings';
import BlogPostForm from '../components/BlogPostForm';
import UpcomingEventsCalendar from '../components/UpcomingEventsCalendar.jsx';
import './AdminPanel.css';
import AdminAbout from './AdminAbout.jsx';

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Persist sidebar state and add keyboard shortcuts
  useEffect(() => {
    const stored = localStorage.getItem('admin_sidebar_open');
    if (stored !== null) {
      try {
        setSidebarOpen(JSON.parse(stored));
      } catch (_) {}
    }
    const initialSection = localStorage.getItem('admin_active_section');
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('admin_active_section', activeSection);
  }, [activeSection]);

  useEffect(() => {
    const handler = (e) => {
      // Ctrl+B toggles, Esc closes on mobile or when open
      const isCtrlB = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b';
      if (isCtrlB) {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sidebarOpen]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'jobs':
        return <JobManagement />;
      case 'applications':
        return <Applications />;
      case 'analytics':
        return <Analytics />;
      case 'about':
        return <AdminAbout />;
      case 'calendar':
        return (
          <div className="dashboard">
            <div className="dashboard-header">
              <h1>Upcoming Events</h1>
              <p>Job deadlines/interviews (blue) and blog publish schedule (green).</p>
            </div>
            <UpcomingEventsCalendar />
          </div>
        );
      case 'settings':
        return <Settings />;
      case 'blog':
        // Render blog post form inside admin panel without back button
        return <BlogPostForm />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-panel">
      {/* Mobile overlay to close sidebar when tapping outside */}
      <div
        className={`screen-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => sidebarOpen && setSidebarOpen(false)}
      />
      <Sidebar 
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;