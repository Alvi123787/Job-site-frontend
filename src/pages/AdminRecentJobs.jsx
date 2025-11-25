import React from 'react';
import RecentJobsTable from '../components/RecentJobsTable';

export default function AdminRecentJobs() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Recent Jobs</h1>
        <p>Review latest job posts — view, edit or delete.</p>
      </div>
      <div className="card" style={{ padding: '16px' }}>
        <RecentJobsTable />
      </div>
    </div>
  );
}