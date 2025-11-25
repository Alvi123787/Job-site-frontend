import { API_BASE } from './media';

const LS_JOBS = 'saved_jobs';
const LS_BLOGS = 'saved_blogs';

function getToken() {
  try { return localStorage.getItem('auth_token') || null; } catch (_) { return null; }
}

function readLocal(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; } catch (_) { return []; }
}

function writeLocal(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr)); } catch (_) {}
}

export async function saveJob(job) {
  const token = getToken();
  const id = job?._id || job?.id;
  if (!id) throw new Error('Job id missing');
  if (token) {
    const res = await fetch(`${API_BASE}/api/user/save-job/${id}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to save job');
    return true;
  } else {
    const list = readLocal(LS_JOBS);
    const exists = list.some((j) => String((j._id||j.id)) === String(id));
    if (!exists) { list.push(job); writeLocal(LS_JOBS, list); }
    return true;
  }
}

export async function removeJob(jobId) {
  const token = getToken();
  const id = jobId;
  if (!id) return false;
  if (token) {
    const res = await fetch(`${API_BASE}/api/user/remove-saved-job/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to remove job');
    return true;
  } else {
    const list = readLocal(LS_JOBS).filter((j) => String((j._id||j.id)) !== String(id));
    writeLocal(LS_JOBS, list);
    return true;
  }
}

export function isJobSaved(jobId) {
  const list = readLocal(LS_JOBS);
  return list.some((j) => String((j._id||j.id)) === String(jobId));
}

export async function saveBlog(blog) {
  const token = getToken();
  const id = blog?._id || blog?.id;
  if (!id) throw new Error('Blog id missing');
  if (token) {
    const res = await fetch(`${API_BASE}/api/user/save-blog/${id}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to save blog');
    return true;
  } else {
    const list = readLocal(LS_BLOGS);
    const exists = list.some((b) => String((b._id||b.id)) === String(id));
    if (!exists) { list.push(blog); writeLocal(LS_BLOGS, list); }
    return true;
  }
}

export async function removeBlog(blogId) {
  const token = getToken();
  const id = blogId;
  if (!id) return false;
  if (token) {
    const res = await fetch(`${API_BASE}/api/user/remove-saved-blog/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to remove blog');
    return true;
  } else {
    const list = readLocal(LS_BLOGS).filter((b) => String((b._id||b.id)) !== String(id));
    writeLocal(LS_BLOGS, list);
    return true;
  }
}

export function isBlogSaved(blogId) {
  const list = readLocal(LS_BLOGS);
  return list.some((b) => String((b._id||b.id)) === String(blogId));
}

export async function fetchSavedItems() {
  const token = getToken();
  if (token) {
    const res = await fetch(`${API_BASE}/api/user/saved-items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load saved items');
    return { jobs: Array.isArray(data.jobs) ? data.jobs : [], blogs: Array.isArray(data.blogs) ? data.blogs : [] };
  } else {
    return { jobs: readLocal(LS_JOBS), blogs: readLocal(LS_BLOGS) };
  }
}