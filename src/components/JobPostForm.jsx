import React, { useEffect, useMemo, useState } from 'react';
 
import './JobPostForm.css';
import { COUNTRIES } from '../data/countries';
import { CATEGORIES } from '../data/categories';

const jobPostInitialState = () => ({
  // 1. Basic Job Information
  title: '',
  company: '',
  companyLogo: '', // data URL
  category: CATEGORIES[0]?.name || 'Software Development',
  jobType: 'Full-Time',
  workMode: 'On-site',
  featured: false,
  // 2. Location & Global Reach
  country: 'United States',
  city: '',
  state: '',
  remote: false,
  address: '',
  // 3. Job Details
  shortDescription: '',
  longDescription: '',
  skills: [], // tags
  experience: '0–1 year',
  education: 'Bachelor’s',
  employmentLevel: 'Entry',
  // 4. Salary & Benefits
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  salaryPer: 'Year',
  benefits: '',
  // 5. Timeline
  deadline: '',
  postingDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  // 6. Application Details
  apply: '',
  website: '',
  // 7. Tags / Keywords
  tags: [],
});

const jobPostCurrencies = ['USD','GBP','EUR','PKR','INR','AUD','CAD','JPY'];
const jobPostJobTypes = ['Full-Time','Part-Time','Remote','Internship','Contract'];
const jobPostWorkModes = ['On-site','Hybrid','Remote'];
const jobPostExperiences = ['0–1 year','1–3 years','3–5 years','5+ years'];
const jobPostEducations = ['Bachelor’s','Master’s','Diploma','PhD','Other'];
const jobPostLevels = ['Entry','Mid','Senior','Executive'];

const JobPostTagInput = ({ value = [], onChange }) => {
  const [jobPostTagInput, setJobPostTagInput] = useState('');
  const addJobPostTag = (tag) => {
    const t = tag.trim();
    if (!t) return;
    const next = Array.from(new Set([...(value || []), t]));
    onChange(next);
  };
  return (
    <div className="job-post-tags-input" aria-label="Tags input">
      {(value || []).map((t) => (
        <span key={t} className="job-post-tag-chip">{t}</span>
      ))}
      <input
        placeholder="Add tags, press Enter"
        value={jobPostTagInput}
        onChange={(e) => setJobPostTagInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addJobPostTag(jobPostTagInput);
            setJobPostTagInput('');
          }
        }}
      />
    </div>
  );
};

const JobPostSkillsInput = ({ value = [], onChange }) => {
  const [jobPostSkillInput, setJobPostSkillInput] = useState('');
  const addJobPostSkill = (skill) => {
    const s = skill.trim();
    if (!s) return;
    const next = Array.from(new Set([...(value || []), s]));
    onChange(next);
  };
  return (
    <div className="job-post-tags-input" aria-label="Skills input">
      {(value || []).map((s) => (
        <span key={s} className="job-post-tag-chip">{s}</span>
      ))}
      <input
        placeholder="Add skills, press Enter (e.g., React)"
        value={jobPostSkillInput}
        onChange={(e) => setJobPostSkillInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addJobPostSkill(jobPostSkillInput);
            setJobPostSkillInput('');
          }
        }}
      />
    </div>
  );
};

