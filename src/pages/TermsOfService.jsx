import React, { useEffect, useMemo, useState } from 'react';
import './TermsOfService.css';

const sections = [
  {
    key: 'introduction',
    title: 'Introduction',
    content: (
      <p>
        These Terms of Service govern your access to and use of our job website (the “Platform”).
        By using the Platform, you enter into a legally binding agreement with us regarding your
        rights, responsibilities, and acceptable use. Please read these terms carefully.
      </p>
    ),
  },
  {
    key: 'acceptance',
    title: 'Acceptance of Terms',
    content: (
      <p>
        By accessing, browsing, or using the Platform in any manner, you acknowledge that you
        have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
        If you do not agree, you must not use the Platform.
      </p>
    ),
  },
  {
    key: 'user-responsibilities',
    title: 'User Responsibilities',
    content: (
      <ul>
        <li>Provide accurate information and keep your account details up to date.</li>
        <li>Do not create fake profiles, impersonate others, or misrepresent affiliations.</li>
        <li>Do not spam, post misleading content, or misuse Platform features.</li>
        <li>Respect intellectual property and privacy rights of others.</li>
        <li>Use the Platform in compliance with applicable laws and regulations.</li>
      </ul>
    ),
  },
  {
    key: 'account-registration',
    title: 'Account Registration',
    content: (
      <ul>
        <li>Accounts must be created with accurate, complete, and current information.</li>
        <li>You are responsible for safeguarding your login credentials and all activity under your account.</li>
        <li>Notify us immediately of any unauthorized use or security breach.</li>
      </ul>
    ),
  },
  {
    key: 'jobs-and-applications',
    title: 'Job Posting & Applications',
    content: (
      <ul>
        <li>Employers must post truthful and lawful job listings and comply with hiring regulations.</li>
        <li>Job seekers must submit accurate applications and refrain from misrepresenting qualifications.</li>
        <li>We may moderate, remove, or decline listings or applications that violate these terms.</li>
        <li>The Platform facilitates connections; we do not guarantee employment outcomes or offer legal advice.</li>
      </ul>
    ),
  },
  {
    key: 'ip-rights',
    title: 'Intellectual Property Rights',
    content: (
      <p>
        The Platform, including its design, text, graphics, logos, and software, is protected by
        intellectual property laws. Trademarks, service marks, and logos displayed on the Platform
        are our property or that of licensors and may not be used without prior written consent.
        Content you post remains yours, but you grant us a limited license to host, display, and
        distribute such content in connection with the Platform’s operation.
      </p>
    ),
  },
  {
    key: 'prohibited-activities',
    title: 'Prohibited Activities',
    content: (
      <ul>
        <li>No scraping, crawling, or harvesting of data without authorization.</li>
        <li>No hacking, probing, or attempting to bypass security or access controls.</li>
        <li>No sharing confidential or non-public information obtained through the Platform.</li>
        <li>No uploading malware or performing actions that disrupt Platform operations.</li>
      </ul>
    ),
  },
  {
    key: 'limitation-of-liability',
    title: 'Limitation of Liability',
    content: (
      <p>
        To the fullest extent permitted by law, the Platform and its owners, affiliates, employees,
        and agents are not liable for indirect, incidental, special, consequential, or punitive damages,
        nor for third-party content, actions, or employment outcomes. The Platform is provided “as is”
        without warranties of any kind, express or implied.
      </p>
    ),
  },
  {
    key: 'termination',
    title: 'Termination of Access',
    content: (
      <p>
        We may suspend or terminate your access to the Platform at any time, with or without notice,
        if we believe you have violated these terms or engaged in unlawful or harmful conduct.
      </p>
    ),
  },
  {
    key: 'modifications',
    title: 'Modifications to Terms',
    content: (
      <p>
        We may update these Terms of Service from time to time. Material changes will be noted with an
        updated “Last Updated” date. Continued use of the Platform after changes become effective
        constitutes acceptance of the revised terms.
      </p>
    ),
  },
  {
    key: 'governing-law',
    title: 'Governing Law',
    content: (
      <p>
        These terms are governed by the laws and jurisdiction specified by the Platform’s operating entity.
        Disputes will be resolved exclusively in the courts of the applicable jurisdiction.
      </p>
    ),
  },
  {
    key: 'contact',
    title: 'Contact Information',
    content: (
      <p>
        For questions or concerns regarding these Terms of Service, contact us at
        <a href="mailto:support@jobsite.example" className="tos-link"> support@jobsite.example</a>.
      </p>
    ),
  },
];

const TermsOfService = () => {
  const [openKey, setOpenKey] = useState('introduction');

  const pageTitle = 'Terms of Service — Job Site';
  const pageDescription = 'Formal terms governing use of the job platform, responsibilities, rights, and limitations.';

  useEffect(() => {
    document.title = pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pageDescription);
    } else {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      m.setAttribute('content', pageDescription);
      document.head.appendChild(m);
    }
  }, [pageTitle, pageDescription]);

  const lastUpdated = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  return (
    <main className="tos-page">
      <header className="tos-hero">
        <div className="container">
          <h1>Terms of Service</h1>
          <p className="subtitle">Please review these terms carefully. Using the Platform signifies your agreement.</p>
        </div>
      </header>

      <nav className="tos-nav" aria-label="Terms navigation">
        <div className="container nav-grid">
          {sections.map((s) => (
            <a key={s.key} href={`#${s.key}`} className={`nav-item ${openKey === s.key ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              setOpenKey(s.key);
              const el = document.getElementById(s.key);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>{s.title}</a>
          ))}
        </div>
      </nav>

      <section className="tos-content">
        <div className="container">
          {sections.map((s) => (
            <details key={s.key} id={s.key} className={`tos-section ${openKey === s.key ? 'open' : ''}`} open={openKey === s.key} onToggle={(e) => {
              if (e.currentTarget.open) setOpenKey(s.key);
            }}>
              <summary>
                <span className="section-icon" aria-hidden>📄</span>
                <h2>{s.title}</h2>
              </summary>
              <div className="section-body">
                {s.content}
              </div>
            </details>
          ))}
        </div>
      </section>

      <footer className="tos-footer">
        <div className="container">
          <div className="ack-row">
            <input type="checkbox" id="tos-ack" />
            <label htmlFor="tos-ack">I acknowledge and agree to the Terms of Service.</label>
          </div>
          <div className="last-updated">Last Updated: {lastUpdated}</div>
        </div>
      </footer>
    </main>
  );
};

export default TermsOfService;