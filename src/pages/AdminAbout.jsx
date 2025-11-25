import React, { useEffect, useState } from 'react';
import { resolveImageUrl } from '../utils/media';
import { 
  FaSave, 
  FaImage, 
  FaPlus, 
  FaTrash, 
  FaEye,
  FaSpinner
} from 'react-icons/fa';
import './AdminAbout.css';

const initialAboutContent = {
  heroTitle: '',
  heroSubtitle: '',
  mainImage: '',
  sectionTitle: '',
  description: '',
  mission: { title: '', description: '', image: '' },
  vision: { title: '', description: '', image: '' },
  purpose: { title: '', description: '', image: '' },
  team: { title: '', text: '', photo: '/team-placeholder.svg', highlights: [] },
};

export default function AdminAbout() {
  const [aboutContent, setAboutContent] = useState(initialAboutContent);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutStatus, setAboutStatus] = useState('');

  useEffect(() => {
    const loadAboutContent = async () => {
      setAboutLoading(true);
      setAboutStatus('');
      try {
        const resp = await fetch('https://job-site-backend-seven.vercel.app/api/about');
        if (resp.ok) {
          const data = await resp.json();
          if (data && Object.keys(data).length) {
            setAboutContent((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (_) {
        setAboutStatus('Unable to load About page content.');
      } finally {
        setAboutLoading(false);
      }
    };
    loadAboutContent();
  }, []);

  const updateAboutField = (key, value) => 
    setAboutContent((prev) => ({ ...prev, [key]: value }));

  const updateAboutSection = (section, key, value) => 
    setAboutContent((prev) => ({ 
      ...prev, 
      [section]: { ...(prev[section] || {}), [key]: value } 
    }));

  const updateAboutTeam = (key, value) => 
    setAboutContent((prev) => ({ 
      ...prev, 
      team: { ...(prev.team || {}), [key]: value } 
    }));

  const addTeamHighlight = () => 
    setAboutContent((prev) => ({ 
      ...prev, 
      team: { 
        ...(prev.team || {}), 
        highlights: [...((prev.team?.highlights) || []), ''] 
      } 
    }));

  const updateTeamHighlight = (index, value) => 
    setAboutContent((prev) => ({ 
      ...prev, 
      team: { 
        ...(prev.team || {}), 
        highlights: (prev.team?.highlights || []).map((highlight, idx) => 
          idx === index ? value : highlight
        ) 
      } 
    }));

  const removeTeamHighlight = (index) => 
    setAboutContent((prev) => ({ 
      ...prev, 
      team: { 
        ...(prev.team || {}), 
        highlights: (prev.team?.highlights || []).filter((_, idx) => idx !== index) 
      } 
    }));

  const saveAboutContent = async () => {
    setAboutSaving(true);
    setAboutStatus('');
    try {
      const token = localStorage.getItem('auth_token');
      const resp = await fetch('https://job-site-backend-seven.vercel.app/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(aboutContent),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed to save content');
      setAboutContent((prev) => ({ ...prev, ...data }));
      setAboutStatus('About page content saved successfully!');
    } catch (err) {
      setAboutStatus(String(err?.message || 'Failed to save content'));
    } finally {
      setAboutSaving(false);
    }
  };

  const resetAboutForm = () => {
    setAboutContent(initialAboutContent);
    setAboutStatus('Form reset to default values.');
  };

  return (
    <div className="admin-about-page">
      {/* Header Section */}
      <div className="admin-about-header">
        <div className="admin-about-header-content">
          <h1 className="admin-about-title">About Page Content Management</h1>
          <p className="admin-about-subtitle">
            Manage and update all content for the public About page. Changes will be visible immediately after saving.
          </p>
        </div>
        <div className="admin-about-actions">
          <button 
            className="admin-about-btn admin-about-btn--secondary"
            onClick={resetAboutForm}
            disabled={aboutSaving || aboutLoading}
          >
            Reset Form
          </button>
          <button 
            className="admin-about-btn admin-about-btn--primary"
            onClick={saveAboutContent}
            disabled={aboutSaving || aboutLoading}
          >
            {aboutSaving ? (
              <>
                <FaSpinner className="admin-about-btn-spinner" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {aboutStatus && (
        <div className={`admin-about-status ${aboutStatus.includes('success') ? 'admin-about-status--success' : 'admin-about-status--error'}`}>
          {aboutStatus}
        </div>
      )}

      {/* Loading State */}
      {aboutLoading && (
        <div className="admin-about-loading">
          <FaSpinner className="admin-about-loading-spinner" />
          <span>Loading About page content...</span>
        </div>
      )}

      {/* Content Sections */}
      <div className="admin-about-content">
        {/* Hero Section */}
        <div className="admin-about-card">
          <div className="admin-about-card-header">
            <h2 className="admin-about-card-title">
              <FaEye className="admin-about-card-icon" />
              Hero Section
            </h2>
            <p className="admin-about-card-description">
              Main banner content that appears at the top of the About page
            </p>
          </div>
          <div className="admin-about-card-body">
            <div className="admin-about-form-grid">
              <div className="admin-about-form-group">
                <label className="admin-about-label">
                  Hero Title *
                </label>
                <input 
                  type="text" 
                  className="admin-about-input"
                  value={aboutContent.heroTitle || ''} 
                  onChange={(e) => updateAboutField('heroTitle', e.target.value)} 
                  placeholder="Connecting Talent with Opportunity" 
                />
              </div>
              <div className="admin-about-form-group">
                <label className="admin-about-label">
                  Hero Subtitle *
                </label>
                <input 
                  type="text" 
                  className="admin-about-input"
                  value={aboutContent.heroSubtitle || ''} 
                  onChange={(e) => updateAboutField('heroSubtitle', e.target.value)} 
                  placeholder="We help professionals and companies connect." 
                />
              </div>
            </div>
            <div className="admin-about-form-group">
              <label className="admin-about-label">
                <FaImage className="admin-about-label-icon" />
                Hero Image URL
              </label>
              <input 
                type="text" 
                className="admin-about-input"
                value={aboutContent.mainImage || ''} 
                onChange={(e) => updateAboutField('mainImage', e.target.value)} 
                placeholder="/about-placeholder.svg or https://..." 
              />
              {aboutContent.mainImage && (
                <div className="admin-about-image-preview">
                  <img 
                    src={resolveImageUrl(aboutContent.mainImage || '/about-placeholder.svg')} 
                    alt="Hero preview" 
                    className="admin-about-preview-image"
                    onError={(e) => { e.currentTarget.src = '/about-placeholder.svg'; }} 
                  />
                  <div className="admin-about-image-overlay">Preview</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Description Section */}
        <div className="admin-about-card">
          <div className="admin-about-card-header">
            <h2 className="admin-about-card-title">Main Description</h2>
            <p className="admin-about-card-description">
              Primary description about your platform and services
            </p>
          </div>
          <div className="admin-about-card-body">
            <div className="admin-about-form-group">
              <label className="admin-about-label">
                Section Title *
              </label>
              <input 
                type="text" 
                className="admin-about-input"
                value={aboutContent.sectionTitle || ''} 
                onChange={(e) => updateAboutField('sectionTitle', e.target.value)} 
                placeholder="About CareerHub" 
              />
            </div>
            <div className="admin-about-form-group">
              <label className="admin-about-label">
                Description *
              </label>
              <textarea 
                className="admin-about-textarea"
                value={aboutContent.description || ''} 
                onChange={(e) => updateAboutField('description', e.target.value)} 
                rows={4} 
                placeholder="Describe the platform, mission, and value proposition..." 
              />
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="admin-about-card">
          <div className="admin-about-card-header">
            <h2 className="admin-about-card-title">Mission Section</h2>
          </div>
          <div className="admin-about-card-body">
            <div className="admin-about-form-group">
              <label className="admin-about-label">
                Mission Title *
              </label>
              <input 
                type="text" 
                className="admin-about-input"
                value={aboutContent.mission?.title || ''} 
                onChange={(e) => updateAboutSection('mission', 'title', e.target.value)} 
                placeholder="Our Mission" 
              />
            </div>
            <div className="admin-about-form-group">
              <label className="admin-about-label">
                Mission Description *
              </label>
              <textarea 
                className="admin-about-textarea"
                value={aboutContent.mission?.description || ''} 
                onChange={(e) => updateAboutSection('mission', 'description', e.target.value)} 
                rows={3} 
                placeholder="Empower people to discover meaningful work while helping companies build diverse, high-performing teams." 
              />
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="admin-about-card">
          <div className="admin-about-card-header">
            <h2 className="admin-about-card-title">Vision Section</h2>
          </div>
          <div className="admin-about-card-body">
            <div className="admin-about-form-group">
              <label className="admin-about-label">
                Vision Title *
              </label>
              <input 
                type="text" 
                className="admin-about-input"
                value={aboutContent.vision?.title || ''} 
                onChange={(e) => updateAboutSection('vision', 'title', e.target.value)} 
                placeholder="Our Vision" 
              />
            </div>
            <div className="admin-about-form-group">
              <label className="admin-about-label">
                Vision Description *
              </label>
              <textarea 
                className="admin-about-textarea"
                value={aboutContent.vision?.description || ''} 
                onChange={(e) => updateAboutSection('vision', 'description', e.target.value)} 
                rows={3} 
                placeholder="A world where the job search is simple, efficient, and tailored to every professional's goals." 
              />
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="admin-about-card">
          <div className="admin-about-card-header">
            <h2 className="admin-about-card-title">Team Section</h2>
            <p className="admin-about-card-description">
              Information about your team and company culture
            </p>
          </div>
          <div className="admin-about-card-body">
            <div className="admin-about-form-grid">
              <div className="admin-about-form-group">
                <label className="admin-about-label">
                  Team Title *
                </label>
                <input 
                  type="text" 
                  className="admin-about-input"
                  value={aboutContent.team?.title || ''} 
                  onChange={(e) => updateAboutTeam('title', e.target.value)} 
                  placeholder="Driven by People" 
                />
              </div>
              <div className="admin-about-form-group">
                <label className="admin-about-label">
                  <FaImage className="admin-about-label-icon" />
                  Team Photo URL
                </label>
                <input 
                  type="text" 
                  className="admin-about-input"
                  value={aboutContent.team?.photo || ''} 
                  onChange={(e) => updateAboutTeam('photo', e.target.value)} 
                  placeholder="/team-placeholder.svg or https://..." 
                />
              </div>
            </div>
            
            {aboutContent.team?.photo && (
              <div className="admin-about-image-preview">
                <img 
                  src={resolveImageUrl(aboutContent.team?.photo || '/team-placeholder.svg')} 
                  alt="Team preview" 
                  className="admin-about-preview-image admin-about-preview-image--team"
                  onError={(e) => { e.currentTarget.src = '/team-placeholder.svg'; }} 
                />
                <div className="admin-about-image-overlay">Team Photo Preview</div>
              </div>
            )}

            <div className="admin-about-form-group">
              <label className="admin-about-label">
                Team Description *
              </label>
              <textarea 
                className="admin-about-textarea"
                value={aboutContent.team?.text || ''} 
                onChange={(e) => updateAboutTeam('text', e.target.value)} 
                rows={4} 
                placeholder="Share information about your team, values, and collaborative culture..." 
              />
            </div>

            <div className="admin-about-highlights-section">
              <h3 className="admin-about-highlights-title">Team Highlights</h3>
              <div className="admin-about-highlights-list">
                {(aboutContent.team?.highlights || []).map((highlight, index) => (
                  <div key={index} className="admin-about-highlight-item">
                    <input 
                      type="text" 
                      className="admin-about-input"
                      value={highlight || ''} 
                      onChange={(e) => updateTeamHighlight(index, e.target.value)} 
                      placeholder="Innovation Focused, User Centric, etc." 
                    />
                    <button 
                      className="admin-about-btn admin-about-btn--danger"
                      type="button" 
                      onClick={() => removeTeamHighlight(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={addTeamHighlight}
                className="admin-about-btn admin-about-btn--outline"
              >
                <FaPlus />
                Add Highlight
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="admin-about-save-section">
          <button 
            type="button" 
            className="admin-about-btn admin-about-btn--primary admin-about-btn--large"
            onClick={saveAboutContent}
            disabled={aboutSaving || aboutLoading}
          >
            {aboutSaving ? (
              <>
                <FaSpinner className="admin-about-btn-spinner" />
                Saving Changes...
              </>
            ) : (
              <>
                <FaSave />
                Publish About Page
              </>
            )}
          </button>
          <p className="admin-about-save-note">
            Changes will be visible on the public About page immediately after saving.
          </p>
        </div>
      </div>
    </div>
  );
}