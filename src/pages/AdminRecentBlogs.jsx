import React from 'react';
import RecentBlogsTable from '../components/RecentBlogsTable';

export default function AdminRecentBlogs() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Recent Blogs</h1>
        <p>Manage latest blog posts — view, edit or delete.</p>
      </div>
      <div className="card" style={{ padding: '16px' }}>
        <RecentBlogsTable />
      </div>
    </div>
  );
}