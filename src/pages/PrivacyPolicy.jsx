import React from 'react';
import './PrivacyPolicy.css';

const PolicyLastUpdated = () => {
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <p className="policy-updated" aria-label="Last updated">Last updated: {dateStr}</p>
  );
};

const PrivacyPolicy = () => {
  const contactEmail = import.meta?.env?.VITE_PRIVACY_EMAIL || 'privacy@example.com';
  return (
    <main className="policy-page" role="main">
      <section className="policy-hero">
        <div className="container">
          <span className="hero-eyebrow">Privacy Policy</span>
          <div className="hero-accent" />
          <h1 className="policy-title">Your Privacy Matters</h1>
          <p className="policy-subtitle">We are committed to protecting your personal information and being transparent about how we handle data across our job platform.</p>
        </div>
      </section>

      <section className="policy-content">
        <div className="container">
          {/* Introduction */}
          <details className="policy-section" open>
            <summary>
              <span className="section-icon" aria-hidden="true">{/* shield icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Introduction
            </summary>
            <div className="section-body">
              <p>Welcome to our job website (“Platform”). This Privacy Policy explains what data we collect, how we use it, and the choices you have. By using the Platform, you agree to the practices described here.</p>
            </div>
          </details>

          {/* Information We Collect */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5z" stroke="currentColor" strokeWidth="2"/><path d="M3 21c1.5-3.5 5-6 9-6s7.5 2.5 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              Information We Collect
            </summary>
            <div className="section-body">
              <ul>
                <li>Account details: name, email, password (hashed).</li>
                <li>Profile data: resume/CV, skills, experience, location preferences.</li>
                <li>Application data: jobs applied to, saved jobs, messages with employers.</li>
                <li>Usage data: device information, pages visited, interactions, and approximate geolocation inferred from IP.</li>
                <li>Cookies and tracking identifiers: to remember preferences and improve performance.</li>
              </ul>
            </div>
          </details>

          {/* How We Use Your Information */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h12M4 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              How We Use Your Information
            </summary>
            <div className="section-body">
              <ul>
                <li>Provide core features: job search, applications, employer messaging.</li>
                <li>Personalize content: recommendations based on your profile and activity.</li>
                <li>Communicate updates: application status, interview requests, newsletters (with consent).</li>
                <li>Improve Platform: analytics to understand usage, fix issues, and enhance performance.</li>
                <li>Security and compliance: detect abuse, fraud, or violations of our terms.</li>
              </ul>
            </div>
          </details>

          {/* Data Sharing & Disclosure */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/><path d="M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              Data Sharing & Disclosure
            </summary>
            <div className="section-body">
              <p>We share limited data when necessary:</p>
              <ul>
                <li>With employers: information you choose to share as part of job applications.</li>
                <li>Service providers: hosting, analytics, email delivery, and security tools, under data processing agreements.</li>
                <li>Legal requirements: when required by law or to protect rights, safety, and integrity of our users and Platform.</li>
              </ul>
              <p>We do not sell personal data.</p>
            </div>
          </details>

          {/* Cookies & Tracking */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2"/><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              Cookies & Tracking Technologies
            </summary>
            <div className="section-body">
              <p>We use cookies and similar technologies to remember preferences, keep you signed in, and analyze usage. You can manage cookies in your browser settings. Disabling cookies may limit certain features.</p>
            </div>
          </details>

          {/* Data Security */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V7l8-4z" stroke="currentColor" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              Data Security
            </summary>
            <div className="section-body">
              <p>We employ administrative, technical, and physical safeguards to protect personal data, including encryption in transit (HTTPS), access controls, server hardening, and regular monitoring.</p>
            </div>
          </details>

          {/* User Rights */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              Your Rights
            </summary>
            <div className="section-body">
              <ul>
                <li>Access: request a copy of your personal data.</li>
                <li>Correction: update or fix inaccurate information.</li>
                <li>Deletion: request deletion of your data, subject to legal or legitimate business needs.</li>
                <li>Consent management: adjust marketing and communication preferences.</li>
              </ul>
              <p>To exercise these rights, contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>
            </div>
          </details>

          {/* Third-Party Links */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              Third-Party Links
            </summary>
            <div className="section-body">
              <p>Our Platform may contain links to external websites. We are not responsible for the privacy practices of those sites. We encourage you to review their policies.</p>
            </div>
          </details>

          {/* Updates to Policy */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/></svg>
              </span>
              Updates to This Policy
            </summary>
            <div className="section-body">
              <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. Significant updates will be communicated via the Platform or by email, where appropriate.</p>
            </div>
          </details>

          {/* Contact */}
          <details className="policy-section">
            <summary>
              <span className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2"/><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
              Contact Information
            </summary>
            <div className="section-body">
              <p>For privacy inquiries, contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a> or use the contact form available on the Platform.</p>
            </div>
          </details>

          <PolicyLastUpdated />
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;