import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { API_BASE } from '../utils/media';
import './RecentBlogsTable.css';

function mapRow(blog) {
  const id = blog._id || blog.id;
  const title = blog.title || 'Untitled';
  const category = blog.category || 'General';
  const author = blog.author || '—';
  const published = !!blog.publishedAt;
  const status = published ? 'Published' : (blog.status || 'Draft');
  const created = blog.publishedAt ? new Date(blog.publishedAt) : (blog.createdAt ? new Date(blog.createdAt) : null);
  const dateText = created ? created.toISOString().slice(0, 10) : '';
  return { id, title, category, author, status, dateText };
}

export default function RecentBlogsTable() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const limit = 10;
        const resp = await fetch(`${API_BASE}/api/blogs?page=${page}&limit=${limit}`);
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json?.error || 'Failed to load blogs');
        const list = Array.isArray(json) ? json : (Array.isArray(json?.blogs) ? json.blogs : []);
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
        : statusFilter === 'published'
          ? statusVal.includes('publish')
          : statusVal.includes('draft');
      const matchesCategory = categoryFilter === 'all' || String(r.category) === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [rows, searchQuery, statusFilter, categoryFilter]);

  const handleEdit = (id) => {
    navigate(`/admin/blogs/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this blog? This cannot be undone.');
    if (!ok) return;
    setDeletingId(id);
    try {
      const resp = await fetch(`${API_BASE}/api/blogs/${id}`, { method: 'DELETE' });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'Failed to delete blog');
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message || 'Server error while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-blogs-table">
      <h2 className="admin-blogs-table__title">Recent Blog Posts</h2>
      <div className="admin-blogs-table__container">
        <div className="admin-blogs-table__controls">
          <input
            type="text"
            className="admin-blogs-table__search"
            placeholder="Search title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="admin-blogs-table__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            className="admin-blogs-table__select"
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
        <table className="admin-blogs-table__table">
          <thead className="admin-blogs-table__header">
            <tr>
              <th className="admin-blogs-table__th">Title</th>
              <th className="admin-blogs-table__th">Category</th>
              <th className="admin-blogs-table__th">Author</th>
              <th className="admin-blogs-table__th">Status</th>
              <th className="admin-blogs-table__th">Date</th>
              <th className="admin-blogs-table__th">Actions</th>
            </tr>
          </thead>
          <tbody className="admin-blogs-table__body">
            {loading ? (
              <tr className="admin-blogs-table__row">
                <td className="admin-blogs-table__td admin-blogs-table__loading" colSpan="6">
                  Loading blogs…
                </td>
              </tr>
            ) : error ? (
              <tr className="admin-blogs-table__row">
                <td className="admin-blogs-table__td admin-blogs-table__error" colSpan="6">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="admin-blogs-table__row">
                <td className="admin-blogs-table__td admin-blogs-table__empty" colSpan="6">
                  No blogs found.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const statusClass = String(row.status).toLowerCase().includes('publish') 
                  ? 'admin-blogs-table__status--published' 
                  : 'admin-blogs-table__status--draft';
                return (
                  <tr key={row.id} className="admin-blogs-table__row">
                    <td className="admin-blogs-table__td admin-blogs-table__title">{row.title}</td>
                    <td className="admin-blogs-table__td admin-blogs-table__category">{row.category}</td>
                    <td className="admin-blogs-table__td admin-blogs-table__author">{row.author}</td>
                    <td className="admin-blogs-table__td">
                      <span className={`admin-blogs-table__status ${statusClass}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="admin-blogs-table__td admin-blogs-table__date">{row.dateText}</td>
                    <td className="admin-blogs-table__td admin-blogs-table__actions">
                      <Link to={`/blog/${row.id}`} className="admin-blogs-table__action admin-blogs-table__action--view" title="View">
                        <FaEye />
                      </Link>
                      <button 
                        className="admin-blogs-table__action admin-blogs-table__action--edit" 
                        title="Edit" 
                        onClick={() => handleEdit(row.id)} 
                        disabled={!!deletingId}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="admin-blogs-table__action admin-blogs-table__action--delete" 
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
        <div className="admin-blogs-table__pagination">
          <button 
            className="admin-blogs-table__pagination-btn admin-blogs-table__pagination-btn--prev" 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            disabled={!canPrev}
            title="Previous"
          >
            ‹ Prev
          </button>
          <div className="admin-blogs-table__pagination-info">
            Page {page} of {totalPages}
          </div>
          <button 
            className="admin-blogs-table__pagination-btn admin-blogs-table__pagination-btn--next" 
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