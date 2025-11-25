import React, { useEffect, useMemo, useState } from 'react';
import './UpcomingEventsCalendar.css';
 

function toISODate(d) {
  try {
    const date = d instanceof Date ? d : new Date(d);
    if (!Number.isFinite(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (_) { return ''; }
}

function useUpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch jobs (active only) and blogs
        const [jobsResp, blogsResp] = await Promise.all([
          fetch('https://job-site-backend-seven.vercel.app/api/jobs?limit=100').catch(() => null),
          fetch('https://job-site-backend-seven.vercel.app/api/blogs').catch(() => null),
        ]);
        const jobsJson = jobsResp ? await jobsResp.json().catch(() => ({})) : {};
        const blogsJson = blogsResp ? await blogsResp.json().catch(() => ({})) : {};
        const jobs = Array.isArray(jobsJson) ? jobsJson : (Array.isArray(jobsJson?.jobs) ? jobsJson.jobs : []);
        const blogs = Array.isArray(blogsJson) ? blogsJson : [];

        const jobEvents = jobs.flatMap((j) => {
          const items = [];
          if (j.deadline) {
            items.push({
              type: 'job',
              date: new Date(j.deadline),
              title: `Application deadline – ${j.title}`,
              time: '5:00 PM',
            });
          }
          if (j.endDate) {
            items.push({
              type: 'job',
              date: new Date(j.endDate),
              title: `Expires – ${j.title}`,
              time: '11:59 PM',
            });
          }
          // Interview date not in schema; reserved for future.
          return items;
        });

        const blogEvents = blogs.map((b) => ({
          type: 'blog',
          date: new Date(b.publishedAt || b.createdAt),
          title: `Blog “${b.title}” publish`,
          time: '10:00 AM',
        }));

        const combined = [...jobEvents, ...blogEvents]
          .filter((e) => Number.isFinite(e.date?.getTime()))
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (mounted) setEvents(combined);
      } catch (e) {
        if (mounted) {
          setError(e?.message || 'Failed to load events');
          setEvents([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { events, loading, error };
}

export default function UpcomingEventsCalendar() {
  const { events, loading, error } = useUpcomingEvents();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0..6
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const key = toISODate(e.date);
      if (!key) return;
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    });
    return map;
  }, [events]);

  const gridCells = useMemo(() => {
    const cells = [];
    // Leading blanks
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ empty: true });
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const key = toISODate(dateObj);
      const items = byDate.get(key) || [];
      cells.push({ day: d, date: key, items });
    }
    return cells;
  }, [startWeekday, daysInMonth, year, month, byDate]);

  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="sidebar-calendar-card" aria-busy={loading}>
      <div className="calendar-header">
        <h3 className="calendar-title">Upcoming Events</h3>
        <span className="calendar-subtitle">{monthName} {year}</span>
      </div>
      {error ? (
        <div className="calendar-error">{error}</div>
      ) : (
        <div className="calendar-grid" role="grid" aria-label={`Calendar for ${monthName} ${year}`}>
          {/* Weekday labels */}
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((w) => (
            <div key={`wd-${w}`} className="calendar-cell weekday" role="columnheader">{w}</div>
          ))}
          {/* Days */}
          {gridCells.map((cell, idx) => {
            if (cell.empty) return <div key={`empty-${idx}`} className="calendar-cell empty" aria-hidden="true" />;
            const hasEvents = Array.isArray(cell.items) && cell.items.length > 0;
            return (
              <div
                key={`day-${cell.day}`}
                className={`calendar-cell day ${hasEvents ? 'has-events' : ''}`}
                role="gridcell"
                aria-selected={false}
                aria-label={hasEvents ? `${cell.day} – ${cell.items.length} event${cell.items.length>1?'s':''}` : String(cell.day)}
              >
                <div className="day-number">{cell.day}</div>
                {hasEvents && (
                  <div className="event-markers">
                    {cell.items.slice(0, 3).map((e, i) => (
                      <span
                        key={`mk-${cell.date}-${i}`}
                        className={`event-dot ${e.type === 'job' ? 'job' : 'blog'}`}
                        title={`${e.title} – ${e.time}`}
                      />
                    ))}
                    {cell.items.length > 3 && (
                      <span className="more-count" title={`${cell.items.length} events`}>
                        +{cell.items.length - 3}
                      </span>
                    )}
                  </div>
                )}
                {/* Hover details popover */}
                {hasEvents && (
                  <div className="event-popover">
                    <ul>
                      {cell.items.map((e, i) => (
                        <li key={`ev-${cell.date}-${i}`}>
                          <span className={`tag ${e.type}`}>{e.type === 'job' ? 'Job' : 'Blog'}</span>
                          <span className="detail">{e.title} – {e.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Legend */}
      <div className="calendar-legend">
        <span className="legend-item"><span className="legend-dot job" /> Job Event</span>
        <span className="legend-item"><span className="legend-dot blog" /> Blog Event</span>
      </div>
    </div>
  );
}