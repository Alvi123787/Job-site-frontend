import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import './JobCard.css';
import { saveJob, removeJob, isJobSaved, fetchSavedItems } from '../utils/saved';
 

const JobCard = ({ job }) => {
    // Early return if job is undefined
    if (!job) {
        return <div className="job-card-square job-card-skeleton">Loading...</div>;
    }

    // Prefer explicit logo fields across sources (API/local drafts)
    const rawLogo = job.logo || job.companyLogo || job.raw?.companyLogo || '/company-placeholder.svg';
    const isExternal = /^https?:\/\//i.test(String(rawLogo));
    const logoSrc = isExternal ? `https://job-site-backend-seven.vercel.app/api/assets/image-proxy?url=${encodeURIComponent(rawLogo)}` : rawLogo;

    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const id = job._id || job.id;
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                (async () => {
                    try {
                        const data = await fetchSavedItems();
                        const isSaved = Array.isArray(data.jobs) && data.jobs.some((j) => String((j._id||j.id)) === String(id));
                        setSaved(!!isSaved);
                    } catch (_) {
                        // fall back to local
                        setSaved(isJobSaved(id));
                    }
                })();
            } else {
                setSaved(isJobSaved(id));
            }
        } catch (_) {
            setSaved(false);
        }
    }, [id]);

    const postedRelative = useMemo(() => {
        try {
            const t = job.postedAt || new Date(job.postedDate || job.posted || Date.now()).getTime();
            const diffDays = Math.floor((Date.now() - Number(t)) / (1000 * 60 * 60 * 24));
            if (!Number.isFinite(diffDays) || diffDays < 0) return '';
            return diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } catch (_) { return ''; }
    }, [job.postedAt, job.postedDate, job.posted]);

    // Remote should be treated as work type, not as location
    const isRemote = !!job.remote || /remote/i.test(String(job.workType || job.workMode || ''));
    const isContract = String(job.type || '').toLowerCase().includes('contract');
    const applyBefore = useMemo(() => {
        try {
            const raw = job.endDate ?? job.raw?.endDate;
            if (!raw) return '';
            const d = typeof raw === 'number' ? new Date(raw) : new Date(raw);
            if (!d || isNaN(d.getTime())) return '';
            return d.toLocaleDateString();
        } catch (_) { return ''; }
    }, [job.endDate, job.raw]);

    return (
        <div className="job-card-square job-card-minimal">
            {/* Header */}
            <div className="card-header">
                <img
                  className="company-logo-avatar"
                  src={logoSrc}
                  alt={`${job.company || 'Company'} logo`}
                  onError={(e) => { e.currentTarget.src = '/company-placeholder.svg'; }}
                />
                <div className="header-right">
                    <button className={`save-toggle ${saved ? 'saved' : ''}`} disabled={saving} onClick={async () => {
                        if (!id) return;
                        const token = localStorage.getItem('auth_token');
                        if (!token) {
                            navigate('/login');
                            return;
                        }
                        try {
                            setSaving(true);
                            if (saved) {
                                await removeJob(id);
                                setSaved(false);
                            } else {
                                // persist minimal card snapshot for local fallback
                                await saveJob({ id, _id: id, title: job.title, company: job.company, location: job.location, salary: job.salary });
                                setSaved(true);
                            }
                        } catch (err) {
                            console.warn('save toggle failed', err);
                        } finally {
                            setSaving(false);
                        }
                    }} aria-label={saved ? 'Saved' : 'Save'}>
                        {saved ? <FaBookmark /> : <FaRegBookmark />}
                        <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="card-content">
                <div className="title-block">
                    <div className="company-row">
                        <span className="company-name-pro">{job.company || 'Company Name'}</span>
                        {postedRelative && <span className="posted-inline">{postedRelative}</span>}
                    </div>
                    <h3 className="job-title-pro">{job.title || 'Job Title'}</h3>
                </div>
                <div className="meta-chips">
                    <span className="chip">
                        <FaMapMarkerAlt className="chip-icon" />
                        {job.location || 'Location'}
                    </span>
                    {isRemote && (<span className="chip">Remote</span>)}
                    {isContract && (<span className="chip">Contract</span>)}
                    {job.salary && (
                        <span className="chip">
                            <FaDollarSign className="chip-icon" />
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(job.salary)}
                        </span>
                    )}
                </div>

                <div className="card-divider" />
                <div className="card-bottom">
                    <div className="salary-block">
                        {job.salary ? (
                            <div className="salary-text">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(job.salary)}</div>
                        ) : (
                            <div className="salary-text">—</div>
                        )}
                        <div className="bottom-location">{job.location || 'Location'}</div>
                        {applyBefore && <div className="apply-before">Apply before: {applyBefore}</div>}
                    </div>
                    {job.id ? (
                        <Link to={`/jobs/${job.id}`} className="detail-btn-black">View Detail</Link>
                    ) : (
                        <span className="detail-btn-black disabled">View Detail</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export const JobCards = () => {
  return null;
};
export default JobCard;