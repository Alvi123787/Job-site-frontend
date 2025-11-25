import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CallToAction.css';
import { FaArrowRight } from 'react-icons/fa';

const CallToAction = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        try { return !!localStorage.getItem('auth_token'); } catch (_) { return false; }
    });

    useEffect(() => {
        const syncAuth = () => {
            try { setIsLoggedIn(!!localStorage.getItem('auth_token')); } catch (_) { setIsLoggedIn(false); }
        };
        syncAuth();
        const onStorage = () => syncAuth();
        const onAuthChanged = () => syncAuth();
        const onFocus = () => syncAuth();
        window.addEventListener('storage', onStorage);
        window.addEventListener('auth-changed', onAuthChanged);
        window.addEventListener('focus', onFocus);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('auth-changed', onAuthChanged);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    const handleSignup = () => {
        navigate('/signup');
    };

    return (
        <section className="cta-section">
            <div className="cta-container">
                <div className="cta-content">
                    <h2 className="cta-title">
                        Ready to Advance Your Career?
                    </h2>
                    <p className="cta-subtitle">
                        Join 10,000+ professionals finding their dream jobs
                    </p>
                    <div className="cta-buttons">
                        {!isLoggedIn && (
                            <button className="cta-primary-btn" onClick={handleSignup}>
                                Sign Up Now
                                <FaArrowRight className="btn-icon" />
                            </button>
                        )}
                    </div>
                    <p className="cta-trust-text">
                        Trusted by leading companies and startups
                    </p>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;