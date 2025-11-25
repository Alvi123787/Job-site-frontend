import React, { useState } from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import './Footer.css';
import { COUNTRIES } from '../data/countries';
import { API_BASE } from '../utils/media';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('');
    const [status, setStatus] = useState({ type: '', message: '', loading: false });

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const eaddr = String(email || '').trim();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eaddr);
        if (!ok) { setStatus({ type: 'error', message: 'Please enter a valid email.', loading: false }); return; }
        setStatus({ type: '', message: '', loading: true });
        try {
            const resp = await fetch(`${API_BASE}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: eaddr, country, type: 'job' }),
            });
            if (!resp.ok) {
                let msg = 'Subscription failed';
                try { const j = await resp.json(); msg = j.error || j.message || msg; } catch (_) {}
                throw new Error(msg);
            }
            setStatus({ type: 'success', message: 'Subscribed Successfully!', loading: false });
            setEmail('');
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Server error', loading: false });
        }
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">Job Box</h3>
                        <div className="social-links">
                            <a href="#" className="social-link">
                                <FaLinkedin />
                            </a>
                            <a href="#" className="social-link">
                                <FaTwitter />
                            </a>
                            <a href="#" className="social-link">
                                <FaFacebook />
                            </a>
                            <a href="#" className="social-link">
                                <FaInstagram />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-subtitle">Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-section">
                        <h4 className="footer-subtitle">Stay Updated</h4>
                        {status.type === 'success' ? (
                            <p className="newsletter-status success">Subscribed! Job alerts are on.</p>
                        ) : (
                            <>
                                <p className="newsletter-text">
                                    Subscribe to our newsletter for the latest job opportunities
                                </p>
                                <form className="newsletter-form" onSubmit={handleSubscribe}>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email"
                                        className="newsletter-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        aria-label="Email address"
                                    />
                                    <select
                                        className="newsletter-select"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        aria-label="Country preference (optional)"
                                    >
                                        <option value="">Country (optional)</option>
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button type="submit" className="newsletter-button" disabled={status.loading}>
                                        {status.loading ? (
                                            <>
                                                <span className="spinner" aria-hidden="true"></span>
                                                Subscribing...
                                            </>
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </form>
                        {status.message && (
                                    <p className={`newsletter-status ${status.type === 'error' ? 'error' : 'success'}`}>{status.message}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p className="copyright">© {currentYear} Job Box. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;