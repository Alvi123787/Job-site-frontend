import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserPlus,
  FaKey,
  FaCheckCircle
} from 'react-icons/fa';
import { login } from '../utils/auth';
import { fetchProfile } from '../utils/profile';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ error: '', loading: false, success: '' });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ error: '', loading: true, success: '' });
        
        try {
            const resp = await login({ email: formData.email, password: formData.password });
            
            // Store token immediately
            localStorage.setItem('auth_token', resp.token);
            
            // Hydrate full profile to include role and other fields
            try {
                const profile = await fetchProfile();
                localStorage.setItem('auth_user', JSON.stringify({
                    id: profile?._id || profile?.id,
                    name: profile?.name || resp?.user?.name || '',
                    email: profile?.email || resp?.user?.email || '',
                    role: profile?.role || '',
                    location: profile?.location || '',
                    profession: profile?.profession || '',
                    bio: profile?.bio || '',
                    avatarUrl: profile?.avatarUrl || '',
                }));
            } catch (_) {
                // Fallback to login user if profile fails
                localStorage.setItem('auth_user', JSON.stringify(resp.user));
            }
            
            window.dispatchEvent(new Event('auth-changed'));
            setStatus({ error: '', loading: false, success: 'Login successful! Redirecting...' });
            
            // Redirect after a brief delay to show success message
            setTimeout(() => {
                navigate('/');
            }, 1000);
            
        } catch (err) {
            setStatus({ error: err.message || 'Login failed. Please check your credentials.', loading: false, success: '' });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (status.error) {
            setStatus({ ...status, error: '' });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <span>Job Box</span>
                        </div>
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">Sign in to your account to continue</p>
                    </div>

                    {/* Status Messages */}
                    {status.error && (
                        <div className="alert alert-error" role="alert">
                            <div className="alert-icon">!</div>
                            <div className="alert-content">
                                <p>{status.error}</p>
                            </div>
                        </div>
                    )}
                    
                    {status.success && (
                        <div className="alert alert-success" role="alert">
                            <FaCheckCircle className="alert-icon" />
                            <div className="alert-content">
                                <p>{status.success}</p>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={status.loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={status.loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                    disabled={status.loading}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <Link to="/forgot-password" className="forgot-link">
                                <FaKey className="link-icon" />
                                Forgot password?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            className="login-button"
                            disabled={status.loading}
                        >
                            {status.loading ? (
                                <>
                                    <div className="button-spinner"></div>
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="login-divider">
                        <span>New to Job Box?</span>
                    </div>

                    {/* Sign Up Link */}
                    <Link to="/signup" className="signup-link">
                        <FaUserPlus className="link-icon" />
                        Create an account
                    </Link>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>By continuing, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;