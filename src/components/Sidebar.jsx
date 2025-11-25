// Sidebar.js (updated version)
import React from 'react';
import './Sidebar.css';

// Inline SVG icons to ensure icons render without external dependencies
const SidebarIcon = ({ name }) => {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };
  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'jobs':
      return (
        <svg {...common}>
          <path d="M9 7V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'applications':
      return (
        <svg {...common}>
          <path d="M7 3h8l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M15 3v6h6" stroke="currentColor" strokeWidth="2" />
          <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'analytics':
      return (
        <svg {...common}>
          <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="6" y="10" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="11" y="7" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="16" y="12" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 11h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'blog':
      return (
        <svg {...common}>
          <path d="M4 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" />
          <path d="M8 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 17l3-3 2 2 4-4 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'about':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
      );
  }
};

const Sidebar = ({ isOpen, toggleSidebar, activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'jobs', label: 'Job Management' },
    { id: 'applications', label: 'Applications' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'settings', label: 'Settings' },
    { id: 'blog', label: 'Publish Blog' },
    { id: 'about', label: 'About Content' }
  ];

  return (
    <div className={`job-sidebar ${isOpen ? 'job-sidebar--open' : 'job-sidebar--closed'}`}>
      <div className="job-sidebar__header">
        {isOpen && (
          <div className="job-sidebar__logo">
            <span>Job Box</span>
          </div>
        )}
        <button className="job-sidebar__toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      <nav className="job-sidebar__nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`job-sidebar__item ${activeSection === item.id ? 'job-sidebar__item--active' : ''}`}
            onClick={() => setActiveSection(item.id)}
            data-tooltip={!isOpen ? item.label : undefined}
          >
            <div className="job-sidebar__icon">
              <SidebarIcon name={item.id} />
            </div>
            {isOpen && <span className="job-sidebar__label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="job-sidebar__footer">
        <div className="job-sidebar__user">
          <div className="job-sidebar__avatar">
            <div className="job-sidebar__icon">
              <SidebarIcon name="user" />
            </div>
          </div>
          {isOpen && (
            <div className="job-sidebar__user-info">
              <span className="job-sidebar__user-name">Admin User</span>
              <span className="job-sidebar__user-role">Administrator</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;