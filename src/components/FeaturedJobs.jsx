import React, { useEffect, useState } from 'react';
import './FeaturedJobs.css';
import JobCard from './JobCard';
import { Link } from 'react-router-dom';
 

const FeaturedJobs = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const resp = await fetch('https://job-site-backend-seven.vercel.app/api/jobs?featured=true&limit=8');
        if (!resp.ok) throw new Error('Failed to load featured jobs');
        const data = await resp.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []);
        const mapped = list.map(toJobCardFromApi);
        if (mounted) setFeaturedJobs(mapped);
      } catch (e) {
        if (mounted) setError(e.message || 'Error loading jobs');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Map API JobPost to JobCard shape
  const toJobCardFromApi = (job) => {
    // Keep geographic location; treat remote as work type
    const location = `${job.city || ''}${job.state ? ', ' + job.state : ''}${job.country ? ', ' + job.country : ''}`.replace(/^,\s*/, '');
    const salary = Number(job.salaryMax || job.salaryMin || 0) || undefined;
    return {
      id: job._id || job.id,
      title: job.title,
      company: job.company,
      logo: job.companyLogo || '/company-placeholder.svg',
      location,
      workType: job.remote ? 'Remote' : job.workMode,
      remote: !!job.remote,
      type: job.jobType,
      postedDate: new Date(job.postingDate || job.createdAt || Date.now()).toLocaleDateString(),
      postedAt: new Date(job.postingDate || job.createdAt || Date.now()).getTime(),
      endDate: job.endDate ? new Date(job.endDate).getTime() : undefined,
      salary,
      featured: !!job.featured,
    };
  };

  return (
    <section className="featured-jobs-section container" style={{ padding: '24px 0' }}>
      <div className="featured-jobs-container">
        {/* Header */}
        <div className="featured-jobs-header">
          <h2 className="featured-jobs-title home-section-title">Featured Job Offers</h2>
          <p className="featured-jobs-subtitle home-section-subtitle">
            Search your career opportunity through 12,800 jobs
          </p>
        </div>

        {/* Jobs Grid (reuse JobCard design) */}
        {loading ? (
          <div className="featured-jobs-grid" style={{ minHeight: 120 }}>
            <div className="job-card-skeleton" style={{ width: '100%', minHeight: 40 }}>Loading…</div>
          </div>
        ) : (
          <div className="featured-jobs-grid" style={{ rowGap: 16 }}>
            {featuredJobs.slice(0, 6).map((job) => (
              <div key={job.id}>
                <JobCard job={job} />
              </div>
            ))}
            {!error && featuredJobs.length === 0 && (
              <div className="col-12" style={{ textAlign: 'center', color: 'var(--text-light)' }}>No featured jobs yet.</div>
            )}
          </div>
        )}

        {/* View All CTA */}
        <div className="view-all-container" style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Link to="/jobs?feature=true" className="view-all-button" style={{ textDecoration: 'none' }}>
            View More Featured
            <span className="button-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;