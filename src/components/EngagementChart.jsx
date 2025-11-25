import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
 
import './Dashboard.css';

const formatDateLabel = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) {
    return iso;
  }
};

export default function EngagementChart() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('week'); // today | week | month | custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const queryForRange = useMemo(() => {
    if (range === 'today') return 'https://job-site-backend-seven.vercel.app/api/analytics/engagement?days=1';
    if (range === 'week') return 'https://job-site-backend-seven.vercel.app/api/analytics/engagement?days=7';
    if (range === 'month') return 'https://job-site-backend-seven.vercel.app/api/analytics/engagement?days=30';
    if (range === 'custom' && customStart && customEnd) {
      return `https://job-site-backend-seven.vercel.app/api/analytics/engagement?start=${encodeURIComponent(customStart)}&end=${encodeURIComponent(customEnd)}`;
    }
    // default
    return 'https://job-site-backend-seven.vercel.app/api/analytics/engagement?days=14';
  }, [range, customStart, customEnd]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const resp = await fetch(queryForRange);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Failed to load engagement data');
        const rows = Array.isArray(data?.days) ? data.days : [];
        const prepared = rows.map((r) => ({
          date: formatDateLabel(r.date),
          jobApplications: Number(r.jobApplications || 0),
          blogViews: Number(r.blogViews || 0),
        }));
        if (!mounted) return;
        setSeries(prepared);
      } catch (err) {
        if (mounted) setError(err.message || 'Server error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [queryForRange]);

  // Custom legend to avoid duplicate entries from Area + Line
  const LegendContent = () => (
    <div className="custom-legend">
      <span className="legend-item"><span className="legend-item-dot" style={{ backgroundColor: '#3B82F6' }}></span> Job Applications</span>
      <span className="legend-item"><span className="legend-item-dot" style={{ backgroundColor: '#10B981' }}></span> Blog Views</span>
    </div>
  );

  // Custom tooltip that de-duplicates entries (Area + Line share the same dataKey)
  const CustomTooltip = ({ active, label, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const seen = new Set();
    const unique = [];
    payload.forEach((item) => {
      const key = item.dataKey || item.name;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    return (
      <div className="custom-tooltip">
        <div className="tooltip-title">Date: {label}</div>
        {unique.map((it) => (
          <div key={it.dataKey} className="tooltip-row">
            <span className="legend-item-dot" style={{ backgroundColor: it.color }}></span>
            <span>{it.name}</span>
            <span>: {it.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="engagement-card">
      <div className="engagement-header">
        <div>
          <h2 className="engagement-title">Platform Engagement Over Time</h2>
          <p className="engagement-subtitle">Comparison of Job Applications and Blog Views across all users</p>
        </div>
        <div className="engagement-controls">
          <select
            className="range-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Select time range"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom</option>
          </select>
          {range === 'custom' && (
            <div className="date-inputs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                aria-label="Start date"
              />
              <span className="date-sep">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                aria-label="End date"
              />
            </div>
          )}
        </div>
      </div>
      <div style={{ width: '100%', height: 360 }}>
        {loading ? (
          <div className="chart-loading">Loading engagement…</div>
        ) : error ? (
          <div className="chart-error">{error}</div>
        ) : (
          <ResponsiveContainer>
            <ComposedChart data={series} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} />
              <Legend content={LegendContent} />
              {/* Areas with slight opacity */}
              <Area type="monotone" dataKey="jobApplications" name="Job Applications" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.12} />
              <Area type="monotone" dataKey="blogViews" name="Blog Views" stroke="#10B981" fill="#10B981" fillOpacity={0.12} />
              {/* Lines on top for clarity */}
              <Line type="monotone" dataKey="jobApplications" name="Job Applications" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="blogViews" name="Blog Views" stroke="#10B981" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}