import React, { useEffect, useMemo, useState } from 'react';
import BlogCard from '../components/BlogCard';
import { Link } from 'react-router-dom';
import { resolveImageUrl, API_BASE } from '../utils/media';
import './BlogPage.css';
import BlogSidebar from '../components/BlogSidebar';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [shownCount, setShownCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [animateFrom, setAnimateFrom] = useState(0);
  // Newsletter (sidebar) state
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState({ type: '', message: '' });
  const CHUNK_SIZE = 8;

  // Load blogs from backend
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/blogs`);
        if (!resp.ok) throw new Error('Failed to fetch blogs');
        const data = await resp.json();
        const list = Array.isArray(data) ? data : [];
        setBlogs(list);
      } catch (_) {
        // If backend unreachable, keep empty list (or we could fallback to a small static set)
        setBlogs([]);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    blogs.forEach((b) => { if (b?.category) set.add(b.category); });
    return Array.from(set);
  }, [blogs]);

  const tags = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => (Array.isArray(b?.tags) ? b.tags : []).forEach((t) => set.add(String(t))));
    const arr = Array.from(set);
    return arr.length ? arr : ['Resume', 'Remote', 'Interview', 'Productivity', 'Tech', 'Culture'];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const title = String(b?.title || '');
      const excerpt = String(b?.shortDesc || '');
      const author = String(b?.author || '');
      const category = String(b?.category || '');
      const matchesCategory = activeCategory === 'All' || category === activeCategory;
      const normalized = (query || selectedTag).toLowerCase();
      const matchesQuery = normalized
        ? [title, excerpt, author].some((t) => t.toLowerCase().includes(normalized))
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [blogs, activeCategory, query, selectedTag]);

  const visibleBlogs = filteredBlogs.slice(0, shownCount);
  const popularPosts = blogs.slice(0, 4);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (loading) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 200;
      const canLoadMore = shownCount < filteredBlogs.length;
      if (scrollBottom >= threshold && canLoadMore) {
        setLoading(true);
        setAnimateFrom(shownCount);
        setTimeout(() => {
          setShownCount((c) => Math.min(c + CHUNK_SIZE, filteredBlogs.length));
          setLoading(false);
        }, 600);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, shownCount, filteredBlogs.length]);

  return (
    <main className="blog-page">
      {/* Page Header */}
      <section className="blog-hero">
        <div className="container">
          <div className="hero-header" style={{paddingTop: '50px', paddingBottom: '50px'}}>
            <span className="hero-eyebrow" aria-label="Section">Blog</span>
            <div className="hero-accent" />
            <h1 className="blog-title">Career Insights & Advice</h1>
            <p className="blog-subtitle">Explore tips, trends, and guidance to grow your career.</p>
            <div className="hero-meta" aria-label="Page meta">
              <span className="meta-chip">{blogs.length ? `${blogs.length} articles` : 'Articles & Guides'}</span>
              <span className="meta-sep" aria-hidden="true" />
              <span className="meta-chip">Updated weekly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Layout: content + sidebar */}
      <section className="blog-list">
        <div className="container">
          <div className="blog-layout">
            {/* Left: Content */}
            <div className="content-col">
              {/* Search Bar */}
              <div className="blog-searchbar" role="search">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by title, keyword, or author…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search blogs"
                />
                <button className="search-button" onClick={() => setQuery(query)} aria-label="Run search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              {/* Grid */}
              <div className="blog-grid">
                {visibleBlogs.map((b, idx) => {
                  const dateStr = b?.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : '';
                  const thumbSrc = b?.image ? resolveImageUrl(b.image) : '/about-placeholder.svg';
                  return (
                    <div key={b?._id || idx} className={idx >= animateFrom ? 'fade-in' : ''}>
                      <BlogCard
                        thumbnail={thumbSrc}
                        title={String(b?.title || '')}
                        excerpt={String(b?.shortDesc || '')}
                        author={String(b?.author || '')}
                        date={dateStr}
                        to={b?._id ? `/blog/${b._id}` : undefined}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Infinite scroll replaces Load More button */}
            </div>

            {/* Right: Sidebar */}
            <aside className="sidebar-col">
              {/* Categories (dynamic) */}
              <BlogSidebar
                activeCategory={activeCategory}
                onCategorySelect={(cat) => {
                  setActiveCategory(cat);
                  // Clear text/tag search when a category is selected for cleaner UX
                  setSelectedTag('');
                  setQuery('');
                }}
              />
              
              {/* Popular Posts */}
              <div className="sidebar-card">
                <h3 className="sidebar-title">Popular Posts</h3>
                <ul className="popular-list">
                  {popularPosts.map((p, i) => (
                    <li key={i} className="popular-post">
                      <img src={p?.image ? resolveImageUrl(p.image) : '/about-placeholder.svg'} alt="" className="popular-thumb" />
                      {p?._id ? (
                        <Link to={`/blog/${p._id}`} className="popular-title">{p.title}</Link>
                      ) : (
                        <span className="popular-title">{p.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="sidebar-card">
                <h3 className="sidebar-title">Tags</h3>
                <div className="tags-wrap">
                  {tags.map((t) => (
                    <button
                      key={t}
                      className={`tag-chip ${selectedTag === t.toLowerCase() ? 'active' : ''}`}
                      onClick={() => setSelectedTag(selectedTag === t.toLowerCase() ? '' : t.toLowerCase())}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="sidebar-card newsletter-card">
                <h3 className="sidebar-title">Newsletter</h3>
                {nlStatus.type === 'success' ? (
                  <p className="newsletter-status success">Subscribed! You will get new blog posts.</p>
                ) : (
                  <>
                    <p className="sidebar-note">Get new posts in your inbox.</p>
                    <form
                      className="newsletter-box"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const email = String(nlEmail || '').trim();
                        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                        if (!ok) { setNlStatus({ type: 'error', message: 'Please enter a valid email.', loading: false }); return; }
                        setNlStatus({ type: '', message: '', loading: true });
                        try {
                          const resp = await fetch(`${API_BASE}/api/subscribe`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, type: 'blog' }),
                          });
                          if (!resp.ok) {
                            let msg = 'Subscription failed';
                            try { const j = await resp.json(); msg = j.error || j.message || msg; } catch (_) {}
                            throw new Error(msg);
                          }
                          setNlStatus({ type: 'success', message: 'Subscribed Successfully!', loading: false });
                          setNlEmail('');
                        } catch (err) {
                          setNlStatus({ type: 'error', message: err.message || 'Server error', loading: false });
                        }
                      }}
                    >
                      <input
                        type="email"
                        placeholder="Your email"
                        className="newsletter-input"
                        aria-label="Email address"
                        value={nlEmail}
                        onChange={(e) => setNlEmail(e.target.value)}
                      />
                      <button type="submit" className="newsletter-btn" aria-label="Subscribe to newsletter" disabled={nlStatus.loading}>
                        {nlStatus.loading ? (
                          <>
                            <span className="spinner" aria-hidden="true"></span>
                            Subscribing...
                          </>
                        ) : (
                          'Subscribe'
                        )}
                      </button>
                    </form>
                    {nlStatus.message && (
                      <p className={`newsletter-status ${nlStatus.type === 'error' ? 'error' : 'success'}`}>{nlStatus.message}</p>
                    )}
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogPage;
