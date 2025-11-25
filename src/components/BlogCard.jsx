import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaClock, 
  FaArrowRight,
  FaBookmark,
  FaShareAlt,
  FaEye
} from 'react-icons/fa';
import './BlogCard.css';
import BlogShare from './BlogShare';
import { saveBlog, removeBlog, isBlogSaved, fetchSavedItems } from '../utils/saved';

const BlogCard = ({ 
  thumbnail, 
  title, 
  excerpt, 
  author, 
  date, 
  to,
  category,
  readingTime,
  views,
  featured = false
}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const id = (to && typeof to === 'string' && to.startsWith('/blog/')) ? to.replace('/blog/','') : undefined;
  const navigate = useNavigate();
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
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleImageError = (e) => {
    e.currentTarget.style.display = 'none';
    const placeholder = e.currentTarget.parentNode.querySelector('.blog-thumb-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  return (
    <article className={`blog-card ${featured ? 'featured' : ''}`}>
      {/* Card Header with Image */}
      <div className="blog-card-header">
        <div className="blog-thumb">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              onError={handleImageError}
            />
          ) : null}
          <div className="blog-thumb-placeholder" style={{ display: thumbnail ? 'none' : 'flex' }}>
            <FaBookmark className="placeholder-icon" />
          </div>
          
          {/* Category Badge */}
          {category && (
            <div className="category-badge">
              {category}
            </div>
          )}
          
          {/* Featured Badge */}
          {featured && (
            <div className="featured-badge">
              Featured
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="card-actions">
            <button type="button" className={`action-btn ${saved ? 'active' : ''}`} title={saved ? 'Saved' : 'Bookmark'} disabled={saving} onClick={async (e) => {
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
                  await saveBlog({ id, _id: id, title, thumbnail, excerpt });
                  setSaved(true);
                }
              } catch (err) {
                console.warn('blog save toggle failed', err);
              } finally {
                setSaving(false);
              }
            }}>
              <FaBookmark className="bookmark-icon" />
            </button>
            <BlogShare blogUrl={to} size={16} />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="blog-card-content">
        <div className="content-header">
          <h3 className="blog-card-title">
            <Link to={to || '#'} className="title-link">
              {title}
            </Link>
          </h3>
          
          {excerpt && (
            <p className="blog-excerpt">
              {excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt}
            </p>
          )}
        </div>

        {/* Meta Information */}
        <div className="blog-meta-grid">
          <div className="meta-item">
            <FaUser className="meta-icon" />
            <span className="meta-text">{author || 'Unknown Author'}</span>
          </div>
          
          <div className="meta-item">
            <FaCalendarAlt className="meta-icon" />
            <span className="meta-text">{formatDate(date)}</span>
          </div>
          
          {readingTime && (
            <div className="meta-item">
              <FaClock className="meta-icon" />
              <span className="meta-text">{readingTime} min read</span>
            </div>
          )}
          
          {views && (
            <div className="meta-item">
              <FaEye className="meta-icon" />
              <span className="meta-text">{views} views</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="blog-card-footer">
          <Link 
            to={to || '#'} 
            className="blog-readmore"
            aria-label={`Read more: ${title}`}
          >
            Read More
            <FaArrowRight className="readmore-icon" />
          </Link>
          
          <div className="engagement-stats">
            {views && (
              <span className="stat-item">
                <FaEye className="stat-icon" />
                {views}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;