import React from 'react';
import './BlogCategory.css';

const BlogCategory = ({ categories = [], active = 'All', onChange = () => {} }) => {
  return (
    <div className="blog-category-wrap">
      <div className="blog-category-scroll" role="tablist" aria-label="Blog categories">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => onChange(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BlogCategory;