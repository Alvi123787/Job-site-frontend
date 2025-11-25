// src/components/JobStructuredData.jsx
import { useEffect } from 'react';

export default function JobStructuredData({ schemaJsonLd, jobId }) {
  useEffect(() => {
    if (!schemaJsonLd) return;
    const id = `job-jsonld-${jobId || Math.random().toString(36).slice(2,9)}`;
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      document.head.appendChild(script);
    }
    // schemaJsonLd should already be a string; ensure valid JSON string
    script.text = schemaJsonLd;
    // keep script in DOM (do not remove on unmount) so search engines can see it
    return () => {};
  }, [schemaJsonLd, jobId]);

  return null;
}