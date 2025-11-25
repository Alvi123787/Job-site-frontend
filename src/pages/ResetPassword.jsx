import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { resetPassword } from '../utils/auth';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ success: '', error: '', loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ success: '', error: 'Passwords do not match', loading: false });
      return;
    }
    if (password.length < 8 || !/[0-9]/.test(password) || !/[A-Za-z]/.test(password)) {
      setStatus({ success: '', error: 'Password must be at least 8 characters and include letters and numbers', loading: false });
      return;
    }
    setStatus({ success: '', error: '', loading: true });
    try {
      const resp = await resetPassword(token, { password });
      setStatus({ success: resp?.message || 'Password reset successful.', error: '', loading: false });
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setStatus({ success: '', error: err.message, loading: false });
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-4" style={{ maxWidth: 420, width: '100%' }}>
        <h2 className="text-center mb-3">Reset Password</h2>
        {status.success && <div className="alert alert-success" role="alert">{status.success}</div>}
        {status.error && <div className="alert alert-danger" role="alert">{status.error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="password" name="password" className="form-control" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="mb-3">
            <input type="password" name="confirmPassword" className="form-control" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={status.loading}>
            {status.loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        <p className="text-center mt-3">
          Back to <Link to="/login" className="text-decoration-none">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;