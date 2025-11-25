import React, { useMemo, useState } from 'react';
import { 
  FaUpload, 
  FaEye, 
  FaCalendarAlt, 
  FaUser, 
  FaTag, 
  FaFileAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import './BlogPostForm.css';
import { resolveImageUrl, API_BASE } from '../utils/media';

const blogPostInitialState = () => ({
  title: '',
  author: '',
  category: '',
  image: '',
  shortDesc: '',
  content: '',
  tags: '',
  publishedAt: new Date().toISOString().slice(0, 10),
});

// Predefined categories for better UX
const BLOG_CATEGORIES = [
  'Career Growth',
  'Interview Tips',
  'Remote Work',
  'Productivity',
  'Industry Insights',
  'Leadership',
  'Skills Development',
  'Tech Trends'
];

export default function BlogPostForm({ onPublished, onCancel }) {
  const [blogPostForm, setBlogPostForm] = useState(blogPostInitialState());
  const [blogPostStatus, setBlogPostStatus] = useState({ loading: false, success: '', error: '' });
  const [blogPostActiveTab, setBlogPostActiveTab] = useState('edit');
  const [blogPostCharCount, setBlogPostCharCount] = useState({ title: 0, shortDesc: 0, content: 0 });

  const blogPostTagsPreview = useMemo(() => (
    (blogPostForm.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  ), [blogPostForm.tags]);

  const updateBlogPostField = (field) => (e) => {
    const value = e.target.value;
    setBlogPostForm(prev => ({ ...prev, [field]: value }));
    
    // Update character counts
    if (['title', 'shortDesc', 'content'].includes(field)) {
      setBlogPostCharCount(prev => ({ ...prev, [field]: value.length }));
    }
  };

  const resetBlogPostForm = () => {
    setBlogPostForm(blogPostInitialState());
    setBlogPostStatus({ loading: false, success: '', error: '' });
    setBlogPostCharCount({ title: 0, shortDesc: 0, content: 0 });
  };

  const validateBlogPost = () => {
    if (!blogPostForm.title.trim()) return 'Title is required';
    if (blogPostForm.title.length < 10) return 'Title should be at least 10 characters';
    if (!blogPostForm.author.trim()) return 'Author name is required';
    if (!blogPostForm.category.trim()) return 'Category is required';
    if (!blogPostForm.content.trim()) return 'Full content is required';
    if (blogPostForm.content.length < 100) return 'Content should be at least 100 characters';
    if (!blogPostForm.shortDesc.trim()) return 'Short description is required';
    return '';
  };

  const handleBlogPostSubmit = async (e) => {
    e.preventDefault();
    const err = validateBlogPost();
    if (err) { 
      setBlogPostStatus({ loading: false, success: '', error: err }); 
      return; 
    }
    
    setBlogPostStatus({ loading: true, success: '', error: '' });
    try {
      const payload = {
        title: blogPostForm.title.trim(),
        author: blogPostForm.author.trim(),
        category: blogPostForm.category.trim(),
        image: blogPostForm.image.trim(),
        shortDesc: blogPostForm.shortDesc.trim(),
        content: blogPostForm.content,
        tags: blogPostTagsPreview,
        publishedAt: blogPostForm.publishedAt ? new Date(blogPostForm.publishedAt) : undefined,
      };
      
      const resp = await fetch(`${API_BASE}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed to publish blog');

      setBlogPostStatus({ loading: false, success: 'Blog published successfully!', error: '' });
      if (typeof onPublished === 'function') onPublished(data);
      
      // Auto-reset after success
      setTimeout(() => {
        resetBlogPostForm();
      }, 2000);
      
    } catch (error) {
      setBlogPostStatus({ loading: false, success: '', error: error?.message || 'Something went wrong. Please try again.' });
    }
  };

  const blogPostReadingTime = useMemo(() => {
    const words = blogPostForm.content.split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [blogPostForm.content]);

  return (
    <main className="blog-post-form-page">
      <div className="blog-post-form-container">
        {/* Header */}
        <div className="blog-post-form-header">
          <div className="blog-post-header-content">
            {onCancel && (
              <button className="blog-post-back-btn" onClick={onCancel}>
                <FaArrowLeft />
                Back to Blogs
              </button>
            )}
            <div className="blog-post-header-text">
              <h1 className="blog-post-page-title">Create New Blog Post</h1>
              <p className="blog-post-page-subtitle">Craft and publish engaging content for your audience</p>
            </div>
            <div className="blog-post-header-actions">
              <div className="blog-post-tab-switcher">
                <button 
                  className={`blog-post-tab-btn ${blogPostActiveTab === 'edit' ? 'blog-post-tab-active' : ''}`}
                  onClick={() => setBlogPostActiveTab('edit')}
                >
                  <FaFileAlt />
                  Edit
                </button>
                <button 
                  className={`blog-post-tab-btn ${blogPostActiveTab === 'preview' ? 'blog-post-tab-active' : ''}`}
                  onClick={() => setBlogPostActiveTab('preview')}
                >
                  <FaEye />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="blog-post-form-content">
          {/* Status Alerts */}
          {blogPostStatus.error && (
            <div className="blog-post-alert blog-post-alert-error" role="alert">
              <FaExclamationTriangle className="blog-post-alert-icon" />
              <div className="blog-post-alert-content">
                <strong>Error</strong>
                <p>{blogPostStatus.error}</p>
              </div>
            </div>
          )}
          
          {blogPostStatus.success && (
            <div className="blog-post-alert blog-post-alert-success" role="alert">
              <FaCheckCircle className="blog-post-alert-icon" />
              <div className="blog-post-alert-content">
                <strong>Success!</strong>
                <p>{blogPostStatus.success}</p>
              </div>
            </div>
          )}

          <div className="blog-post-content-grid">
            {/* Edit Form */}
            <div className={`blog-post-form-section ${blogPostActiveTab === 'edit' ? 'blog-post-section-active' : ''}`}>
              <form className="blog-post-form" onSubmit={handleBlogPostSubmit}>
                <div className="blog-post-form-grid">
                  {/* Basic Information */}
                  <div className="blog-post-form-card">
                    <div className="blog-post-card-header">
                      <FaFileAlt className="blog-post-card-icon" />
                      <h3>Basic Information</h3>
                    </div>
                    <div className="blog-post-card-content">
                      <div className="blog-post-form-row">
                        <div className="blog-post-form-group">
                          <label htmlFor="blogPostTitle" className="blog-post-form-label">
                            Blog Title *
                            <span className="blog-post-char-count">{blogPostCharCount.title}/80</span>
                          </label>
                          <input
                            id="blogPostTitle"
                            type="text"
                            value={blogPostForm.title}
                            onChange={updateBlogPostField('title')}
                            placeholder="Enter an engaging blog title..."
                            className="blog-post-form-input"
                            maxLength={80}
                            required
                          />
                        </div>
                      </div>

                      <div className="blog-post-form-row">
                        <div className="blog-post-form-group">
                          <label htmlFor="blogPostAuthor" className="blog-post-form-label">
                            <FaUser className="blog-post-label-icon" />
                            Author Name *
                          </label>
                          <input
                            id="blogPostAuthor"
                            type="text"
                            value={blogPostForm.author}
                            onChange={updateBlogPostField('author')}
                            placeholder="Enter author name..."
                            className="blog-post-form-input"
                            required
                          />
                        </div>

                        <div className="blog-post-form-group">
                          <label htmlFor="blogPostCategory" className="blog-post-form-label">
                            Category *
                          </label>
                          <select
                            id="blogPostCategory"
                            value={blogPostForm.category}
                            onChange={updateBlogPostField('category')}
                            className="blog-post-form-input"
                            required
                          >
                            <option value="">Select a category</option>
                            {BLOG_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="blog-post-form-row">
                        <div className="blog-post-form-group">
                          <label htmlFor="blogPostPublishedAt" className="blog-post-form-label">
                            <FaCalendarAlt className="blog-post-label-icon" />
                            Publish Date
                          </label>
                          <input
                            id="blogPostPublishedAt"
                            type="date"
                            value={blogPostForm.publishedAt}
                            onChange={updateBlogPostField('publishedAt')}
                            className="blog-post-form-input"
                          />
                        </div>

                        <div className="blog-post-form-group">
                          <label htmlFor="blogPostImage" className="blog-post-form-label">
                            <FaUpload className="blog-post-label-icon" />
                            Featured Image URL
                          </label>
                          <input
                            id="blogPostImage"
                            type="url"
                            value={blogPostForm.image}
                            onChange={updateBlogPostField('image')}
                            placeholder="https://example.com/image.jpg"
                            className="blog-post-form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="blog-post-form-card">
                    <div className="blog-post-card-header">
                      <FaFileAlt className="blog-post-card-icon" />
                      <h3>Content</h3>
                    </div>
                    <div className="blog-post-card-content">
                      <div className="blog-post-form-group">
                        <label htmlFor="blogPostShortDesc" className="blog-post-form-label">
                          Short Description *
                          <span className="blog-post-char-count">{blogPostCharCount.shortDesc}/160</span>
                        </label>
                        <textarea
                          id="blogPostShortDesc"
                          rows={3}
                          value={blogPostForm.shortDesc}
                          onChange={updateBlogPostField('shortDesc')}
                          placeholder="Write a compelling short description that will appear in blog listings..."
                          className="blog-post-form-textarea"
                          maxLength={160}
                          required
                        />
                      </div>

                      <div className="blog-post-form-group">
                        <label htmlFor="blogPostContent" className="blog-post-form-label">
                          Full Content *
                          <span className="blog-post-char-count">{blogPostCharCount.content} characters • {blogPostReadingTime} min read</span>
                        </label>
                        <textarea
                          id="blogPostContent"
                          rows={12}
                          value={blogPostForm.content}
                          onChange={updateBlogPostField('content')}
                          placeholder="Write your blog content here. You can use multiple paragraphs separated by blank lines..."
                          className="blog-post-form-textarea blog-post-content-textarea"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="blog-post-form-card">
                    <div className="blog-post-card-header">
                      <FaTag className="blog-post-card-icon" />
                      <h3>Tags & Metadata</h3>
                    </div>
                    <div className="blog-post-card-content">
                      <div className="blog-post-form-group">
                        <label htmlFor="blogPostTags" className="blog-post-form-label">
                          Tags
                        </label>
                        <input
                          id="blogPostTags"
                          type="text"
                          value={blogPostForm.tags}
                          onChange={updateBlogPostField('tags')}
                          placeholder="Enter comma-separated tags (e.g., React, JavaScript, Career)"
                          className="blog-post-form-input"
                        />
                        <div className="blog-post-helper-text">
                          {blogPostTagsPreview.length > 0 ? (
                            <div className="blog-post-tags-preview">
                              <span className="blog-post-preview-label">Tags preview:</span>
                              <div className="blog-post-preview-tags">
                                {blogPostTagsPreview.map((tag, index) => (
                                  <span key={index} className="blog-post-preview-tag">{tag}</span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            'Add relevant tags to help readers discover your content'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="blog-post-form-actions">
                  <button
                    type="button"
                    className="blog-post-btn blog-post-btn-secondary"
                    onClick={resetBlogPostForm}
                    disabled={blogPostStatus.loading}
                  >
                    Reset Form
                  </button>
                  <div className="blog-post-action-group">
                    <button
                      type="button"
                      className="blog-post-btn blog-post-btn-outline"
                      onClick={() => setBlogPostActiveTab('preview')}
                      disabled={blogPostStatus.loading}
                    >
                      <FaEye />
                      Preview
                    </button>
                    <button
                      type="submit"
                      className="blog-post-btn blog-post-btn-primary"
                      disabled={blogPostStatus.loading}
                    >
                      {blogPostStatus.loading ? (
                        <>
                          <div className="blog-post-spinner"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          Publish Blog
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            <div className={`blog-post-preview-section ${blogPostActiveTab === 'preview' ? 'blog-post-section-active' : ''}`}>
              <div className="blog-post-preview-card">
                <div className="blog-post-preview-header">
                  <h3>Blog Preview</h3>
                  <p>This is how your blog will appear to readers</p>
                </div>
                
                <div className="blog-post-preview-content">
                  {/* Hero Image */}
                  <div className="blog-post-preview-hero">
                    {blogPostForm.image ? (
                      <img 
                        src={resolveImageUrl(blogPostForm.image)} 
                        alt="Blog preview" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div 
                      className="blog-post-preview-placeholder" 
                      style={{ display: blogPostForm.image ? 'none' : 'flex' }}
                    >
                      <FaUpload className="blog-post-placeholder-icon" />
                      <span>Featured Image</span>
                    </div>
                    
                    {/* Category Badge */}
                    {blogPostForm.category && (
                      <div className="blog-post-preview-badge">
                        {blogPostForm.category}
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="blog-post-preview-body">
                    <div className="blog-post-preview-meta">
                      <div className="blog-post-meta-item">
                        <FaCalendarAlt />
                        {new Date(blogPostForm.publishedAt || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="blog-post-meta-item">
                        <FaUser />
                        {blogPostForm.author || 'Author Name'}
                      </div>
                      <div className="blog-post-meta-item">
                        {blogPostReadingTime} min read
                      </div>
                    </div>

                    <h1 className="blog-post-preview-title">
                      {blogPostForm.title || 'Your Blog Title Will Appear Here'}
                    </h1>

                    <p className="blog-post-preview-excerpt">
                      {blogPostForm.shortDesc || 'Your short description will appear here. Make it engaging to attract readers.'}
                    </p>

                    <div className="blog-post-preview-content-text">
                      {(blogPostForm.content || 'Your blog content will appear here. Start writing to see the preview.')
                        .split('\n\n')
                        .map((paragraph, index) => (
                          <p key={index}>{paragraph || 'Start writing your content above...'}</p>
                        ))
                      }
                    </div>

                    {/* Tags */}
                    {blogPostTagsPreview.length > 0 && (
                      <div className="blog-post-preview-tags-section">
                        <div className="blog-post-tags-title">Tags:</div>
                        <div className="blog-post-preview-tags">
                          {blogPostTagsPreview.map((tag, index) => (
                            <span key={index} className="blog-post-preview-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}