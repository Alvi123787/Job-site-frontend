import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { API_BASE } from '../utils/media';
import './Dashboard.css';

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Internship'];
const BLOG_TYPES = ['Career', 'Technical', 'Lifestyle', 'News'];

const JOB_COLORS = {
  'Full-time': '#3B82F6', // blue
  'Part-time': '#6366F1', // indigo
  'Remote': '#10B981', // green
  'Internship': '#F59E0B', // amber
};

const BLOG_COLORS = {
  'Career': '#EF4444', // red
  'Technical': '#06B6D4', // cyan
  'Lifestyle': '#F472B6', // pink
  'News': '#8B5CF6', // violet
};

function classifyJobType(job) {
  const jt = String(job?.jobType || job?.type || '').toLowerCase();
  const wm = String(job?.workMode || '').toLowerCase();
  if (job?.remote || /remote/.test(wm)) return 'Remote';
  if (/intern/.test(jt)) return 'Internship';
  if (/part/.test(jt)) return 'Part-time';
  return 'Full-time';
}

function classifyBlogType(blog) {
  const c = String(blog?.category || '').toLowerCase();
  if (/career|resume|interview|tips/.test(c)) return 'Career';
  if (/tech|technical|tutorial|code|programming|engineering/.test(c)) return 'Technical';
  if (/news|industry/.test(c)) return 'News';
  return 'Lifestyle';
}

export default function TypeBreakdownChart() {
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [jobsResp, blogsResp] = await Promise.all([
          fetch(`${API_BASE}/api/jobs?page=1&limit=100`),
          fetch(`${API_BASE}/api/blogs`),
        ]);
        const jobsJson = await jobsResp.json().catch(() => ({}));
        const blogsJson = await blogsResp.json().catch(() => ([]));
        if (!jobsResp.ok) throw new Error(jobsJson?.error || 'Failed to load jobs');
        if (!blogsResp.ok) throw new Error(blogsJson?.error || 'Failed to load blogs');

        const jobList = Array.isArray(jobsJson) ? jobsJson : (Array.isArray(jobsJson?.jobs) ? jobsJson.jobs : []);
        if (!mounted) return;
        setJobs(jobList);
        setBlogs(Array.isArray(blogsJson) ? blogsJson : []);
      } catch (e) {
        if (mounted) setError(e.message || 'Server error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const jobData = useMemo(() => {
    const counts = JOB_TYPES.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
    jobs.forEach((j) => {
      const type = classifyJobType(j);
      counts[type] = (counts[type] || 0) + 1;
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return JOB_TYPES.map((name) => ({ name, value: counts[name], percent: (counts[name] / total) }));
  }, [jobs]);

  const blogData = useMemo(() => {
    const counts = BLOG_TYPES.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
    blogs.forEach((b) => {
      const type = classifyBlogType(b);
      counts[type] = (counts[type] || 0) + 1;
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return BLOG_TYPES.map((name) => ({ name, value: counts[name], percent: (counts[name] / total) }));
  }, [blogs]);

  const renderLegend = (items, colorMap) => (
    <div className="custom-legend" style={{ justifyContent: 'center' }}>
      {items.map((it) => (
        <span key={it.name} className="legend-item">
          <span className="legend-item-dot" style={{ backgroundColor: colorMap[it.name] }}></span>
          {it.name}
        </span>
      ))}
    </div>
  );

  const labelFmt = ({ percent }) => `${Math.round(percent * 100)}%`;

  return (
    <div className="engagement-card">
      <div className="engagement-header">
        <div>
          <h2 className="engagement-title">Job & Blog Type Breakdown</h2>
          <p className="engagement-subtitle">Distribution of job types and blog types</p>
        </div>
      </div>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left: Job Types */}
        <div style={{ width: '100%', height: 320 }}>
          {loading ? (
            <div className="chart-loading">Loading type breakdown…</div>
          ) : error ? (
            <div className="chart-error">{error}</div>
          ) : (
            <>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={jobData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={labelFmt}
                  >
                    {jobData.map((entry) => (
                      <Cell key={entry.name} fill={JOB_COLORS[entry.name]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {renderLegend(jobData, JOB_COLORS)}
            </>
          )}
        </div>
        {/* Right: Blog Types */}
        <div style={{ width: '100%', height: 320 }}>
          {loading ? (
            <div className="chart-loading">Loading type breakdown…</div>
          ) : error ? (
            <div className="chart-error">{error}</div>
          ) : (
            <>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={blogData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={labelFmt}
                  >
                    {blogData.map((entry) => (
                      <Cell key={entry.name} fill={BLOG_COLORS[entry.name]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {renderLegend(blogData, BLOG_COLORS)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}