import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
import { forgotPassword } from '../utils/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ success: '', error: '', loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: '', error: '', loading: true });
    try {
      const resp = await forgotPassword({ email });
      setStatus({ success: resp?.message || 'Password reset link has been sent to your email.', error: '', loading: false });
    } catch (err) {
      setStatus({ success: '', error: err.message, loading: false });
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-4" style={{ maxWidth: 420, width: '100%' }}>
        <h2 className="text-center mb-3">Forgot Password</h2>
        {status.success && <div className="alert alert-success" role="alert">{status.success}</div>}
        {status.error && <div className="alert alert-danger" role="alert">{status.error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="email" name="email" className="form-control" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={status.loading}>
            {status.loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center mt-3">
          Remembered your password? <Link to="/login" className="text-decoration-none">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;