import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import JobPostForm from '../components/JobPostForm';

export default function JobEditPage() {
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      try { localStorage.setItem('edit_job_id', String(id)); } catch (_) {}
    }
  }, [id]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Edit Job</h1>
        <p>Update the job details and republish if needed.</p>
      </div>
      <JobPostForm editId={id} />
    </div>
  );
}