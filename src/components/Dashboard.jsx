// Dashboard.js
import React, { useEffect, useMemo, useState, useRef } from 'react';
import './Dashboard.css';
// Chart moved to dedicated EngagementChart component
 
import EngagementChart from './EngagementChart.jsx';

const Dashboard = () => {
  // Inline SVG icons (to avoid external icon dependencies)
  const SvgIcon = ({ name }) => {
    const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };
    switch (name) {
      case 'briefcase':
        return (
          <svg {...common}>
            <path d="M9 7V6a3 3 0 013-3h0a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'file':
        return (
          <svg {...common}>
            <path d="M7 3h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
            <path d="M15 3v6h6" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'check':
        return (
          <svg {...common}>
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'clock':
        return (
          <svg {...common}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'users':
        return (
          <svg {...common}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'eye':
        return (
          <svg {...common}>
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'message':
        return (
          <svg {...common}>
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'edit':
        return (
          <svg {...common}>
            <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M14 6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'trash':
        return (
          <svg {...common}>
            <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 6V5a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" />
            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    draftJobs: 0,
    expiredJobs: 0,
    totalApplicants: 0,
    totalBlogPosts: 0,
    blogEngagement: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });
  const [engagementData, setEngagementData] = useState([]);

  // Animated counter for stats values
  const AnimatedCount = ({ value, duration = 1200 }) => {
    const [display, setDisplay] = useState(0);
    const prevRef = useRef(0);
    useEffect(() => {
      const start = prevRef.current;
      const end = Number(value) || 0;
      const diff = end - start;
      const startTs = performance.now();
      const step = (ts) => {
        const t = Math.min(1, (ts - startTs) / duration);
        setDisplay(Math.round(start + diff * t));
        if (t < 1) requestAnimationFrame(step);
        else prevRef.current = end;
      };
      requestAnimationFrame(step);
    }, [value, duration]);
    return <span className="stat-value">{display}</span>;
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setStatus({ loading: true, error: '' });
        // Fetch job stats, blogs total, and analytics engagement series
        const [statsResp, blogsResp, analyticsResp] = await Promise.all([
          fetch('https://job-site-backend-seven.vercel.app/api/jobs/stats'),
          fetch('https://job-site-backend-seven.vercel.app/api/blogs'),
          fetch('https://job-site-backend-seven.vercel.app/api/analytics/engagement?days=14'),
        ]);

        const statsData = await statsResp.json();
        if (!statsResp.ok) throw new Error(statsData?.error || 'Failed to load job stats');

        const blogsData = await blogsResp.json();
        if (!blogsResp.ok) throw new Error(blogsData?.error || 'Failed to load blogs');
        const blogsArr = Array.isArray(blogsData) ? blogsData : [];

        const analyticsData = await analyticsResp.json();
        if (!analyticsResp.ok) throw new Error(analyticsData?.error || 'Failed to load analytics');

        if (!mounted) return;
        setMetrics({
          totalJobs: Number(statsData?.totalJobs || 0),
          activeJobs: Number(statsData?.activeJobs || 0),
          draftJobs: Number(statsData?.draftJobs || 0),
          expiredJobs: Number(statsData?.expiredJobs || 0),
          totalApplicants: Number(analyticsData?.totalApplicants || 0),
          totalBlogPosts: Number(blogsArr.length || 0),
          blogEngagement: Number(analyticsData?.totalBlogViews || 0),
        });
        const list = Array.isArray(statsData?.recentJobs) ? statsData.recentJobs : [];
        setRecentJobs(list);

        // Use engagement series from analytics API
        const series = Array.isArray(analyticsData?.days) ? analyticsData.days : [];
        setEngagementData(series.map((r) => ({ date: r.date, jobApplications: r.jobApplications, blogViews: r.blogViews })));
      } catch (err) {
        if (mounted) setStatus({ loading: false, error: err.message || 'Server error' });
        return;
      } finally {
        if (mounted) setStatus((s) => ({ ...s, loading: false }));
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => ([
    { title: 'Total Jobs', value: Number(metrics.totalJobs || 0), icon: 'briefcase', color: 'var(--primary)', change: '+7% from last week' },
    { title: 'Active Jobs', value: Number(metrics.activeJobs || 0), icon: 'check', color: '#10B981', change: '+5% from last week' },
    { title: 'Total Applicants', value: Number(metrics.totalApplicants || 0), icon: 'users', color: '#6366F1', change: '+3% from last week' },
    { title: 'Total Blog Posts', value: Number(metrics.totalBlogPosts || 0), icon: 'file', color: '#F472B6', change: '+2% from last week' },
    { title: 'Blog Views', value: Number(metrics.blogEngagement || 0), icon: 'eye', color: '#F59E0B', change: '+1% from last week' },
  ]), [metrics]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your job posts.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              <SvgIcon name={stat.icon} />
            </div>
            <div className="stat-content">
              <h3><AnimatedCount value={stat.value} /></h3>
              <p>{stat.title}</p>
              {stat.change ? (
                <span className={`stat-change ${String(stat.change).startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.change}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Line Chart */}
      <EngagementChart />
      {/* Recent jobs table removed per request */}
    </div>
  );
};

export default Dashboard;