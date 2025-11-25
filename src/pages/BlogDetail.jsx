import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE, resolveImageUrl } from '../utils/media';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaClock, 
  FaShareAlt, 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook, 
  FaLink,
  FaCheck,
  FaArrowLeft,
  FaBookmark,
  FaEye
} from 'react-icons/fa';
import './BlogDetail.css';
import { saveBlog, removeBlog, isBlogSaved, fetchSavedItems } from '../utils/saved';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: '' });
  const [related, setRelated] = useState([]);
  const [readingTime, setReadingTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setStatus({ loading: true, error: '' });
        const resp = await fetch(`${API_BASE}/api/blogs/${id}`);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Failed to load blog');
        setBlog(data);

        // Calculate reading time
        if (data.content) {
          const words = data.content.split(/\s+/).length;
          const time = Math.ceil(words / 200); // 200 words per minute
          setReadingTime(time);
        }

        // Update meta
        document.title = `${data.title} – Blog`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.shortDesc || data.title || 'Blog detail');

        // Load related by category or tags
        try {
          const listResp = await fetch(`${API_BASE}/api/blogs`);
          const list = await listResp.json();
          const byCategory = (list || []).filter((b) => b._id !== data._id && b.category === data.category);
          let candidates = byCategory;
          if (!candidates.length && Array.isArray(data.tags) && data.tags.length) {
            const setTags = new Set(data.tags.map(String));
            candidates = (list || []).filter((b) => b._id !== data._id && Array.isArray(b.tags) && b.tags.some((t) => setTags.has(String(t))));
          }
          setRelated(candidates.slice(0, 3));
        } catch (_) {}

        setStatus({ loading: false, error: '' });
      } catch (err) {
        setStatus({ loading: false, error: err?.message || 'Error loading blog' });
      }
    };
    load();
  }, [id]);

  // Record a view and fetch updated views count
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await fetch(`${API_BASE}/api/blogs/${id}/view`, { method: 'POST' });
        const cResp = await fetch(`${API_BASE}/api/blogs/${id}/views`);
        const cData = await cResp.json();
        const views = Number(cData?.views || 0);
        setBlog((b) => ({ ...(b || {}), views }));
      } catch (_) {}
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        (async () => {
          try {
            const data = await fetchSavedItems();
            const isSaved = Array.isArray(data.blogs) && data.blogs.some((b) => String((b._id||b.id)) === String(id));
            setSaved(!!isSaved);
          } catch (_) {
            setSaved(isBlogSaved(id));
          }
        })();
      } else {
        setSaved(isBlogSaved(id));
      }
    } catch (_) {
      setSaved(false);
    }
  }, [id]);

  const bannerSrc = useMemo(() => resolveImageUrl(blog?.image || ''), [blog]);
  const tags = useMemo(() => Array.isArray(blog?.tags) ? blog.tags : [], [blog]);
  const dateStr = useMemo(() => blog?.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '', [blog]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.clearTimeout((copyToClipboard._t));
      copyToClipboard._t = window.setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // fallback: open prompt for manual copy
      window.prompt('Copy link', window.location.href);
    }
  };

  if (status.loading) {
    return (
      <main className="blog-detail">
        <div className="container">
          <div className="blog-skeleton">
            <div className="skeleton-banner"></div>
            <div className="skeleton-content">
              <div className="skeleton-meta"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-excerpt"></div>
              <div className="skeleton-paragraph"></div>
              <div className="skeleton-paragraph short"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status.error) {
    return (
      <main className="blog-detail">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Unable to Load Blog</h2>
            <p>{status.error}</p>
            <Link to="/blogs" className="btn-primary">
              <FaArrowLeft /> Back to Blogs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!blog) return null;

  return (
    <main className="blog-detail">
      {/* Navigation */}
      <nav className="blog-nav">
        <div className="container">
          <Link to="/blogs" className="back-btn">
            <FaArrowLeft /> Back to Blogs
          </Link>
          <div className="nav-actions">
            <button
              type="button"
              className={`icon-btn ${saved ? 'active' : ''}`}
              title={saved ? 'Saved' : 'Bookmark'}
              disabled={saving}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!id) return;
                const token = localStorage.getItem('auth_token');
                if (!token) {
                  navigate('/login');
                  return;
                }
                try {
                  setSaving(true);
                  if (saved) {
                    await removeBlog(id);
                    setSaved(false);
                  } else {
                    await saveBlog({ id, _id: id, title: blog?.title, thumbnail: blog?.image, excerpt: blog?.shortDesc });
                    setSaved(true);
                  }
                } catch (err) {
                  console.warn('blog save toggle failed', err);
                } finally {
                  setSaving(false);
                }
              }}
              aria-label={saved ? 'Saved' : 'Save'}
            >
              <FaBookmark className="bookmark-icon" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="blog-hero">
        <div className="container">
          <div className="hero-content">
            <div className="category-badge">{blog.category}</div>
            <h1 className="blog-title">{blog.title}</h1>
            {blog.shortDesc && <p className="blog-excerpt">{blog.shortDesc}</p>}
            
            <div className="blog-meta">
              <div className="meta-item">
                <FaUser className="meta-icon" />
                <span>{blog.author || 'Unknown Author'}</span>
              </div>
              <div className="meta-item">
                <FaCalendarAlt className="meta-icon" />
                <span>{dateStr}</span>
              </div>
              <div className="meta-item">
                <FaClock className="meta-icon" />
                <span>{readingTime} min read</span>
              </div>
              <div className="meta-item">
                <FaEye className="meta-icon" />
                <span>{blog.views || '0'} views</span>
              </div>
            </div>
          </div>
        </div>
        
        {bannerSrc ? (
          <div className="hero-banner">
            <img src={bannerSrc} alt={blog.title} onError={(e) => { 
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'block';
            }} />
            <div className="banner-placeholder" style={{display: 'none'}}>
              <div className="placeholder-content">
                <FaBookmark className="placeholder-icon" />
                <span>Featured Image</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="hero-banner">
            <div className="banner-placeholder">
              <div className="placeholder-content">
                <FaBookmark className="placeholder-icon" />
                <span>Featured Image</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="container">
        <div className="blog-layout">
          {/* Main Content */}
          <article className="blog-content">
            <div className="content-body">
              {(String(blog.content || '')).split(/\n\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="blog-tags">
                <h4>Tags:</h4>
                <div className="tags-list">
                  {tags.map((t, i) => (
                    <span key={i} className="tag">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="share-section">
              <div className="share-header">
                <FaShareAlt className="share-icon" />
                <h4>Share this article</h4>
              </div>
              <div className="share-buttons">
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(blog.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="share-btn linkedin"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                  data-tooltip="LinkedIn"
                >
                  <FaLinkedin />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="share-btn twitter"
                  aria-label="Share on X (Twitter)"
                  title="Share on X (Twitter)"
                  data-tooltip="Twitter"
                >
                  <FaTwitter />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="share-btn facebook"
                  aria-label="Share on Facebook"
                  title="Share on Facebook"
                  data-tooltip="Facebook"
                >
                  <FaFacebook />
                </a>
                <button
                  onClick={copyToClipboard}
                  className={`share-btn copy${copied ? ' copied' : ''}`}
                  aria-label={copied ? 'Link copied' : 'Copy link'}
                  title={copied ? 'Link copied!' : 'Copy link'}
                  data-tooltip={copied ? 'Copied!' : 'Copy link'}
                >
                  {copied ? <FaCheck /> : <FaLink />}
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="blog-sidebar">
            {/* Author Info */}
            <div className="sidebar-card author-card">
              <h3>About the Author</h3>
              <div className="author-info">
                <div className="author-avatar">
                  {blog.author ? blog.author.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="author-details">
                  <h4>{blog.author || 'Anonymous'}</h4>
                  <p>Content Writer & Industry Expert</p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="sidebar-card toc-card">
              <h3>Contents</h3>
              <div className="toc-list">
                {(String(blog.content || '')).split(/\n\n+/)
                  .filter(para => para.length > 50)
                  .slice(0, 5)
                  .map((para, i) => (
                    <a key={i} href={`#section-${i}`} className="toc-item">
                      {para.substring(0, 60)}...
                    </a>
                  ))
                }
              </div>
            </div>

            {/* Popular Tags */}
            {tags.length > 0 && (
              <div className="sidebar-card tags-card">
                <h3>Popular Tags</h3>
                <div className="sidebar-tags">
                  {tags.slice(0, 8).map((tag, i) => (
                    <span key={i} className="sidebar-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="related-section">
            <div className="section-header">
              <h2>Related Articles</h2>
              <p>You might also like these posts</p>
            </div>
            <div className="related-grid">
              {related.map((r) => (
                <article key={r._id} className="related-card">
                  <Link to={`/blog/${r._id}`} className="related-link">
                    <div className="related-image">
                      <img 
                        src={resolveImageUrl(r.image || '')} 
                        alt={r.title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }} 
                      />
                      <div className="image-fallback">
                        <FaBookmark />
                      </div>
                    </div>
                    <div className="related-content">
                      <div className="related-meta">
                        <span className="related-category">{r.category}</span>
                        <span className="related-date">
                          {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <h3 className="related-title">{r.title}</h3>
                      {r.shortDesc && (
                        <p className="related-desc">{r.shortDesc}</p>
                      )}
                      <div className="related-footer">
                        <span className="read-more">Read More</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}