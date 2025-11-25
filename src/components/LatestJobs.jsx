import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaArrowRight, FaDollarSign } from 'react-icons/fa';
import './LatestJob.css';
 

const LatestJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatLocation = (j) => (
    j.remote ? 'Remote' : `${j.city || ''}${j.state ? ', ' + j.state : ''}${j.country ? ', ' + j.country : ''}`.replace(/^,\s*/, '')
  );

  const initialLetter = (name) => {
    const s = String(name || '').trim();
    return s ? s[0].toUpperCase() : '?';
  };

  const relativeHours = (ts) => {
    try {
      const t = Number(ts);
      const diff = Date.now() - t;
      if (!Number.isFinite(diff) || diff < 0) return '';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours <= 0) return 'Just now';
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } catch (_) { return ''; }
  };

  const formatSalary = (j) => {
    const cur = j.currency || '$';
    const per = j.salaryPer ? `/${String(j.salaryPer).toLowerCase()}` : '';
    const min = Number(j.salaryMin);
    const max = Number(j.salaryMax);
    if (Number.isFinite(min) && Number.isFinite(max) && max >= min) {
      return `${cur}${min.toLocaleString()}–${max.toLocaleString()}${per}`;
    }
    const single = Number.isFinite(max) ? max : min;
    if (Number.isFinite(single)) return `${cur}${Number(single).toLocaleString()}${per}`;
    return null;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch backend jobs
        const resp = await fetch('https://job-site-backend-seven.vercel.app/api/jobs?limit=50');
        if (!resp.ok) throw new Error('Failed to fetch latest jobs');
        const data = await resp.json();
        const backend = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []);

        // Load locally published jobs (in case server publish failed)
        let local = [];
        try {
          const raw = localStorage.getItem('published_jobs');
          local = raw ? JSON.parse(raw) : [];
        } catch (_) {}

        // Merge and dedupe (prefer backend records by _id)
        const merged = [...backend, ...local];
        const seen = new Set();
        const uniq = [];
        for (const j of merged) {
          const key = String(j._id || j.id || j.raw?._id || `${j.title || ''}|${j.company || ''}`);
          if (!seen.has(key)) { seen.add(key); uniq.push(j); }
        }

        // Helper: resolve a timestamp for 24h filter
        const getTime = (j) => {
          // Backend: postingDate or createdAt
          if (j.postingDate) {
            const t = new Date(j.postingDate).getTime();
            if (Number.isFinite(t)) return t;
          }
          if (j.createdAt) {
            const t = new Date(j.createdAt).getTime();
            if (Number.isFinite(t)) return t;
          }
          // Explicit timestamp if present
          if (j.postedAt) {
            const t = Number(j.postedAt);
            if (Number.isFinite(t)) return t;
          }
          // Local-only: postedDate or raw.postingDate
          if (j.postedDate) {
            const t = new Date(j.postedDate).getTime();
            if (Number.isFinite(t)) return t;
          }
          if (j.raw?.postingDate) {
            const t = new Date(j.raw.postingDate).getTime();
            if (Number.isFinite(t)) return t;
          }
          // Fallback: numeric id from local-only publish (Date.now())
          const idNum = Number(j.id);
          if (Number.isFinite(idNum) && idNum > 0) return idNum;
          return 0;
        };

        const now = Date.now();
        const recent = uniq
          .filter(j => (now - getTime(j)) <= (24 * 60 * 60 * 1000))
          .sort((a, b) => getTime(b) - getTime(a))
          .slice(0, 8);

        if (mounted) setJobs(recent);
      } catch (e) {
        if (mounted) setError(e.message || 'Error loading jobs');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="latest-jobs-section">
      <div className="latest-jobs-container">
        <div className="latest-jobs-header">
          <h2 className="latest-jobs-title">Latest Opportunities</h2>
          <p className="latest-jobs-subtitle">Fresh positions opened in the last 24 hours</p>
        </div>

        <div className="latest-jobs-list">
          {loading ? (
            <div className="latest-job-card">
              <div className="job-details">
                <h3 className="job-title">Loading…</h3>
              </div>
            </div>
          ) : (
            jobs.map((job) => {
              const data = job.raw || job;
              const postedAt = (() => {
                const t1 = new Date(job.postingDate || job.createdAt || 0).getTime();
                const t2 = new Date(job.postedDate || data.postingDate || 0).getTime();
                const t = Number.isFinite(t1) && t1 > 0 ? t1 : (Number.isFinite(t2) ? t2 : Date.now());
                return t;
              })();
              return (
                <div key={job._id || job.id} className="latest-job-card">
                  <div className="job-logo">{initialLetter(data.company)}</div>
                  <div className="job-details">
                    <h3 className="job-title">{data.title}</h3>
                    <div className="job-info">
                      <span className="company-name">{data.company}</span>
                      <span className="job-meta">
                        <FaMapMarkerAlt className="info-icon" />
                        {formatLocation(data)}
                      </span>
                      <span className="job-meta">
                        <FaClock className="info-icon" />
                        {relativeHours(postedAt)}
                      </span>
                      <span className="job-meta">
                        <FaDollarSign className="info-icon" />
                        {formatSalary(data) || '—'}
                      </span>
                    </div>
                  </div>
                  <Link to={`/jobs/${job._id || job.id}`} className="apply-now-btn">Apply Now</Link>
                </div>
              );
            })
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="latest-job-card">
              <div className="job-details">
                <h3 className="job-title">No jobs posted in last 24 hours.</h3>
              </div>
            </div>
          )}
        </div>

        <div className="view-more-container">
          <Link to="/jobs?sort=newest" className="view-more-button">
            View All Opportunities
            <FaArrowRight className="arrow-icon" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestJobs;