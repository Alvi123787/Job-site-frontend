export async function signup(payload) {
  const res = await fetch('https://job-site-backend-seven.vercel.app/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Signup failed');
  return data;
}

export async function login(payload) {
  const res = await fetch('https://job-site-backend-seven.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Login failed');
  return data; // { token, user }
}

export async function forgotPassword(payload) {
  const res = await fetch('https://job-site-backend-seven.vercel.app/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to send reset link');
  return data;
}

export async function resetPassword(token, payload) {
  const res = await fetch(`https://job-site-backend-seven.vercel.app/api/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to reset password');
  return data;
}