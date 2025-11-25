import React, { useEffect, useState } from 'react';
import { resolveImageUrl } from '../utils/media';
import './About.css';

const About = () => {
  const [content, setContent] = useState({
    heroTitle: 'Connecting Talent with Opportunity',
    heroSubtitle: 'We help professionals find the right jobs and companies hire the best talent.',
    mainImage: '/about-placeholder.svg',
    sectionTitle: 'About CareerHub',
    description: 'CareerHub is a modern job platform designed to connect skilled professionals with forward-thinking companies. We combine intuitive search, smart matching, and a clean user experience to make hiring and job seeking fast, transparent, and effective.',
    features: [
      { title: 'Our Mission', text: 'Empower people to discover meaningful work while helping companies build diverse, high-performing teams.' },
      { title: 'Our Vision', text: 'A world where the job search is simple, efficient, and tailored to every professional\'s goals.' },
      { title: 'Our Purpose', text: 'Reduce friction in hiring through technology, design, and trusted community connections.' },
    ],
    stats: [
      { value: '500+', label: 'Jobs Posted' },
      { value: '10,000+', label: 'Registered Users' },
      { value: '25,000+', label: 'Applications' },
    ],
    team: {
      title: 'Driven by People',
      text: 'Our team is dedicated to making the job search simple, efficient, and transparent. We obsess over the details so candidates and employers can focus on what matters: great work and great teams.',
      photo: '/team-placeholder.svg',
      highlights: ['Innovation Focused', 'User Centric', 'Global Impact'],
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch('https://job-site-backend-seven.vercel.app/api/about');
        if (!resp.ok) return; // keep defaults
        const data = await resp.json();
        if (data && Object.keys(data).length) {
          // If mission/vision/purpose provided, derive features for identical layout
          const mvp = ['mission','vision','purpose'].map((k)=> ({
            title: data?.[k]?.title,
            text: data?.[k]?.description,
          })).filter((x)=> (x.title || x.text));
          const features = mvp.length ? mvp : (Array.isArray(data.features) ? data.features : []);
          // Merge with sensible fallbacks so empty strings from backend don't hide hero text
          setContent((prev) => {
            const merged = { ...prev, ...data, features };
            const safe = (v, fallback) => {
              const s = typeof v === 'string' ? v.trim() : v;
              return s ? v : fallback;
            };
            return {
              ...merged,
              heroTitle: safe(data?.heroTitle, prev.heroTitle),
              heroSubtitle: safe(data?.heroSubtitle, prev.heroSubtitle),
              mainImage: data?.mainImage || prev.mainImage,
              sectionTitle: safe(data?.sectionTitle, prev.sectionTitle),
              description: safe(data?.description, prev.description),
            };
          });
        }
      } catch (_) {
        // silent fallback to defaults
      }
    };
    load();
  }, []);

  // Live totals for stats (jobs, users, applications) with gentle polling
  useEffect(() => {
    let mounted = true;
    let timer;
    const fmt = (n) => `${Number(n || 0).toLocaleString()}+`;
    const fetchTotals = async () => {
      try {
        const respTotals = await fetch('https://job-site-backend-seven.vercel.app/api/analytics/totals');
        if (!respTotals.ok) return;
        const t = await respTotals.json();
        if (!mounted) return;
        setContent((prev) => {
          const totalsMap = {
            'jobs': fmt(t.jobsTotal),
            'users': fmt(t.usersTotal),
            'applications': fmt(t.applicationsTotal),
          };
          const base = Array.isArray(prev.stats) ? [...prev.stats] : [];
          if (!base.length) {
            const stats = [
              { label: 'Jobs Posted', value: totalsMap.jobs },
              { label: 'Registered Users', value: totalsMap.users },
              { label: 'Applications', value: totalsMap.applications },
            ];
            return { ...prev, stats };
          }
          const updated = base.map((s) => {
            const key = String(s.label || '').toLowerCase();
            let v = s.value;
            if (key.includes('job')) v = totalsMap.jobs;
            else if (key.includes('user')) v = totalsMap.users;
            else if (key.includes('app')) v = totalsMap.applications;
            return { ...s, value: v };
          });
          return { ...prev, stats: updated };
        });
      } catch (_) {
        // ignore errors and keep previous stats
      }
    };
    fetchTotals();
    timer = setInterval(fetchTotals, 60000); // update every 60s
    return () => { mounted = false; if (timer) clearInterval(timer); };
  }, []);

  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">{content.heroTitle}</h1>
            <p className="about-hero-subtitle">{content.heroSubtitle}</p>
            <div className="about-hero-accent" />
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="about-main-section">
        <div className="about-container">
          <div className="about-content-grid">
            <div className="about-image-container">
              <img src={resolveImageUrl(content.mainImage || '/about-placeholder.svg')} alt="Teamwork in a modern office" loading="lazy" className="about-main-image" onError={(e)=>{e.currentTarget.src='/about-placeholder.svg';}} />
            </div>
            <div className="about-text-content">
              <h2 className="about-section-title">{content.sectionTitle}</h2>
              <p className="about-description">{content.description}</p>

              <div className="about-features-grid">
                {(content.features || []).map((f, idx) => (
                  <div key={idx} className="about-feature-card">
                    <h3 className="about-feature-title">{f.title || ''}</h3>
                    <p className="about-feature-text">{f.text || ''}</p>
                  </div>
                ))}
              </div>
              {!!content.updatedAt && (
                <div className="about-last-updated" style={{ marginTop: 12, color:'#64748b' }}>
                  Last updated: {new Date(content.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-stats-section">
        <div className="about-container">
          <div className="about-stats-grid">
            {(content.stats || []).map((s, idx) => (
              <div key={idx} className="about-stat-card">
                <div className="about-stat-value">{s.value || ''}</div>
                <div className="about-stat-label">{s.label || ''}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team-section">
        <div className="about-container">
          <div className="about-team-card">
            <div className="about-team-image">
              <img src={resolveImageUrl(content.team?.photo || '/team-placeholder.svg')} alt="Our team" loading="lazy" className="about-team-photo" onError={(e)=>{e.currentTarget.src='/team-placeholder.svg';}} />
            </div>
            <div className="about-team-content">
              <h3 className="about-team-title">{content.team?.title || ''}</h3>
              <p className="about-team-text">{content.team?.text || ''}</p>
              <div className="about-team-highlights">
                {(content.team?.highlights || []).map((h, idx) => (
                  <div key={idx} className="about-team-highlight">
                    <span className="about-highlight-icon">•</span>
                    <span>{h || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;