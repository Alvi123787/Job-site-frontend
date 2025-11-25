import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/media';

export default function BlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', author: '', category: '', image: '', shortDesc: '', content: '', tags: '', publishedAt: '' });
  const [status, setStatus] = useState({ loading: true, error: '', saving: false });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/blogs/${id}`);
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json?.error || 'Failed to load blog');
        const data = json || {};
        const tags = Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '');
        const publishedAt = data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0,10) : '';
        if (!mounted) return;
        setForm({ title: data.title || '', author: data.author || '', category: data.category || '', image: data.image || '', shortDesc: data.shortDesc || '', content: data.content || '', tags, publishedAt });
        setStatus({ loading: false, error: '', saving: false });
      } catch (e) {
        if (mounted) setStatus({ loading: false, error: e.message || 'Server error', saving: false });
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    setStatus((s) => ({ ...s, saving: true, error: '' }));
    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim(),
        image: form.image.trim(),
        shortDesc: form.shortDesc.trim(),
        content: form.content,
        tags: String(form.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
        publishedAt: form.publishedAt ? new Date(form.publishedAt) : undefined,
      };
      const resp = await fetch(`${API_BASE}/api/blogs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'Failed to update blog');
      navigate('/admin/recent-blogs');
    } catch (e) {
      setStatus((s) => ({ ...s, error: e.message || 'Server error' }));
    } finally {
      setStatus((s) => ({ ...s, saving: false }));
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Edit Blog</h1>
        <p>Update blog content and details.</p>
      </div>
      {status.loading ? (
        <div className="card" style={{ padding: 16 }}>Loading…</div>
      ) : status.error ? (
        <div className="card" style={{ padding: 16, color: '#b91c1c' }}>{status.error}</div>
      ) : (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Title<input type="text" value={form.title} onChange={update('title')} /></label>
            <label>Author<input type="text" value={form.author} onChange={update('author')} /></label>
            <label>Category<input type="text" value={form.category} onChange={update('category')} /></label>
            <label>Publish Date<input type="date" value={form.publishedAt} onChange={update('publishedAt')} /></label>
            <label>Image URL<input type="url" value={form.image} onChange={update('image')} /></label>
            <label>Tags<input type="text" value={form.tags} onChange={update('tags')} placeholder="comma, separated" /></label>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Short Description<textarea rows={3} value={form.shortDesc} onChange={update('shortDesc')} style={{ width: '100%' }} /></label>
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Content<textarea rows={10} value={form.content} onChange={update('content')} style={{ width: '100%' }} /></label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-action" onClick={() => navigate('/admin/recent-blogs')}>Cancel</button>
            <button className="btn-action" onClick={save} disabled={status.saving}>{status.saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      )}
    </div>
  );
}