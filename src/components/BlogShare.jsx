import React, { useEffect, useRef, useState } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaCopy, FaShareAlt } from 'react-icons/fa';

const BlogShare = ({ blogUrl, size = 18 }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => () => {
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
  }, []);

  const safeUrl = (() => {
    try {
      if (!blogUrl) return window.location.href;
      // If `blogUrl` is a path like /blog/123, resolve against origin
      const u = new URL(blogUrl, window.location.origin);
      return u.toString();
    } catch (_) {
      return window.location.href;
    }
  })();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch (_) {
      window.prompt('Copy link', safeUrl);
    }
  };

  const handleMouseEnter = () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    setShow(true);
  };

  const handleMouseLeave = () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const iconStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--text)',
    transition: 'transform 160ms ease, color 160ms ease',
  };

  const Item = ({ children, title }) => (
    <div
      title={title}
      style={{
        width: 30,
        height: 30,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 8,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid var(--border-light)',
        cursor: 'pointer',
      }}
      className="share-item"
    >
      {children}
    </div>
  );

  return (
    <div
      className="share-container"
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setShow((s) => !s)}
    >
      <button type="button" className="action-btn" title="Share" aria-haspopup="true" aria-expanded={show}>
        <FaShareAlt />
      </button>
      <div
        className="share-popup"
        style={{
          position: 'absolute',
          top: 44,
          right: 0,
          display: 'flex',
          gap: 8,
          padding: 8,
          background: '#fff',
          borderRadius: 10,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 18px var(--shadow-color)',
          zIndex: 100,
          transition: 'opacity 500ms ease, visibility 500ms ease',
          opacity: show ? 1 : 0,
          visibility: show ? 'visible' : 'hidden',
          pointerEvents: show ? 'auto' : 'none',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
          <button type="button" onClick={handleCopy} className="share-btn" aria-label="Copy link">
            <Item title="Copy">
              <FaCopy style={iconStyle} />
            </Item>
          </button>
          <a
            className="share-btn"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(safeUrl)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Share to Facebook"
          >
            <Item title="Facebook">
              <FaFacebookF style={{ ...iconStyle, color: '#1877F2' }} />
            </Item>
          </a>
          <a
            className="share-btn"
            href={`https://www.instagram.com/?url=${encodeURIComponent(safeUrl)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Open Instagram"
          >
            <Item title="Instagram">
              <FaInstagram style={{ ...iconStyle, color: '#E4405F' }} />
            </Item>
          </a>
          <a
            className="share-btn"
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(safeUrl)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Share to LinkedIn"
          >
            <Item title="LinkedIn">
              <FaLinkedinIn style={{ ...iconStyle, color: '#0A66C2' }} />
            </Item>
          </a>

          {copied && (
            <div
              className="share-toast"
              role="status"
              aria-live="polite"
              style={{
                position: 'absolute',
                bottom: -28,
                right: 0,
                background: '#0ea5e9',
                color: '#fff',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                boxShadow: '0 6px 16px var(--shadow-color)',
                animation: 'slideUp 200ms ease-out',
              }}
            >
              Link copied!
            </div>
          )}
        </div>
    </div>
  );
};

export default BlogShare;