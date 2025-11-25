import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/media';
import './SearchBar.css';

const SearchBar = ({ onSearch, initialQuery = '', initialLocation = '', popularTags = [] }) => {
  // Single combined input: supports "keyword in location" and "remote"
  const initialCombined = (() => {
    const q = (initialQuery || '').trim();
    const loc = (initialLocation || '').trim();
    if (q && loc) return `${q} in ${loc}`;
    return q || loc;
  })();
  const [combinedTerm, setCombinedTerm] = useState(initialCombined);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const [popular, setPopular] = useState(Array.isArray(popularTags) && popularTags.length ? popularTags.slice(0,7) : []);
  const [loadingPopular, setLoadingPopular] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPopular = async () => {
      try {
        setLoadingPopular(true);
        const resp = await fetch(`${API_BASE}/api/analytics/popular-searches?limit=7`);
        const data = await resp.json();
        const list = Array.isArray(data) ? data : [];
        if (!mounted) return;
        setPopular(list.slice(0,7));
      } catch (_) {
        // fallback defaults
        if (!mounted) return;
        setPopular((Array.isArray(popularTags) && popularTags.length ? popularTags : ['Remote','Frontend','Fullstack','React','Developer','JavaScript','Internship']).slice(0,7));
      } finally {
        setLoadingPopular(false);
      }
    };
    loadPopular();
    return () => { mounted = false; };
  }, [popularTags]);

  const parseCombined = (text) => {
    const t = String(text || '').trim();
    if (!t) return { q: '', loc: '' };
    let q = t;
    let loc = '';
    const match = t.match(/^(.*)\s+in\s+(.+)$/i);
    if (match) {
      q = match[1].trim();
      loc = match[2].trim();
    }
    if (!loc && /\bremote\b/i.test(t)) {
      loc = 'Remote';
      q = q.replace(/\bremote\b/gi, '').trim();
    }
    return { q, loc };
  };

  // Debounced live search while typing (single field -> split into q + loc)
  useEffect(() => {
    if (typeof onSearch !== 'function') return;
    const { q, loc } = parseCombined(combinedTerm);
    const t = setTimeout(() => onSearch(q, loc), 300);
    return () => clearTimeout(t);
  }, [combinedTerm, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { q, loc } = parseCombined(combinedTerm);
    if (typeof onSearch === 'function') {
      onSearch(q, loc);
    } else if (q || loc) {
      // Navigate to jobs page with query params when used on home
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (loc) params.set('loc', loc);
      navigate(`/jobs?${params.toString()}`);
    }

    // Fire-and-forget: record search terms for analytics/popular tags
    try {
      const stopwords = new Set(['in','and','or','the','of','for','to','a','an','by','with']);
      const tokenize = (t) => String(t || '')
        .toLowerCase()
        .split(/[^a-z0-9+.#]+/)
        .map(s => s.trim())
        .filter(s => s && s.length >= 3 && !stopwords.has(s));
      const terms = Array.from(new Set([...(tokenize(q)), ...( /remote/i.test(loc) ? ['remote'] : [] )]));
      if (terms.length) {
        fetch(`${API_BASE}/api/analytics/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ terms }),
        }).catch(() => {});
      }
    } catch (_) {}
  };

  const handleQuick = (tag) => {
    const t = String(tag || '').trim();
    if (!t) return;
    // If the SearchBar is embedded in Jobs, call onSearch; otherwise navigate
    if (typeof onSearch === 'function') {
      onSearch(t, '');
      setCombinedTerm(t);
    } else {
      const params = new URLSearchParams();
      params.set('q', t);
      navigate(`/jobs?${params.toString()}`);
    }

    // Record this quick tag selection
    try {
      fetch(`${API_BASE}/api/analytics/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms: [t] }),
      }).catch(() => {});
    } catch (_) {}
  };

  return (
    <div className="searchbar-container">
      <form className={`searchbar-form ${isFocused ? 'focused' : ''}`} onSubmit={handleSubmit}>
        <div className="searchbar-input-group">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search jobs, companies, or e.g. ‘Designer in Lahore’"
            value={combinedTerm}
            onChange={(e) => setCombinedTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="searchbar-input"
          />

          {combinedTerm && (
            <button 
              type="button" 
              className="clear-button"
              onClick={() => setCombinedTerm('')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M18 6L6 18M6 6L18 18" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        
        <button type="submit" className="searchbar-button">
          Search
        </button>
      </form>

      {/* Quick Filters */}
      <div className="quick-filters" aria-busy={loadingPopular}>
        <span className="filters-label">Popular:</span>
        {(popular.length ? popular : ['Remote','Frontend','Fullstack','React','Developer','JavaScript','Internship'].slice(0,7)).map((tag) => (
          <button key={tag} className="filter-tag" onClick={() => handleQuick(tag)}>{tag}</button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;