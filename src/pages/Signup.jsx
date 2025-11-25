import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { signup } from '../utils/auth';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Job Seeker',
        location: '',
        profession: '',
        bio: '',
        phone: '',
        avatarUrl: '',
        acceptTerms: false,
    });
    const [status, setStatus] = useState({ success: '', error: '', loading: false });

    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
          setStatus({ success: '', error: 'Passwords do not match', loading: false });
          return;
        }
        if (formData.password.length < 8 || !/[0-9]/.test(formData.password) || !/[A-Za-z]/.test(formData.password)) {
          setStatus({ success: '', error: 'Password must be at least 8 characters and include letters and numbers', loading: false });
          return;
        }
        if (!formData.acceptTerms) {
          setStatus({ success: '', error: 'You must accept the Terms and Privacy Policy', loading: false });
          return;
        }
        if (!formData.profession || !formData.bio || (!formData.location && !formData.country)) {
          setStatus({ success: '', error: 'Profession, Bio, and Location/Country are required', loading: false });
          return;
        }
        setStatus({ success: '', error: '', loading: true });
        try {
          const payload = {
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            location: formData.location,
            profession: formData.profession,
            bio: formData.bio,
            phone: formData.phone,
            avatarUrl: formData.avatarUrl,
            acceptTerms: formData.acceptTerms,
          };
          const resp = await signup(payload);
          // Auto-login after signup
          if (resp?.token && resp?.user) {
            localStorage.setItem('auth_token', resp.token);
            localStorage.setItem('auth_user', JSON.stringify(resp.user));
            window.dispatchEvent(new Event('auth-changed'));
            const role = resp.user?.role || 'Job Seeker';
            const dest = role === 'Employer' ? '/' : '/';
            navigate(dest);
            setStatus({ success: 'Account created successfully', error: '', loading: false });
          } else {
            setStatus({ success: resp?.message || 'Account created. Please log in.', error: '', loading: false });
            setTimeout(() => navigate('/login'), 800);
          }
        } catch (err) {
          setStatus({ success: '', error: err.message, loading: false });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow p-4" style={{ maxWidth: 480, width: '100%' }}>
                <h2 className="text-center mb-3">Create Account</h2>
                {status.success && (
                  <div className="alert alert-success" role="alert">{status.success}</div>
                )}
                {status.error && (
                  <div className="alert alert-danger" role="alert">{status.error}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            name="fullName"
                            className="form-control"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                      <select name="role" className="form-select" value={formData.role} onChange={handleChange} required>
                        <option>Job Seeker</option>
                        <option>Employer</option>
                      </select>
                    </div>
                    <div className="mb-3">
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        placeholder="Country / Location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        name="profession"
                        className="form-control"
                        placeholder="Profession or Title"
                        value={formData.profession}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <textarea
                        name="bio"
                        className="form-control"
                        placeholder="Short Bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="url"
                        name="avatarUrl"
                        className="form-control"
                        placeholder="Profile Picture URL (optional)"
                        value={formData.avatarUrl}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-check mb-3">
                      <input className="form-check-input" type="checkbox" id="terms" name="acceptTerms" checked={formData.acceptTerms} onChange={(e)=>setFormData({ ...formData, acceptTerms: e.target.checked })} />
                      <label className="form-check-label" htmlFor="terms">I accept the Terms and Privacy Policy</label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={status.loading}>
                      {status.loading ? 'Creating…' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center mt-3">
                    Already have an account? <Link to="/login" className="text-decoration-none">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;