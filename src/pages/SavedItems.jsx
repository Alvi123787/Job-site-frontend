import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSavedItems, removeJob, removeBlog } from '../utils/saved';
import './SavedItems.css';

const SavedItems = () => {
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'jobs', 'blogs'

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchSavedItems();
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
      } catch (_) { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleRemoveJob = async (id) => {
    try {
      setRemoving((r) => ({ ...r, [`job-${id}`]: true }));
      await new Promise((res) => setTimeout(res, 200));
      await removeJob(id);
      setJobs((list) => list.filter((j) => String(j._id||j.id) !== String(id)));
    } finally {
      setRemoving((r) => ({ ...r, [`job-${id}`]: false }));
    }
  };

  const handleRemoveBlog = async (id) => {
    try {
      setRemoving((r) => ({ ...r, [`blog-${id}`]: true }));
      await new Promise((res) => setTimeout(res, 200));
      await removeBlog(id);
      setBlogs((list) => list.filter((b) => String(b._id||b.id) !== String(id)));
    } finally {
      setRemoving((r) => ({ ...r, [`blog-${id}`]: false }));
    }
  };

  const filteredJobs = activeTab === 'all' || activeTab === 'jobs' ? jobs : [];
  const filteredBlogs = activeTab === 'all' || activeTab === 'blogs' ? blogs : [];
  const empty = !jobs.length && !blogs.length && !loading;
  const showEmptyState = empty || (activeTab === 'jobs' && !jobs.length) || (activeTab === 'blogs' && !blogs.length);

  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </div>
      <h3>No saved items yet</h3>
      <p>Start exploring jobs and blogs to save them for later</p>
      <div className="empty-actions">
        <Link to="/jobs" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          Browse Jobs
        </Link>
        <Link to="/blog" className="btn-outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
          </svg>
          Read Blogs
        </Link>
      </div>
    </div>
  );

  const JobCard = ({ job }) => {
    const id = job._id || job.id;
    const location = job.location || [job.city, job.state, job.country].filter(Boolean).join(', ');
    const salary = job.salary || job.salaryMax || job.salaryMin;
    const isRemote = job.remote || job.workType === 'remote';
    
    return (
      <div className={`saved-item-card ${removing[`job-${id}`] ? 'fade-out' : ''}`}>
        <div className="item-header">
          <div className="item-type-badge job">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
            Job
          </div>
          <button 
            className="remove-btn"
            onClick={() => handleRemoveJob(id)}
            disabled={removing[`job-${id}`]}
          >
            {removing[`job-${id}`] ? (
              <div className="spinner-small"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            )}
          </button>
        </div>
        
        <div className="item-content">
          <h3 className="item-title">{job.title}</h3>
          <p className="item-company">{job.company}</p>
          
          <div className="item-meta">
            {location && (
              <div className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {isRemote ? 'Remote' : location}
              </div>
            )}
            
            {salary && (
              <div className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.78-1.18 2.73-3.12 3.16z"/>
                </svg>
                {salary}
              </div>
            )}
          </div>
          
          {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="skills-tags">
              {job.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
              {job.skills.length > 3 && (
                <span className="skill-tag more">+{job.skills.length - 3} more</span>
              )}
            </div>
          )}
        </div>
        
        <div className="item-actions">
          <Link to={`/jobs/${id}`} className="btn-primary">
            View Details
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </Link>
        </div>
      </div>
    );
  };

  const BlogCard = ({ blog }) => {
    const id = blog._id || blog.id;
    const excerpt = blog.excerpt || blog.shortDesc || blog.description;
    const readTime = blog.readTime || '5 min read';
    
    return (
      <div className={`saved-item-card ${removing[`blog-${id}`] ? 'fade-out' : ''}`}>
        <div className="item-header">
          <div className="item-type-badge blog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
            </svg>
            Article
          </div>
          <button 
            className="remove-btn"
            onClick={() => handleRemoveBlog(id)}
            disabled={removing[`blog-${id}`]}
          >
            {removing[`blog-${id}`] ? (
              <div className="spinner-small"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            )}
          </button>
        </div>
        
        <div className="item-content">
          {(blog.thumbnail || blog.image) && (
            <div className="blog-image">
              <img 
                src={blog.thumbnail || blog.image} 
                alt={blog.title}
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }} 
              />
              <div className="image-fallback">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
            </div>
          )}
          
          <h3 className="item-title">{blog.title}</h3>
          
          {excerpt && (
            <p className="item-excerpt">{excerpt}</p>
          )}
          
          <div className="item-meta">
            <div className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              {readTime}
            </div>
            
            {blog.category && (
              <div className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
                </svg>
                {blog.category}
              </div>
            )}
          </div>
        </div>
        
        <div className="item-actions">
          <Link to={`/blog/${id}`} className="btn-primary">
            Read Article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="saved-items-container">
      <div className="saved-header">
        <div className="header-inner">
          <div className="header-content">
            <h1>Saved Items</h1>
            <p>Your bookmarked jobs and articles for easy access</p>
          </div>
          
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-number">{jobs.length}</span>
              <span className="stat-label">Saved Jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{blogs.length}</span>
              <span className="stat-label">Saved Articles</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your saved items...</p>
        </div>
      ) : (
        <>
          <div className="saved-filters">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Items ({jobs.length + blogs.length})
              </button>
              <button 
                className={`filter-tab ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                Jobs ({jobs.length})
              </button>
              <button 
                className={`filter-tab ${activeTab === 'blogs' ? 'active' : ''}`}
                onClick={() => setActiveTab('blogs')}
              >
                Articles ({blogs.length})
              </button>
            </div>
          </div>

          {showEmptyState ? (
            <EmptyState />
          ) : (
            <div className="saved-content">
              {(activeTab === 'all' || activeTab === 'jobs') && filteredJobs.length > 0 && (
                <section className="saved-section">
                  <h2 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                    </svg>
                    Saved Jobs ({filteredJobs.length})
                  </h2>
                  <div className="items-grid">
                    {filteredJobs.map(job => (
                      <JobCard key={job._id || job.id} job={job} />
                    ))}
                  </div>
                </section>
              )}

              {(activeTab === 'all' || activeTab === 'blogs') && filteredBlogs.length > 0 && (
                <section className="saved-section">
                  <h2 className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                    </svg>
                    Saved Articles ({filteredBlogs.length})
                  </h2>
                  <div className="items-grid">
                    {filteredBlogs.map(blog => (
                      <BlogCard key={blog._id || blog.id} blog={blog} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedItems;