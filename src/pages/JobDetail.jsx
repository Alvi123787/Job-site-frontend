import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './JobDetail.css'
import { saveJob, removeJob, isJobSaved, fetchSavedItems } from '../utils/saved'
import JobStructuredData from '../components/JobStructuredData'
import { API_BASE } from '../utils/media'

export default function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [status, setStatus] = useState({ loading: true, message: '' })
  const [similarJobs, setSimilarJobs] = useState([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const isObjectId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v)

    const mapJob = (j) => {
      // Location should show city/state/country even for remote roles
      const location = `${j.city || ''}${j.state ? ', ' + j.state : ''}${j.country ? ', ' + j.country : ''}`.replace(/^,\s*/, '')
      const benefitsArr = Array.isArray(j.benefits) ? j.benefits : (j.benefits || '').split(',').map(s => s.trim()).filter(Boolean)
      return {
        id: j._id || j.id,
        title: j.title,
        company: {
          name: j.company,
          logo: j.companyLogo || '/vite.svg',
          industry: j.category || '—',
          website: j.website || '',
          size: j.companySize || '',
          founded: j.companyFounded || ''
        },
        location,
        workType: j.remote ? 'Remote' : j.workMode,
        type: j.jobType,
        postedDate: new Date(j.postingDate || j.createdAt || Date.now()).toLocaleDateString(),
        applications: (typeof j.applicationsCount !== 'undefined') ? Number(j.applicationsCount) : (typeof j.applications !== 'undefined' ? Number(j.applications) : 0),
        description: j.longDescription || j.shortDescription || '',
        responsibilities: Array.isArray(j.skills) ? j.skills : (j.skills ? String(j.skills).split(',').map(s => s.trim()) : []),
        qualifications: [j.experience, j.education].filter(Boolean),
        preferredSkills: Array.isArray(j.tags) ? j.tags : (j.tags ? String(j.tags).split(',').map(s => s.trim()) : []),
        experienceLevel: j.employmentLevel,
        salaryRange: j.salaryMin && j.salaryMax ? `${j.salaryMin}–${j.salaryMax}` : (j.salaryMax || j.salaryMin || ''),
        salaryPeriod: j.salaryPer || 'Year',
        employmentType: j.jobType,
        benefits: benefitsArr,
        apply: j.apply,
        schemaJsonLd: j.schemaJsonLd,
      }
    }

    const load = async () => {
      try {
        if (isObjectId(id)) {
          const resp = await fetch(`${API_BASE}/api/jobs/${id}`)
          if (resp.ok) {
            const data = await resp.json()
            setJob(mapJob(data))
            setStatus({ loading: false, message: '' })
            return
          }
          // Non-OK (e.g., expired or not found)
          try {
            const err = await resp.json();
            setStatus({ loading: false, message: err?.error || 'Job not found.' })
          } catch (_) {
            setStatus({ loading: false, message: 'Job not found.' })
          }
          return
        }
        // Fallback: localStorage published_jobs
        const raw = localStorage.getItem('published_jobs')
        const list = raw ? JSON.parse(raw) : []
        const found = list.find(j => String(j.id) === String(id) || String(j.raw?._id) === String(id))
        if (found) {
          setJob(mapJob(found.raw || found))
          setStatus({ loading: false, message: '' })
          return
        }
        setStatus({ loading: false, message: 'Job not found.' })
      } catch (e) {
        setStatus({ loading: false, message: 'Error loading job.' })
      }
    }
    load()
  }, [id])

  // Count applicants when Apply is clicked with user dedup and login requirement
  const [applied, setApplied] = useState(false);
  const handleApplyClick = async (e) => {
    try {
      e?.preventDefault?.();
      
      const jobId = job?.id || id;
      if (!jobId) return;
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const url = `${API_BASE}/api/jobs/${jobId}/apply`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
        keepalive: true,
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setApplied(true);
        if (typeof data?.applicationsCount === 'number') {
          setJob((prev) => prev ? { ...prev, applications: Number(data.applicationsCount) } : prev);
        } else {
          setJob((prev) => prev ? { ...prev, applications: Number(prev.applications || 0) + (data?.new ? 1 : 0) } : prev);
        }
      }
      // Proceed to external application target
      const applyTarget = String(job?.apply || '').trim();
      if (applyTarget) {
        if (applyTarget.startsWith('http')) {
          window.open(applyTarget, '_blank', 'noopener');
        } else {
          window.location.href = `mailto:${applyTarget}`;
        }
      }
    } catch (_) {
      // ignore client-side errors
    }
  };

  // Initialize saved state based on auth (server) or local fallback
  useEffect(() => {
    const currentId = job?.id || id
    if (!currentId) return
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        (async () => {
          try {
            const data = await fetchSavedItems()
            const isSaved = Array.isArray(data.jobs) && data.jobs.some((j) => String((j._id||j.id)) === String(currentId))
            setSaved(!!isSaved)
          } catch (_) {
            setSaved(isJobSaved(currentId))
          }
        })()
      } else {
        setSaved(isJobSaved(currentId))
      }
    } catch (_) {
      setSaved(false)
    }
  }, [job, id])

  // Load Similar Jobs from backend (exclude current, prefer same category)
  useEffect(() => {
    
    const mapApiJob = (j) => {
      // Keep geographic location; treat remote as work type
      const location = `${j.city || ''}${j.state ? ', ' + j.state : ''}${j.country ? ', ' + j.country : ''}`.replace(/^,\s*/, '')
      return {
        id: j._id,
        title: j.title,
        company: j.company,
        location,
        logo: j.companyLogo || '/vite.svg',
        type: j.jobType,
        category: j.category || 'General',
      }
    }
    ;(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/jobs?limit=50`)
        if (!resp.ok) return
        const data = await resp.json()
        const list = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : [])
        const all = list.map(mapApiJob)
        const filtered = all.filter(j => String(j.id) !== String(id))
        const byCategory = job?.company?.industry ? filtered.filter(j => (j.category || '').toLowerCase() === (job.company.industry || '').toLowerCase()) : filtered
        setSimilarJobs((byCategory.length ? byCategory : filtered).slice(0, 5))
      } catch (_) {
        // ignore errors
      }
    })()
  }, [id, job])

  // Load applied status for current user and sync application count
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const jobId = job?.id || id;
        if (!token || !jobId) return;
        
        const resp = await fetch(`${API_BASE}/api/jobs/${jobId}/apply/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        setApplied(!!data?.applied);
        if (typeof data?.applicationsCount === 'number') {
          setJob((prev) => prev ? { ...prev, applications: Number(data.applicationsCount) } : prev);
        }
      } catch (_) {
        // ignore errors
      }
    })();
  }, [job, id])

  if (status.loading) {
    return (
      <div className="job-detail">
        <section className="job-header">
          <div className="job-header-top">
            <div className="title-wrap">
              <div className="title-content">
                <h1 className="job-title">Loading…</h1>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="job-detail">
        <section className="job-header">
          <div className="job-header-top">
            <div className="title-wrap">
              <div className="title-content">
                <h1 className="job-title">{status.message || 'Job not found'}</h1>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="job-detail">
      <JobStructuredData schemaJsonLd={job.schemaJsonLd} jobId={job.id || id} />
      {/* Header Section */}
      <section className="job-header">
        <div className="job-header-top">
          <div className="title-wrap">
            {(() => {
              const rawLogo = job.company.logo || '/company-placeholder.svg'
              
              const isExternal = /^https?:\/\//i.test(String(rawLogo))
              const proxied = isExternal ? `${API_BASE}/api/assets/image-proxy?url=${encodeURIComponent(rawLogo)}` : rawLogo
              return (
                <img
                  className="company-badge"
                  src={proxied}
                  alt={`${job.company.name} logo`}
                  onError={(e) => { e.currentTarget.src = '/company-placeholder.svg'; }}
                />
              )
            })()}
            <div className="title-content">
              <h1 className="job-title">{job.title}</h1>
              <div className="company-info">
                <span className="company-name">{job.company.name}</span>
                <span className="company-industry">{job.company.industry}</span>
              </div>
            </div>
          </div>
          <div className="actions">
            <button
              className={`save-btn ${saved ? 'active' : ''}`}
              type="button"
              disabled={saving}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentId = job?.id || id
                if (!currentId) return
                const token = localStorage.getItem('auth_token')
                if (!token) { navigate('/login'); return }
                try {
                  setSaving(true)
                  if (saved) {
                    await removeJob(currentId)
                    setSaved(false)
                  } else {
                    await saveJob({ id: currentId, _id: currentId, title: job?.title, company: job?.company?.name || job?.company, location: job?.location, salary: job?.salaryRange })
                    setSaved(true)
                  }
                } catch (err) {
                  console.warn('job save toggle failed', err)
                } finally {
                  setSaving(false)
                }
              }}
              aria-label={saved ? 'Saved' : 'Save'}
            >
              <svg className="bookmark-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17.5 1.25a.5.5 0 0 1 1 0v2.5H21a.5.5 0 0 1 0 1h-2.5v2.5a.5.5 0 0 1-1 0v-2.5H15a.5.5 0 0 1 0-1h2.5v-2.5zm-11 4.5a1 1 0 0 1 1-1H11a.5.5 0 0 0 0-1H7.5a2 2 0 0 0-2 2v14a.5.5 0 0 0 .8.4l5.7-4.4 5.7 4.4a.5.5 0 0 0 .8-.4v-8.5a.5.5 0 0 0-1 0v7.48l-5.2-4a.5.5 0 0 0-.6 0l-5.2 4V5.75z" fill="currentColor"/>
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
            <a
              className={`apply-btn${applied ? ' disabled' : ''}`}
              href={job.apply ? (String(job.apply).startsWith('http') ? job.apply : `mailto:${job.apply}`) : '#apply'}
              target={job.apply && String(job.apply).startsWith('http') ? '_blank' : undefined}
              rel={job.apply && String(job.apply).startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={handleApplyClick}
              aria-disabled={applied}
            >
              <span>{applied ? 'Already Applied' : 'Apply Now'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="job-meta-grid">
          <div className="meta-item">
            <div className="meta-icon">📍</div>
            <div className="meta-content">
              <span className="meta-label">Location</span>
              <span className="meta-value">{job.location}</span>
            </div>
          </div>
          {job.address && (
            <div className="meta-item">
              <div className="meta-icon">🏢</div>
              <div className="meta-content">
                <span className="meta-label">Office Address</span>
                <span className="meta-value">{job.address}</span>
              </div>
            </div>
          )}
          <div className="meta-item">
            <div className="meta-icon">💼</div>
            <div className="meta-content">
              <span className="meta-label">Work Type</span>
              <span className="meta-value">{job.workType}</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon">🕒</div>
            <div className="meta-content">
              <span className="meta-label">Job Type</span>
              <span className="meta-value">{job.type}</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon">📅</div>
            <div className="meta-content">
              <span className="meta-label">Posted</span>
              <span className="meta-value">{job.postedDate}</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon">👥</div>
            <div className="meta-content">
              <span className="meta-label">Applications</span>
              <span className="meta-value">{job.applications}</span>
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-icon">🎯</div>
            <div className="meta-content">
              <span className="meta-label">Experience</span>
              <span className="meta-value">{job.experienceLevel}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="job-content">
        {/* Main Content */}
        <article className="details">
          {/* Job Description */}
          {job.description && (
            <section className="detail-section">
              <h2 className="section-title">Job Description</h2>
              <p className="section-text">{job.description}</p>
            </section>
          )}

          {/* Key Responsibilities */}
          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
            <section className="detail-section">
              <h2 className="section-title">Key Responsibilities</h2>
              <ul className="bullet-list">
                {job.responsibilities.map((responsibility, idx) => (
                  <li key={idx}>{responsibility}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Qualifications & Skills */}
          {(Array.isArray(job.qualifications) && job.qualifications.length > 0) ||
           (Array.isArray(job.preferredSkills) && job.preferredSkills.length > 0) ? (
            <section className="detail-section grid-two">
              {Array.isArray(job.qualifications) && job.qualifications.length > 0 && (
                <div>
                  <h2 className="section-title">Required Qualifications</h2>
                  <ul className="bullet-list">
                    {job.qualifications.map((qualification, idx) => (
                      <li key={idx}>{qualification}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(job.preferredSkills) && job.preferredSkills.length > 0 && (
                <div>
                  <h2 className="section-title">Skills</h2>
                  <div className="chip-list">
                    {job.preferredSkills.map((skill, idx) => (
                      <span key={idx} className="chip">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : null}

          {/* Job Details */}
          {(job.experienceLevel || job.employmentType || job.workType || job.applications) && (
            <section className="detail-section">
              <h2 className="section-title">Job Details</h2>
              <div className="details-grid">
                {job.experienceLevel && (
                  <div className="detail-item">
                    <span className="detail-label">Experience Level</span>
                    <span className="detail-value">{job.experienceLevel}</span>
                  </div>
                )}
                {job.employmentType && (
                  <div className="detail-item">
                    <span className="detail-label">Employment Type</span>
                    <span className="detail-value">{job.employmentType}</span>
                  </div>
                )}
                {job.workType && (
                  <div className="detail-item">
                    <span className="detail-label">Work Arrangement</span>
                    <span className="detail-value">{job.workType}</span>
                  </div>
                )}
                {(job.applications !== undefined) && (
                  <div className="detail-item">
                    <span className="detail-label">Applications Received</span>
                    <span className="detail-value">{job.applications}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Benefits */}
          {Array.isArray(job.benefits) && job.benefits.length > 0 && (
            <section className="detail-section">
              <h2 className="section-title">Benefits & Perks</h2>
              <div className="benefits-grid">
                {job.benefits.map((benefit, idx) => (
                  <div key={idx} className="benefit-item">
                    <span className="benefit-text">{benefit}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Apply Section (only if apply link/email present) */}
          {job.apply && (
            <section id="apply" className="detail-section apply-section">
              <h2 className="section-title">Ready to Apply?</h2>
              <div className="apply-actions">
                <a
                  className={`apply-btn primary${applied ? ' disabled' : ''}`}
                  href={String(job.apply).startsWith('http') ? job.apply : `mailto:${job.apply}`}
                  target={String(job.apply).startsWith('http') ? '_blank' : undefined}
                  rel={String(job.apply).startsWith('http') ? 'noopener noreferrer' : undefined}
                  onClick={handleApplyClick}
                >
                  {applied ? 'Already Applied' : 'Apply for This Position'}
                </a>
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Company Info Card */}
          <div className="company-card">
            <div className="company-card-header">
              <img className="company-card-logo" src={job.company.logo} alt={`${job.company.name} logo`} />
              <div className="company-card-header-text">
                <div className="company-card-name">{job.company.name}</div>
                <div className="company-card-industry">{job.company.industry || '—'}</div>
              </div>
            </div>
            <div className="company-card-body">
              {job.location && (
                <div className="company-field">
                  <span className="field-label">Location</span>
                  <span className="field-value">{job.location}</span>
                  {job.address && <span className="field-subvalue">{job.address}</span>}
                </div>
              )}
              {job.company.size && (
                <div className="company-field">
                  <span className="field-label">Company Size</span>
                  <span className="field-value">{job.company.size}</span>
                </div>
              )}
              {job.company.founded && (
                <div className="company-field">
                  <span className="field-label">Founded</span>
                  <span className="field-value">{job.company.founded}</span>
                </div>
              )}
              <div className="company-cta-wrap">
                {job.company.website ? (
                  <a className="company-cta" href={job.company.website} target="_blank" rel="noreferrer">
                    Visit Profile
                  </a>
                ) : (
                  <span className="company-cta disabled">Website not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Salary & Job Information Card (only if salary info present) */}
          {(job.salaryRange || job.salaryPeriod || job.employmentType || job.workType || job.postedDate || job.location || job.apply) && (
            <div className="card salary-card">
              <div className="card-title">Salary Information</div>
              {(job.salaryRange || job.salaryPeriod) && (
                <div className="salary-range">
                  {job.salaryRange && <span className="salary-value">{job.salaryRange}</span>}
                  {job.salaryPeriod && <span className="salary-period">{job.salaryPeriod}</span>}
                </div>
              )}
              <ul className="salary-meta">
                {job.apply && (
                  <li className="salary-meta-item">
                    <span className="meta-icon">📧</span>
                    <span className="meta-text">{String(job.apply).startsWith('http') ? 'Apply online' : job.apply}</span>
                  </li>
                )}
                {job.employmentType && (
                  <li className="salary-meta-item">
                    <span className="meta-icon">💼</span>
                    <span className="meta-text">{job.employmentType}</span>
                  </li>
                )}
                {job.workType && (
                  <li className="salary-meta-item">
                    <span className="meta-icon">🕒</span>
                    <span className="meta-text">{job.workType}</span>
                  </li>
                )}
                {job.postedDate && (
                  <li className="salary-meta-item">
                    <span className="meta-icon">📅</span>
                    <span className="meta-text">Posted on {job.postedDate}</span>
                  </li>
                )}
                {job.location && (
                  <li className="salary-meta-item">
                    <span className="meta-icon">📍</span>
                    <span className="meta-text">{job.location}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Similar Jobs Card */}
          <div className="card latest-jobs">
            <div className="card-title">Similar Jobs</div>
            {similarJobs.length === 0 ? (
              <div className="latest-empty">No similar jobs yet.</div>
            ) : (
              <ul className="latest-list">
                {similarJobs.slice(0, 3).map((jobItem) => (
                  <li key={jobItem.id} className="latest-item">
                    <Link to={`/jobs/${jobItem.id}`} className="latest-link">
                      {(() => {
                        const rawLogo = jobItem.logo || '/company-placeholder.svg'
                        
                        const isExternal = /^https?:\/\//i.test(String(rawLogo))
                        const proxied = isExternal ? `${API_BASE}/api/assets/image-proxy?url=${encodeURIComponent(rawLogo)}` : rawLogo
                        return (<img src={proxied} alt={`${jobItem.company} logo`} className="latest-logo" />)
                      })()}
                      <div className="latest-text">
                        <div className="latest-title">{jobItem.title}</div>
                        <div className="latest-company">{jobItem.company}</div>
                        <div className="latest-meta">
                          <span>{jobItem.location || '—'}</span>
                          <span>•</span>
                          <span>{jobItem.type}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}