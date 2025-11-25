import React, { useEffect, useState } from 'react';
import { API_BASE } from '../utils/media';

const BlogSidebar = ({ activeCategory = 'All', onCategorySelect = () => {} }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError('');
        const resp = await fetch(`${API_BASE}/api/blogs/categories`);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Failed to fetch categories');
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
      } catch (err) {
        setError(err?.message || 'Server error');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const items = ['All', ...categories];

  return (
    <div className="sidebar-card" aria-busy={loading} aria-live="polite">
      <h3 className="sidebar-title">Categories</h3>
      {error ? (
        <p className="sidebar-note">{error}</p>
      ) : (
        <ul className="sidebar-list">
          {items.map((cat) => {
            const isActive = String(activeCategory) === String(cat);
            return (
              <li key={cat}>
                <button
                  type="button"
                  className={`blog-sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => onCategorySelect(cat)}
                  aria-current={isActive ? 'true' : 'false'}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BlogSidebar;