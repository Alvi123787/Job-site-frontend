function getToken() {
  try { return localStorage.getItem('auth_token') || null; } catch (_) { return null; }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProfile() {
  const res = await fetch('https://job-site-backend-seven.vercel.app/api/user/me', { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to load profile');
  return data;
}

export async function updateProfile(payload) {
  const res = await fetch('https://job-site-backend-seven.vercel.app/api/user/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to update profile');
  return data; // { message, user }
}

export async function changePassword(payload) {
  const res = await fetch('https://job-site-backend-seven.vercel.app/api/user/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to change password');
  return data;
}

export async function deleteAccount() {
  const res = await fetch('https://job-site-backend-seven.vercel.app/api/user/me', { method: 'DELETE', headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to delete account');
  return data;
}

export async function fetchMyBlogs({ page = 1, limit = 10 } = {}) {
  const url = new URL('https://job-site-backend-seven.vercel.app/api/user/my-blogs');
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  const res = await fetch(url, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to load blogs');
  return data; // { total, page, limit, items }
}

export async function fetchMyJobs({ page = 1, limit = 10, status } = {}) {
  const url = new URL('https://job-site-backend-seven.vercel.app/api/user/my-jobs');
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  if (status) url.searchParams.set('status', status);
  const res = await fetch(url, { headers: { ...authHeaders() } });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to load jobs');
  return data; // { total, page, limit, items }
}

export function uploadAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result });
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}