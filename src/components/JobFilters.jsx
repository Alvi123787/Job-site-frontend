import React, { useState, useRef, useEffect } from 'react';
import './JobFilters.css';

const JobFilters = ({ onFilterChange, isOpen, onClose, maxSalary = 100000, variant = 'inline' }) => {
  const [filters, setFilters] = useState({
    jobType: [],
    experienceLevel: [],
    location: '',
    salaryRange: [0, maxSalary],
    remote: false,
    postedDate: ''
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
  // Removed: skills and company size options per request
  const postedDates = ['Any time', 'Last 24 hours', 'Last 3 days', 'Last week', 'Last month'];

  const handleFilterChange = (filterType, value) => {
    let updatedFilters = { ...filters };
    
    if (filterType === 'jobType' || filterType === 'experienceLevel') {
      const currentArray = [...filters[filterType]];
      const index = currentArray.indexOf(value);
      
      if (index > -1) {
        currentArray.splice(index, 1);
      } else {
        currentArray.push(value);
      }
      
      updatedFilters = { ...filters, [filterType]: currentArray };
    } else if (filterType === 'salaryRange') {
      updatedFilters = { ...filters, salaryRange: value };
    } else {
      updatedFilters = { ...filters, [filterType]: value };
    }
    
    setFilters(updatedFilters);
    if (typeof onFilterChange === 'function') {
      onFilterChange(updatedFilters);
    }
  };

  const handleSalaryChange = (index, value) => {
    const cap = Number(maxSalary) || 100000;
    const v = Math.min(Math.max(parseInt(value), 0), cap);
    const newSalaryRange = [...filters.salaryRange];
    newSalaryRange[index] = v;
    handleFilterChange('salaryRange', newSalaryRange);
  };

  // Sync default salary range when maxSalary changes
  useEffect(() => {
    setFilters(f => ({ ...f, salaryRange: [0, Number(maxSalary) || 100000] }));
  }, [maxSalary]);

  const clearAllFilters = () => {
    const resetFilters = {
      jobType: [],
      experienceLevel: [],
      location: '',
      salaryRange: [0, Number(maxSalary) || 100000],
      remote: false,
      postedDate: ''
    };
    
    setFilters(resetFilters);
    if (typeof onFilterChange === 'function') {
      onFilterChange(resetFilters);
    }
  };

  // Count active filters for badge
  const activeFiltersCount = () => {
    let count = 0;
    if (filters.jobType.length > 0) count += filters.jobType.length;
    if (filters.experienceLevel.length > 0) count += filters.experienceLevel.length;
    if (filters.location) count++;
    if (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 100000) count++;
    if (filters.remote) count++;
    if (filters.postedDate && filters.postedDate !== 'Any time') count++;
    return count;
  };

  return (
    <div className={`filter-sidebar ${variant === 'overlay' ? 'overlay' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="filter-header">
        <div className="filter-title">
          <h2>Filters</h2>
          {activeFiltersCount() > 0 && (
            <span className="filter-badge">{activeFiltersCount()}</span>
          )}
        </div>
        <button className="close-btn" onClick={typeof onClose === 'function' ? onClose : undefined}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="filter-content">
        {/* Job Type Filter */}
        <div className="filter-section">
          <div className="section-header">
            <h3>Job Type</h3>
            {filters.jobType.length > 0 && (
              <button 
                className="clear-section"
                onClick={() => handleFilterChange('jobType', [])}
              >
                Clear
              </button>
            )}
          </div>
          <div className="filter-options">
            {jobTypes.map(type => (
              <div key={type} className="checkbox-option">
                <div className="custom-checkbox">
                  <input
                    type="checkbox"
                    id={`jobType-${type}`}
                    checked={filters.jobType.includes(type)}
                    onChange={() => handleFilterChange('jobType', type)}
                  />
                  <span className="checkmark"></span>
                </div>
                <label htmlFor={`jobType-${type}`}>{type}</label>
              </div>
            ))}
            {/* Move Remote Only under Job Type */}
            <div className="checkbox-option remote-option">
              <div className="custom-checkbox">
                <input
                  type="checkbox"
                  id="remote-only"
                  checked={filters.remote}
                  onChange={() => handleFilterChange('remote', !filters.remote)}
                />
                <span className="checkmark"></span>
              </div>
              <label htmlFor="remote-only">Remote Only</label>
            </div>
          </div>
        </div>
        
        {/* Experience Level Filter */}
        <div className="filter-section">
          <div className="section-header">
            <h3>Experience Level</h3>
            {filters.experienceLevel.length > 0 && (
              <button 
                className="clear-section"
                onClick={() => handleFilterChange('experienceLevel', [])}
              >
                Clear
              </button>
            )}
          </div>
          <div className="filter-options">
            {experienceLevels.map(level => (
              <div key={level} className="checkbox-option">
                <div className="custom-checkbox">
                  <input
                    type="checkbox"
                    id={`exp-${level}`}
                    checked={filters.experienceLevel.includes(level)}
                    onChange={() => handleFilterChange('experienceLevel', level)}
                  />
                  <span className="checkmark"></span>
                </div>
                <label htmlFor={`exp-${level}`}>{level}</label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Location Filter */}
        <div className="filter-section">
          <h3>Location</h3>
          <div className="input-group">
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>
        </div>
        
        {/* Salary Range Filter */}
        <div className="filter-section">
          <div className="section-header">
            <h3>Salary Range</h3>
            {(filters.salaryRange[0] > 0 || filters.salaryRange[1] < (Number(maxSalary) || 100000)) && (
              <button 
                className="clear-section"
                onClick={() => handleFilterChange('salaryRange', [0, Number(maxSalary) || 100000])}
              >
                Reset
              </button>
            )}
          </div>
          <div className="salary-range">
            <div className="salary-inputs">
              <div className="input-group">
                <div className="input-icon">
                  <span>$</span>
                </div>
                <input
                  type="number"
                  value={filters.salaryRange[0]}
                  max={Number(maxSalary) || 100000}
                  min={0}
                  onChange={(e) => handleSalaryChange(0, e.target.value)}
                />
              </div>
              <span className="range-separator">to</span>
              <div className="input-group">
                <div className="input-icon">
                  <span>$</span>
                </div>
                <input
                  type="number"
                  value={filters.salaryRange[1]}
                  max={Number(maxSalary) || 100000}
                  min={0}
                  onChange={(e) => handleSalaryChange(1, e.target.value)}
                />
              </div>
            </div>
            <div className="range-slider-container">
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max={Number(maxSalary) || 100000}
                  step="1000"
                  value={filters.salaryRange[0]}
                  onChange={(e) => handleSalaryChange(0, e.target.value)}
                  className="range-min"
                />
                <input
                  type="range"
                  min="0"
                  max={Number(maxSalary) || 100000}
                  step="1000"
                  value={filters.salaryRange[1]}
                  onChange={(e) => handleSalaryChange(1, e.target.value)}
                  className="range-max"
                />
                <div className="slider-track">
                  <div 
                    className="slider-range" 
                    style={{
                      left: `${(filters.salaryRange[0] / (Number(maxSalary) || 100000)) * 100}%`,
                      width: `${((filters.salaryRange[1] - filters.salaryRange[0]) / (Number(maxSalary) || 100000)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skills and Company Size sections removed as requested */}
        
        {/* Posted Date Filter */}
        <div className="filter-section">
          <h3>Posted Date</h3>
          <div className="select-group">
            <select
              value={filters.postedDate}
              onChange={(e) => handleFilterChange('postedDate', e.target.value)}
            >
              {postedDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Clear Filters Button */}
        <div className="filter-actions">
          <button className="clear-filters" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;