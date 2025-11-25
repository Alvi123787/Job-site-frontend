import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { API_BASE } from '../utils/media';
import './RecentJobsTable.css';

function mapRow(job) {
  const id = job._id || job.id;
  const title = job.title || 'Untitled';
  const category = job.category || 'General';
  const applicants = Number(job.applicationsCount ?? job.applications ?? 0);
  const now = new Date();
  const endDate = job.endDate ? new Date(job.endDate) : null;
  const isExpired = (job.status === 'Expired') || (endDate && endDate < now);
  const status = isExpired ? 'Expired' : (job.status || 'Active');
  const created = job.createdAt ? new Date(job.createdAt) : (job.postingDate ? new Date(job.postingDate) : null);
  const dateText = created ? created.toISOString().slice(0, 10) : '';
  return { id, title, category, applicants, status, dateText };
}

export default function RecentJobsTable() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'expired'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const limit = 10;
        const resp = await fetch(`${API_BASE}/api/jobs?page=${page}&limit=${limit}`);
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json?.error || 'Failed to load jobs');
        const list = Array.isArray(json) ? json : (Array.isArray(json?.jobs) ? json.jobs : []);
        const mapped = list.map(mapRow);
        if (!mounted) return;
        setRows(mapped);
        if (!Array.isArray(json)) {
          setTotalPages(Math.max(1, Number(json?.totalPages || 1)));
        } else {
          setTotalPages(1);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Server error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page]);

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < totalPages, [page, totalPages]);

  const categoryOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.category).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery = q === '' || String(r.title).toLowerCase().includes(q);
      const statusVal = String(r.status).toLowerCase();
      const matchesStatus = statusFilter === 'all'
        ? true
        : statusFilter === 'active'
          ? statusVal === 'active'
          : statusVal === 'expired';
      const matchesCategory = categoryFilter === 'all' || String(r.category) === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [rows, searchQuery, statusFilter, categoryFilter]);

  const handleEdit = (id) => {
    navigate(`/admin/jobs/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this job? This cannot be undone.');
    if (!ok) return;
    setDeletingId(id);
    try {
      const resp = await fetch(`${API_BASE}/api/jobs/${id}`, { method: 'DELETE' });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'Failed to delete job');
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message || 'Server error while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-jobs-table">
      <h2 className="admin-jobs-table__title">Recent Job Posts</h2>
      <div className="admin-jobs-table__container">
        <div className="admin-jobs-table__controls">
          <input
            type="text"
            className="admin-jobs-table__search"
            placeholder="Search job title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="admin-jobs-table__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <select
            className="admin-jobs-table__select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <table className="admin-jobs-table__table">
          <thead className="admin-jobs-table__header">
            <tr>
              <th className="admin-jobs-table__th">Job Title</th>
              <th className="admin-jobs-table__th">Category</th>
              <th className="admin-jobs-table__th">Applicants</th>
              <th className="admin-jobs-table__th">Status</th>
              <th className="admin-jobs-table__th">Date Posted</th>
              <th className="admin-jobs-table__th">Actions</th>
            </tr>
          </thead>
          <tbody className="admin-jobs-table__body">
            {loading ? (
              <tr className="admin-jobs-table__row">
                <td className="admin-jobs-table__td admin-jobs-table__loading" colSpan="6">
                  Loading jobs…
                </td>
              </tr>
            ) : error ? (
              <tr className="admin-jobs-table__row">
                <td className="admin-jobs-table__td admin-jobs-table__error" colSpan="6">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="admin-jobs-table__row">
                <td className="admin-jobs-table__td admin-jobs-table__empty" colSpan="6">
                  No jobs found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const statusClass = String(row.status).toLowerCase() === 'expired' ? 'admin-jobs-table__status--expired' : 'admin-jobs-table__status--active';
                return (
                  <tr key={row.id} className="admin-jobs-table__row">
                    <td className="admin-jobs-table__td admin-jobs-table__title">{row.title}</td>
                    <td className="admin-jobs-table__td admin-jobs-table__category">{row.category}</td>
                    <td className="admin-jobs-table__td admin-jobs-table__applicants">{row.applicants || '—'}</td>
                    <td className="admin-jobs-table__td">
                      <span className={`admin-jobs-table__status ${statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="admin-jobs-table__td admin-jobs-table__date">{row.dateText}</td>
                    <td className="admin-jobs-table__td admin-jobs-table__actions">
                      <Link to={`/jobs/${row.id}`} className="admin-jobs-table__action admin-jobs-table__action--view" title="View">
                        <FaEye />
                      </Link>
                      <button 
                        className="admin-jobs-table__action admin-jobs-table__action--edit" 
                        title="Edit" 
                        onClick={() => handleEdit(row.id)} 
                        disabled={!!deletingId}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="admin-jobs-table__action admin-jobs-table__action--delete" 
                        title="Delete" 
                        onClick={() => handleDelete(row.id)} 
                        disabled={deletingId === row.id}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="admin-jobs-table__pagination">
          <button 
            className="admin-jobs-table__pagination-btn admin-jobs-table__pagination-btn--prev" 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            disabled={!canPrev}
            title="Previous"
          >
            ‹ Prev
          </button>
          <div className="admin-jobs-table__pagination-info">
            Page {page} of {totalPages}
          </div>
          <button 
            className="admin-jobs-table__pagination-btn admin-jobs-table__pagination-btn--next" 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
            disabled={!canNext}
            title="Next"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}