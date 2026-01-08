import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import './Jobs.css';
import { CATEGORIES } from '../data/categories';
 

const Jobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('newest'); // newest | relevant | salary
  const [remoteJobs, setRemoteJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const scrollTimeoutRef = useRef(null);
  // Sidebar responsive state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isNarrow = viewportWidth <= 991; // tablet and below
  // Initialize from URL so redirect searches filter immediately
  const initParams = new URLSearchParams(location.search || '');
  const [searchQuery, setSearchQuery] = useState(String(initParams.get('q') || ''));
  const [searchLocation, setSearchLocation] = useState(String(initParams.get('loc') || ''));
  const [filters, setFilters] = useState({
    jobType: [],
    experienceLevel: [],
    location: '',
    salaryRange: [0, 100000],
    remote: false,
    skills: [],
    companySize: '',
    postedDate: ''
  });

  // Combine backend + local published to compute dynamic salary max
  const combinedForMax = useMemo(() => {
    let published = [];
    try {
      const raw = localStorage.getItem('published_jobs');
      published = raw ? JSON.parse(raw) : [];
    } catch (_) {}
    const merged = [...remoteJobs, ...published];
    const seen = new Set();
    const uniq = [];
    for (const j of merged) {
      const key = String(j.id || j._id || j.raw?._id || `${j.title || ''}|${j.company || ''}`);
      if (!seen.has(key)) {
        seen.add(key);
        uniq.push(j);
      }
    }
    return uniq;
  }, [remoteJobs]);

  const maxSalaryCap = useMemo(() => {
    if (!combinedForMax.length) return 100000;
    const vals = combinedForMax.map(j => Number(j.salary ?? j.salaryMax ?? j.salaryMin ?? 0)).filter(n => Number.isFinite(n));
    const max = Math.max(0, ...(vals.length ? vals : [0]));
    return Math.max(max, 10000); // ensure a reasonable minimum cap
  }, [combinedForMax]);

  // Published jobs count (localStorage) to compute total display count
  const publishedCount = useMemo(() => {
    // Informational only; deduped published jobs beyond backend
    const count = Math.max(0, combinedForMax.length - remoteJobs.length);
    return Number.isFinite(count) ? count : 0;
  }, [combinedForMax, remoteJobs]);

  // Sync filters default salary range to dynamic max when cap increases
  useEffect(() => {
    setFilters(prev => {
      const [min, max] = prev.salaryRange || [0, 100000];
      // If still at the initial default or exceeding cap, align to cap
      const isInitial = Number(min) === 0 && Number(max) === 100000;
      const needsClamp = Number(max) > Number(maxSalaryCap || 100000);
      if (isInitial || needsClamp) {
        return { ...prev, salaryRange: [0, Number(maxSalaryCap || 100000)] };
      }
      return prev;
    });
  }, [maxSalaryCap]);

  // Fetch jobs from backend with pagination and append
  useEffect(() => {
    const mapApiJob = (job) => {
      // Keep geographic location; treat remote as work type
      const location = `${job.city || ''}${job.state ? ', ' + job.state : ''}${job.country ? ', ' + job.country : ''}`.replace(/^,\s*/, '');
      const salary = job.salaryMax || job.salaryMin || 0;
      const categoryName = job.category || 'General';
      const match = CATEGORIES.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      return {
        id: job._id,
        title: job.title,
        company: job.company,
        logo: job.companyLogo || '/company-placeholder.svg',
        location,
        workType: job.remote ? 'Remote' : job.workMode,
        remote: !!job.remote,
        type: job.jobType,
        // Normalize experience level so filters can match consistently
        experienceLevel: job.experienceLevel || job.employmentLevel || job.level || '',
        postedDate: new Date(job.postingDate || job.createdAt).toLocaleDateString(),
        postedAt: new Date(job.postingDate || job.createdAt).getTime(),
        endDate: job.endDate ? new Date(job.endDate).getTime() : undefined,
        postedDaysAgo: 0,
        isNew: true,
        salary,
        featured: !!job.featured,
        category: categoryName,
        accentColor: match?.color || '#3B82F6',
        brandIcon: 'bullseye',
      };
    };

    const fetchPage = async () => {
      if (loading) return;
      try {
        setLoading(true);
        // Preserve featured filter when navigating from FeaturedJobs
        const params = new URLSearchParams(location.search || '');
        const featuredParam = params.get('featured') ?? params.get('feature');
        const featuredQuery = typeof featuredParam === 'string' ? `&featured=${featuredParam}` : '';
        const resp = await fetch(`https://job-site-backend-seven.vercel.app/api/jobs?page=${page}&limit=20${featuredQuery}`);
        if (resp.ok) {
          const data = await resp.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []);
          const mapped = list.map(mapApiJob);
          setRemoteJobs(prev => [...prev, ...mapped]);
          if (!Array.isArray(data)) {
            setTotalJobs(Number(data.totalJobs || 0));
            const totalPages = Number(data.totalPages || 1);
            setHasMore(page < totalPages);
          } else {
            setHasMore(false);
            setTotalJobs(mapped.length);
          }
        } else {
          const altResp = await fetch(`https://job-site-backend-seven.vercel.app/api/jobs?limit=50${featuredQuery}`);
          if (!altResp.ok) { setHasMore(false); return; }
          const altData = await altResp.json();
          const altList = Array.isArray(altData) ? altData : (Array.isArray(altData?.jobs) ? altData.jobs : []);
          const mapped = altList.map(mapApiJob);
          setRemoteJobs(prev => [...prev, ...mapped]);
          setHasMore(false);
          if (!Array.isArray(altData)) {
            setTotalJobs(Number(altData.totalJobs || mapped.length || 0));
          } else {
            setTotalJobs(mapped.length);
          }
        }
      } catch (_) {
        try {
          const params = new URLSearchParams(location.search || '');
          const featuredParam = params.get('featured') ?? params.get('feature');
          const featuredQuery = typeof featuredParam === 'string' ? `&featured=${featuredParam}` : '';
          const altResp = await fetch(`https://job-site-backend-seven.vercel.app/api/jobs?limit=50${featuredQuery}`);
          if (altResp.ok) {
            const altData = await altResp.json();
            const altList = Array.isArray(altData) ? altData : (Array.isArray(altData?.jobs) ? altData.jobs : []);
            const mapped = altList.map(mapApiJob);
            setRemoteJobs(prev => [...prev, ...mapped]);
            setHasMore(false);
            if (!Array.isArray(altData)) {
              setTotalJobs(Number(altData.totalJobs || mapped.length || 0));
            } else {
              setTotalJobs(mapped.length);
            }
          } else {
            setHasMore(false);
          }
        } catch (_) {
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [page]);

  // Read sort preference from URL (e.g., /jobs?sort=newest)
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const s = String(params.get('sort') || '').toLowerCase();
    if (s === 'newest' || s === 'salary' || s === 'relevant') {
      setSortBy(s);
    }
  }, [location.search]);

  // Read search query and location from URL (e.g., /jobs?q=react&loc=Lahore)
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const q = String(params.get('q') || '');
    const loc = String(params.get('loc') || '');
    setSearchQuery(q);
    setSearchLocation(loc);
  }, [location.search]);

  const jobs = useMemo(() => {
    // Load published jobs from localStorage (from Admin JobPostForm)
    let published = [];
    try {
      const raw = localStorage.getItem('published_jobs');
      published = raw ? JSON.parse(raw) : [];
    } catch (_) { /* ignore parse errors */ }

    // Use deduped merged list of backend + local published
    const combined = combinedForMax;

    // Sorting helpers
    const toTime = (job) => {
      // Prefer explicit timestamp if available
      if (job.postedAt) return Number(job.postedAt) || 0;
      // Try postedDate as date string
      const d = new Date(job.postedDate || job.posted || Date.now());
      return d.getTime();
    };

    // Filter helpers: searchbar query/location
    const matchesQuery = (job) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      const fields = [
        job.title,
        job.company,
        job.type,
        job.category,
        job.workType,
        job.workMode,
        Array.isArray(job.tags) ? job.tags.join(' ') : job.tags,
        Array.isArray(job.skills) ? job.skills.join(' ') : job.skills,
        job.description,
        job.shortDescription,
      ];
      const haystack = fields.map(v => String(v || '').toLowerCase()).join(' | ');
      return haystack.includes(q);
    };
    const matchesLocation = (job) => {
      if (!searchLocation.trim()) return true;
      const loc = searchLocation.trim().toLowerCase();
      return String(job.location || '').toLowerCase().includes(loc);
    };

    // Sidebar filters
    const matchesSidebar = (job) => {
      // Job Type
      const okType = filters.jobType.length === 0 || filters.jobType.some(t => String(job.type || '').toLowerCase().includes(String(t).toLowerCase()));
      // Experience Level
      const okExp = filters.experienceLevel.length === 0 || filters.experienceLevel.some(l => String(job.experienceLevel || job.employmentLevel || '').toLowerCase().includes(String(l).toLowerCase()));
      // Location text from sidebar
      const okLocSidebar = !String(filters.location || '').trim() || String(job.location || '').toLowerCase().includes(String(filters.location).trim().toLowerCase());
      // Remote only
      const okRemote = !filters.remote || !!job.remote || /remote/i.test(String(job.workType || ''));
      // Salary range (apply only if user changed from default [0, maxSalaryCap])
      const sal = Number(job.salary || 0);
      const [min, max] = filters.salaryRange;
      const isDefaultRange = Number(min || 0) === 0 && (Number(max) === Number(maxSalaryCap || 100000) || Number(max) === 100000);
      const okSalary = isDefaultRange ? true : (sal >= Number(min || 0) && sal <= Number(max || Number.MAX_SAFE_INTEGER));
      // Posted date window
      const now = Date.now();
      const ageDays = (now - toTime(job)) / (1000 * 60 * 60 * 24);
      let okPosted = true;
      switch (filters.postedDate) {
        case 'Last 24 hours':
          okPosted = ageDays <= 1; break;
        case 'Last 3 days':
          okPosted = ageDays <= 3; break;
        case 'Last week':
          okPosted = ageDays <= 7; break;
        case 'Last month':
          okPosted = ageDays <= 30; break;
        case 'Any time':
        case '':
        default:
          okPosted = true;
      }
      return okType && okExp && okLocSidebar && okRemote && okSalary && okPosted;
    };

    const notExpired = (job) => {
      const rawEnd = job.endDate ?? job.raw?.endDate;
      if (!rawEnd) return true;
      const ts = typeof rawEnd === 'number' ? rawEnd : new Date(rawEnd).getTime();
      return !Number.isFinite(ts) || ts >= Date.now();
    };

    // Optional category filter via query param
    const params = new URLSearchParams(location.search || '');
    const activeCategory = params.get('category');
    const featuredParam = params.get('featured') ?? params.get('feature');
    const activeFeatured = (featuredParam === 'true') ? true : (featuredParam === 'false' ? false : null);
    const companyParam = params.get('company');

    const matchesCategory = (job) => {
      if (!activeCategory) return true;
      return String(job.category || '').toLowerCase() === String(activeCategory || '').toLowerCase();
    };

    const matchesFeatured = (job) => {
      if (activeFeatured === null) return true;
      return Boolean(job.featured) === activeFeatured;
    };

    const matchesCompany = (job) => {
      if (!companyParam) return true;
      return String(job.company || '').toLowerCase() === String(companyParam || '').toLowerCase();
    };

    const filtered = combined.filter(j => notExpired(j) && matchesCategory(j) && matchesFeatured(j) && matchesCompany(j) && matchesQuery(j) && matchesLocation(j) && matchesSidebar(j));

    const sorted = [...filtered];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => toTime(b) - toTime(a));
    } else if (sortBy === 'salary') {
      sorted.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    } else {
      // most relevant (simple heuristic: full time first, then remote)
      sorted.sort((a, b) => {
        const isRemote = (job) => !!job.remote || /remote/i.test(String(job.workType || ''));
        const score = (job) => (String(job.type).includes('Full') ? 2 : 0) + (isRemote(job) ? 1 : 0);
        return score(b) - score(a);
      });
    }
    return sorted;
  }, [sortBy, remoteJobs, searchQuery, searchLocation, filters, maxSalaryCap, location.search]);

  // Debounced scroll listener to trigger next page load
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
        if (nearBottom && hasMore && !loading) {
          setPage(p => p + 1);
        }
      }, 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [hasMore, loading]);

  // Track viewport width for responsive sidebar behavior
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="jobs-page">
      {/* Header / Title Section */}
      <header className="jobs-header">
        <div className="jobs-header-container">
          <h1 className="jobs-title">Find Your <span className="jobs-title-highlight">Dream Job</span></h1>
          <p className="jobs-subtitle">Browse the latest opportunities that match your skills.</p>
          {/* Jobs counter banner */}
          <div className="jobs-count-banner">
            {(() => {
              const totalDisplay = combinedForMax.length;
              return `Showing ${jobs.length} of ${totalDisplay}`;
            })()}
          </div>
          {/* Search Bar: seeded from URL and updates URL on search */}
          <SearchBar
            key={location.search}
            initialQuery={searchQuery}
            initialLocation={searchLocation}
            onSearch={(q, loc) => {
              setSearchQuery(q);
              setSearchLocation(loc);
              const params = new URLSearchParams(location.search || '');
              if (q) params.set('q', q); else params.delete('q');
              if (loc) params.set('loc', loc); else params.delete('loc');
              navigate({ pathname: '/jobs', search: `?${params.toString()}` }, { replace: false });
            }}
          />
        </div>
      </header>

      {/* Main Layout */}
      <div className="jobs-content">
        {/* Desktop / wide: inline sticky sidebar */}
        {!isNarrow && (
          <aside className="filters-column" aria-label="Filters sidebar">
            <JobFilters maxSalary={maxSalaryCap} onFilterChange={(f) => { setFilters(f); }} />
          </aside>
        )}
        <div className="cards-column jobs-list-container">
          {/* Sort Bar */}
          <div className="sort-bar">
            <div className="sort-left">
              <span className="results-info">
                {(() => {
                  const totalDisplay = combinedForMax.length;
                  return `Loaded ${jobs.length} of ${totalDisplay}`;
                })()}
              </span>
            </div>
            <div className="sort-right">
              {/* Mobile/tablet filters toggle */}
              {isNarrow && (
                <button className="filters-toggle" onClick={() => setIsFiltersOpen(true)} aria-label="Open filters">Filters</button>
              )}
              <label htmlFor="sort-select" className="sort-label">Sort by</label>
              <select id="sort-select" className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="relevant">Most Relevant</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard key={job.id || job._id} job={job} />
            ))}
          </div>
          {/* Loader & Load More */}
          <div className="load-more-container">
            {loading && (<div className="job-card-skeleton" style={{ minHeight: 40 }}>Loading…</div>)}
            {!loading && hasMore && (
              <button className="load-more-button" onClick={() => setPage(p => p + 1)}>Load More</button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet overlay sidebar */}
      {isNarrow && (
        <>
          <JobFilters
            variant="overlay"
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            maxSalary={maxSalaryCap}
            onFilterChange={(f) => { setFilters(f); }}
          />
          <div className={`filters-backdrop ${isFiltersOpen ? 'show' : ''}`} onClick={() => setIsFiltersOpen(false)}></div>
        </>
      )}
    </div>
  );
};

export default Jobs;