const JobPostForm = ({ onPublished }) => {
  const [jobPostForm, setJobPostForm] = useState(jobPostInitialState);
  const [jobPostStatus, setJobPostStatus] = useState({ loading: false, message: '' });
  const [jobPostEditingId, setJobPostEditingId] = useState('');
  const [categoryImageBase64, setCategoryImageBase64] = useState('');

  useEffect(() => {
    // Load draft if exists
    const raw = localStorage.getItem('job_form_draft');
    if (raw) {
      try { setJobPostForm(JSON.parse(raw)); } catch { void 0; }
    }
    const editId = localStorage.getItem('edit_job_id');
    if (editId) {
      setJobPostEditingId(editId);
      (async () => {
        try {
          setJobPostStatus({ loading: true, message: '' });
          const resp = await fetch(`https://job-site-backend-seven.vercel.app/api/jobs/${editId}`);
          const job = await resp.json();
          if (!resp.ok) throw new Error(job?.error || 'Failed to load job');
          const toDateInput = (v) => v ? new Date(v).toISOString().slice(0,10) : '';
          setJobPostForm(prev => ({
            ...prev,
            title: job.title || '',
            company: job.company || '',
            companyLogo: job.companyLogo || '',
            category: job.category || prev.category,
            jobType: job.jobType || prev.jobType,
            workMode: job.workMode || prev.workMode,
            featured: !!job.featured,
            country: job.country || prev.country,
            city: job.city || '',
            state: job.state || '',
            address: job.address || '',
            remote: !!job.remote,
            shortDescription: job.shortDescription || '',
            longDescription: job.longDescription || '',
            skills: Array.isArray(job.skills) ? job.skills : [],
            experience: job.experience || prev.experience,
            education: job.education || prev.education,
            employmentLevel: job.employmentLevel || prev.employmentLevel,
            salaryMin: job.salaryMin ?? '',
            salaryMax: job.salaryMax ?? '',
            currency: job.currency || prev.currency,
            salaryPer: job.salaryPer || prev.salaryPer,
            benefits: job.benefits || '',
            deadline: toDateInput(job.deadline),
            postingDate: toDateInput(job.postingDate) || prev.postingDate,
            endDate: toDateInput(job.endDate),
            apply: job.apply || '',
            website: job.website || '',
            tags: Array.isArray(job.tags) ? job.tags : [],
          }));
          setJobPostStatus({ loading: false, message: 'Loaded job for editing.' });
        } catch (e) {
          setJobPostStatus({ loading: false, message: e.message || 'Failed to load job' });
        }
      })();
    }
  }, []);

  const jobPostCategoryMatch = useMemo(() => {
    const name = (jobPostForm.category || '').trim().toLowerCase();
    return CATEGORIES.find(c => c.name.toLowerCase() === name);
  }, [jobPostForm.category]);

  const handleJobPostChange = (key, value) => {
    setJobPostForm(prev => {
      const next = { ...prev, [key]: value };
      // If Work Mode is set to Remote, ensure remote flag is true; otherwise false
      if (key === 'workMode') {
        next.remote = String(value).toLowerCase() === 'remote';
      }
      return next;
    });
  };

  const handleJobPostLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleJobPostChange('companyLogo', reader.result);
    reader.readAsDataURL(file);
  };

  const handleCategoryImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCategoryImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const validateJobPost = () => {
    const required = ['title','company','jobType','workMode','country','shortDescription','longDescription','experience','employmentLevel','apply'];
    for (const key of required) {
      if (!jobPostForm[key] || (typeof jobPostForm[key] === 'string' && !jobPostForm[key].trim())) return `${key} is required`;
    }
    // Always require city/state so Location shows even for remote roles
    if (!jobPostForm.city?.trim()) return 'City is required';
    if (!jobPostForm.state?.trim()) return 'State/Region is required';
    // End date must be provided and in the future
    if (!String(jobPostForm.endDate || '').trim()) return 'End Date of Job is required';
    const endTs = Date.parse(jobPostForm.endDate);
    if (!Number.isFinite(endTs)) return 'End Date of Job is invalid';
    if (endTs < Date.now()) return 'End Date must be a future date';
    if (categoryImageBase64 && !String(jobPostForm.category || '').trim()) return 'Category Name is required when uploading an image';
    return '';
  };

  const toJobPostRecord = (status) => {
    const id = `${Date.now()}`;
    // Location should always show city/state/country even for remote roles
    const location = `${jobPostForm.city}${jobPostForm.state ? ', ' + jobPostForm.state : ''}, ${jobPostForm.country}`;
    const postedDate = jobPostForm.postingDate;
    const salaryNum = Number(jobPostForm.salaryMax || jobPostForm.salaryMin || 0);
    return {
      id,
      title: jobPostForm.title,
      company: jobPostForm.company,
      location,
      type: jobPostForm.jobType,
      postedDate,
      postedDaysAgo: 0,
      isNew: true,
      featured: jobPostForm.featured,
      salary: salaryNum,
      category: jobPostForm.category?.trim() || 'General',
      accentColor: jobPostCategoryMatch?.color || '#3B82F6',
      brandIcon: 'bullseye',
      status,
      raw: jobPostForm,
    };
  };

  const publishJobPost = async () => {
    const err = validateJobPost();
    if (err) { setJobPostStatus({ loading: false, message: err }); return; }
    setJobPostStatus({ loading: true, message: '' });
    let backendSaved = null;
    try {
      if (categoryImageBase64 && String(jobPostForm.category || '').trim()) {
        const catResp = await fetch('https://job-site-backend-seven.vercel.app/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: jobPostForm.category.trim(), imageUrl: categoryImageBase64 }),
        });
        const catJson = await catResp.json().catch(() => ({}));
        if (!catResp.ok) throw new Error(catJson?.error || 'Failed to save category');
      }
    } catch (e) {
      setJobPostStatus({ loading: false, message: e.message || 'Category save error' });
      return;
    }
    try {
      const method = jobPostEditingId ? 'PUT' : 'POST';
      const url = jobPostEditingId ? `https://job-site-backend-seven.vercel.app/api/jobs/${jobPostEditingId}` : `https://job-site-backend-seven.vercel.app/api/jobs`;
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...jobPostForm, salaryMin: jobPostForm.salaryMin || undefined, salaryMax: jobPostForm.salaryMax || undefined }),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        let msg = jobPostEditingId ? 'Failed to update job' : 'Failed to publish to server';
        throw new Error(json?.error || msg);
      }
      backendSaved = json;
    } catch (e) {
      console.warn('Backend operation failed:', e.message);
      setJobPostStatus({ loading: false, message: e.message || 'Server error' });
      return;
    }

    try { localStorage.removeItem('job_form_draft'); } catch { void 0; }
    if (jobPostEditingId) {
      setJobPostStatus({ loading: false, message: 'Job updated successfully.' });
      try { localStorage.removeItem('edit_job_id'); } catch { void 0; }
    } else {
      // Keep localStorage insert for Jobs page continuity
      const record = toJobPostRecord('published');
      if (backendSaved && backendSaved._id) record.id = backendSaved._id;
      const raw = localStorage.getItem('published_jobs');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(record);
      localStorage.setItem('published_jobs', JSON.stringify(list));
      setJobPostStatus({ loading: false, message: 'Job published to server and saved locally.' });
      if (typeof onPublished === 'function') onPublished(record);
      setJobPostForm(jobPostInitialState());
      setCategoryImageBase64('');
    }
  };

  const saveJobPostDraft = () => {
    localStorage.setItem('job_form_draft', JSON.stringify(jobPostForm));
    setJobPostStatus({ loading: false, message: 'Draft saved locally.' });
  };

  const resetJobPostForm = () => { 
    setJobPostForm(jobPostInitialState()); 
    setJobPostStatus({ loading: false, message: '' }); 
  };

  return (
    <div className="job-post-form-wrap">
      <div className="job-post-form-card">
        <div className="job-post-form-header">
          <h2 className="job-post-form-title">Post a New Job</h2>
          <span className="job-post-inline-note">Visible globally on Jobs page upon publish</span>
        </div>

        {/* 1. Basic Job Information */}
        <div className="job-post-section">
          <div className="job-post-section-title">Basic Information</div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>Job Title</label>
              <input className="job-post-form-input" value={jobPostForm.title} onChange={(e) => handleJobPostChange('title', e.target.value)} placeholder="e.g., Full Stack Developer" />
            </div>
            <div className="job-post-form-field">
              <label>Company Name</label>
              <input className="job-post-form-input" value={jobPostForm.company} onChange={(e) => handleJobPostChange('company', e.target.value)} placeholder="Company Inc." />
            </div>
          </div>
          <div className="job-post-grid-3">
            <div className="job-post-form-field">
              <label>Company Logo (optional)</label>
              <div className="job-post-inline-fields">
                <input type="file" accept="image/*" onChange={(e) => handleJobPostLogoUpload(e.target.files?.[0])} />
                {jobPostForm.companyLogo && <img src={jobPostForm.companyLogo} alt="Logo preview" className="job-post-logo-preview" />}
              </div>
              <span className="job-post-help">Upload a square logo for best results</span>
            </div>
            <div className="job-post-form-field">
              <label>Job Category</label>
              <input className="job-post-form-input" value={jobPostForm.category} onChange={(e) => handleJobPostChange('category', e.target.value)} placeholder="e.g., Software Development" />
            </div>
            <div className="job-post-form-field">
              <label>Job Type</label>
              <select className="job-post-form-select" value={jobPostForm.jobType} onChange={(e) => handleJobPostChange('jobType', e.target.value)}>
                {jobPostJobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="job-post-grid-3">
            <div className="job-post-form-field">
              <label>Work Mode</label>
              <select className="job-post-form-select" value={jobPostForm.workMode} onChange={(e) => handleJobPostChange('workMode', e.target.value)}>
                {jobPostWorkModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="job-post-form-field">
              <label>Featured Job</label>
              <label className="job-post-toggle-switch">
                <input type="checkbox" checked={jobPostForm.featured} onChange={(e) => handleJobPostChange('featured', e.target.checked)} />
                <span className="job-post-toggle-slider" />
                <span className="job-post-toggle-label">{jobPostForm.featured ? 'On' : 'Off'}</span>
              </label>
              <span className="job-post-help">When ON, this job is marked as featured.</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="job-post-section">
          <div className="job-post-section-title">Category</div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>Category Name</label>
              <input className="job-post-form-input" value={jobPostForm.category} onChange={(e) => handleJobPostChange('category', e.target.value)} placeholder="e.g., Software Development" />
            </div>
            <div className="job-post-form-field">
              <label>Category Image</label>
              <div className="job-post-inline-fields">
                <input type="file" accept="image/*" onChange={(e) => handleCategoryImageUpload(e.target.files?.[0])} />
                {categoryImageBase64 && <img src={categoryImageBase64} alt="Category preview" className="job-post-logo-preview" />}
              </div>
              <span className="job-post-help">Upload a square image for best results</span>
            </div>
          </div>
        </div>

        {/* 2. Location & Global Reach */}
        <div className="job-post-section">
          <div className="job-post-section-title">Location & Global Reach</div>
          <div className="job-post-grid-3">
            <div className="job-post-form-field">
              <label>Country</label>
              <select className="job-post-form-select" value={jobPostForm.country} onChange={(e) => handleJobPostChange('country', e.target.value)}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {!jobPostForm.remote && (
              <>
                <div className="job-post-form-field">
                  <label>City</label>
                  <input className="job-post-form-input" value={jobPostForm.city} onChange={(e) => handleJobPostChange('city', e.target.value)} placeholder="e.g., New York" />
                </div>
                <div className="job-post-form-field">
                  <label>State / Region</label>
                  <input className="job-post-form-input" value={jobPostForm.state} onChange={(e) => handleJobPostChange('state', e.target.value)} placeholder="e.g., NY" />
                </div>
              </>
            )}
          </div>
          <div className="job-post-form-field">
            <label>Office Address (optional)</label>
            <input className="job-post-form-input" value={jobPostForm.address} onChange={(e) => handleJobPostChange('address', e.target.value)} placeholder="Street, Building, etc." />
          </div>
        </div>

        {/* 3. Job Details */}
        <div className="job-post-section">
          <div className="job-post-section-title">Job Details</div>
          <div className="job-post-form-field">
            <label>Short Description</label>
            <textarea className="job-post-form-textarea" value={jobPostForm.shortDescription} onChange={(e) => handleJobPostChange('shortDescription', e.target.value)} placeholder="One or two lines summarizing the role." />
          </div>
          <div className="job-post-form-field">
            <label>Long Description</label>
            <textarea className="job-post-form-textarea" value={jobPostForm.longDescription} onChange={(e) => handleJobPostChange('longDescription', e.target.value)} placeholder="Detailed responsibilities, team, culture, stack, and expectations." />
          </div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>Required Skills</label>
              <JobPostSkillsInput value={jobPostForm.skills} onChange={(v) => handleJobPostChange('skills', v)} />
            </div>
            <div className="job-post-form-field">
              <label>Experience Required</label>
              <select className="job-post-form-select" value={jobPostForm.experience} onChange={(e) => handleJobPostChange('experience', e.target.value)}>
                {jobPostExperiences.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>Education Level</label>
              <select className="job-post-form-select" value={jobPostForm.education} onChange={(e) => handleJobPostChange('education', e.target.value)}>
                {jobPostEducations.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="job-post-form-field">
              <label>Employment Level</label>
              <select className="job-post-form-select" value={jobPostForm.employmentLevel} onChange={(e) => handleJobPostChange('employmentLevel', e.target.value)}>
                {jobPostLevels.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Salary & Benefits */}
        <div className="job-post-section">
          <div className="job-post-section-title">Salary & Benefits</div>
          <div className="job-post-grid-3">
            <div className="job-post-form-field">
              <label>Salary Min</label>
              <input className="job-post-form-input" type="number" value={jobPostForm.salaryMin} onChange={(e) => handleJobPostChange('salaryMin', e.target.value)} placeholder="e.g., 60000" />
            </div>
            <div className="job-post-form-field">
              <label>Salary Max</label>
              <input className="job-post-form-input" type="number" value={jobPostForm.salaryMax} onChange={(e) => handleJobPostChange('salaryMax', e.target.value)} placeholder="e.g., 90000" />
            </div>
            <div className="job-post-form-field">
              <label>Currency</label>
              <select className="job-post-form-select" value={jobPostForm.currency} onChange={(e) => handleJobPostChange('currency', e.target.value)}>
                {jobPostCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>Per</label>
              <select className="job-post-form-select" value={jobPostForm.salaryPer} onChange={(e) => handleJobPostChange('salaryPer', e.target.value)}>
                {['Month','Year','Hour'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="job-post-form-field">
              <label>Additional Benefits</label>
              <textarea className="job-post-form-textarea" value={jobPostForm.benefits} onChange={(e) => handleJobPostChange('benefits', e.target.value)} placeholder="Healthcare, remote allowance, etc." />
            </div>
          </div>
        </div>

        {/* 5. Timeline */}
        <div className="job-post-section">
          <div className="job-post-section-title">Timeline</div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>Application Deadline</label>
              <input className="job-post-form-input" type="date" value={jobPostForm.deadline} onChange={(e) => handleJobPostChange('deadline', e.target.value)} />
            </div>
            <div className="job-post-form-field">
              <label>Posting Date</label>
              <input className="job-post-form-input" type="date" value={jobPostForm.postingDate} onChange={(e) => handleJobPostChange('postingDate', e.target.value)} />
              <span className="job-post-help">Auto-filled with current date</span>
            </div>
          </div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>End Date of Job</label>
              <input className="job-post-form-input" type="date" value={jobPostForm.endDate} onChange={(e) => handleJobPostChange('endDate', e.target.value)} />
              <span className="job-post-help">After this date, the job will expire automatically.</span>
            </div>
          </div>
        </div>

        {/* 6. Application Details */}
        <div className="job-post-section">
          <div className="job-post-section-title">Application Details</div>
          <div className="job-post-grid-2">
            <div className="job-post-form-field">
              <label>Apply Link or Email</label>
              <input className="job-post-form-input" value={jobPostForm.apply} onChange={(e) => handleJobPostChange('apply', e.target.value)} placeholder="https://company.com/apply or jobs@company.com" />
            </div>
            <div className="job-post-form-field">
              <label>Company Website (optional)</label>
              <input className="job-post-form-input" value={jobPostForm.website} onChange={(e) => handleJobPostChange('website', e.target.value)} placeholder="https://company.com" />
            </div>
          </div>
        </div>

        {/* 7. Tags / Keywords */}
        <div className="job-post-section">
          <div className="job-post-section-title">Tags / Keywords</div>
          <JobPostTagInput value={jobPostForm.tags} onChange={(v) => handleJobPostChange('tags', v)} />
        </div>

        {/* 9. Buttons */}
        <div className="job-post-actions">
          <button className="job-post-btn job-post-btn-primary" onClick={publishJobPost} disabled={jobPostStatus.loading}>Submit / Publish Job</button>
          <button className="job-post-btn" onClick={saveJobPostDraft} disabled={jobPostStatus.loading}>Save as Draft</button>
          <button className="job-post-btn job-post-btn-muted" onClick={resetJobPostForm} disabled={jobPostStatus.loading}>Reset Form</button>
        </div>

        {jobPostStatus.message && (
          <p className="job-post-help" role="status" style={{ marginTop: '0.5rem' }}>{jobPostStatus.message}</p>
        )}
      </div>
    </div>
  );
};

export default JobPostForm;
