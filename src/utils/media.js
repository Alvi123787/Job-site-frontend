export const API_BASE ='https://job-site-backend-seven.vercel.app/';

export function resolveImageUrl(url) {
  const u = String(url || '').trim();
  if (!u) return '';
  // Proxy external images to avoid ORB/CORS issues in preview/browser
  if (/^https?:\/\//i.test(u)) {
    // Avoid known placeholder/broken hosts
    try {
      const { hostname } = new URL(u);
      const host = String(hostname || '').toLowerCase();
      if (host === 'example.com' || host.endsWith('.example.com')) {
        return '/company-placeholder.svg';
      }
      // Allow safe direct hosts to reduce proxying and avoid occasional aborts
      if (host === 'images.unsplash.com') {
        return u;
      }
    } catch (_) {
      // fall through to proxy
    }
    return `${API_BASE}/api/assets/image-proxy?url=${encodeURIComponent(u)}`;
  }
  // Prefix backend-hosted uploads to API base so they load from the server
  if (u.startsWith('/uploads') || u.startsWith('uploads/')) {
    return `${API_BASE}${u.startsWith('/') ? u : `/${u}`}`;
  }
  // Allow local /public assets or other relative paths
  return u;
}