import React from 'react';
import JobPostForm from './JobPostForm';

const JobManagement = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Job Management</h1>
        <p>Create and publish job listings globally.</p>
      </div>
      <JobPostForm />
    </div>
  );
};

export default JobManagement;