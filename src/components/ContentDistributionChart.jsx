import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { API_BASE } from '../utils/media';
import './Dashboard.css';

// Normalize category labels consistently
const normalize = (s) => String(s || '').trim();

export default function ContentDistributionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [jobsResp, blogsResp] = await Promise.all([
          fetch(`${API_BASE}/api/jobs/categories`),
          fetch(`${API_BASE}/api/blogs`),
        ]);

        const jobsJson = await jobsResp.json().catch(() => ({}));
        const blogsJson = await blogsResp.json().catch(() => ([]));
        if (!jobsResp.ok) throw new Error(jobsJson?.error || 'Failed to load job categories');
        if (!blogsResp.ok) throw new Error(blogsJson?.error || 'Failed to load blogs');

        // Jobs: [{ name, count }]
        const jobCats = Array.isArray(jobsJson?.categories) ? jobsJson.categories : [];
        const jobMap = new Map();
        jobCats.forEach((c) => {
          const key = normalize(c?.name);
          if (!key) return;
          jobMap.set(key, { label: c?.name || key, jobs: Number(c?.count || 0) });
        });

        // Blogs: reduce by blog.category
        const blogCounts = new Map();
        (Array.isArray(blogsJson) ? blogsJson : []).forEach((b) => {
          const key = normalize(b?.category);
          if (!key) return;
          const prev = blogCounts.get(key) || { label: b?.category || key, blogs: 0 };
          blogCounts.set(key, { label: prev.label, blogs: prev.blogs + 1 });
        });

        // Union categories
        const allKeys = new Set([...jobMap.keys(), ...blogCounts.keys()]);
        const rows = Array.from(allKeys).map((key) => {
          const j = jobMap.get(key);
          const b = blogCounts.get(key);
          const label = normalize(j?.label || b?.label || key);
          return {
            name: label,
            jobs: Number(j?.jobs || 0),
            blogs: Number(b?.blogs || 0),
          };
        });

        // Sort by name for stable display
        rows.sort((a, b) => a.name.localeCompare(b.name));

        if (!mounted) return;
        setData(rows);
      } catch (e) {
        if (mounted) setError(e.message || 'Server error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const hasData = useMemo(() => Array.isArray(data) && data.length > 0, [data]);

  return (
    <div className="engagement-card">
      <div className="engagement-header">
        <div>
          <h2 className="engagement-title">Content Distribution by Category</h2>
          <p className="engagement-subtitle">Grouped comparison of Job posts and Blog posts</p>
        </div>
      </div>
      <div style={{ width: '100%', height: 360 }}>
        {loading ? (
          <div className="chart-loading">Loading content distribution…</div>
        ) : error ? (
          <div className="chart-error">{error}</div>
        ) : (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobs" name="Jobs" fill="#3B82F6" />
              <Bar dataKey="blogs" name="Blogs" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}