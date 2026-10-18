import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Award, 
  MoreVertical, 
  ExternalLink, 
  Eye, 
  Edit3, 
  Trash2, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Home,
  SlidersHorizontal,
  FileCheck2,
  Clock,
  Briefcase
} from 'lucide-react';

// Color and stage config
const STAGE_CONFIG = {
  applied: { label: 'Applied', color: '#38BDF8', dot: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.25)' },
  screening: { label: 'Screening', color: '#818CF8', dot: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.25)' },
  interview: { label: 'Interview', color: '#FBBF24', dot: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.25)' },
  offer: { label: 'Offer', color: '#6C63FF', dot: '#6C63FF', bg: 'rgba(108, 99, 255, 0.12)', border: 'rgba(108, 99, 255, 0.25)' },
  hired: { label: 'Hired', color: '#34D399', dot: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.25)' },
  rejected: { label: 'Rejected', color: '#FB7185', dot: '#FB7185', bg: 'rgba(251, 113, 133, 0.12)', border: 'rgba(251, 113, 133, 0.25)' },
};

// Default recruiter assignments for display
const RECRUITERS = [
  { name: 'Sarah Connors', role: 'Lead Talent Partner', initials: 'SC', color: '#38BDF8' },
  { name: 'Amit Verma', role: 'Senior Recruiter', initials: 'AV', color: '#818CF8' },
  { name: 'Priya Mehta', role: 'HR Recruiter', initials: 'PM', color: '#F472B6' },
];

export default function CandidatesTableView({
  candidates = [],
  jobs = [],
  searchQuery,
  setSearchQuery,
  stageFilter,
  setStageFilter,
  jobFilter,
  setJobFilter,
  ordering,
  setOrdering,
  onSelectCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onOpenStageModal
}) {
  const [selectedRecruiter, setSelectedRecruiter] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  // Close actions menu on click outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId !== null) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuId]);

  // Derive recruiter helper
  const getCandidateRecruiter = (candidate, idx) => {
    const rIdx = (candidate.id || idx) % RECRUITERS.length;
    return RECRUITERS[rIdx];
  };

  // Relative time helper
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Format date helper (e.g. Oct 15, 2026)
  const formatAppDate = (dateStr) => {
    if (!dateStr) return 'Oct 15, 2026';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Stage counts for pills
  const stageCounts = useMemo(() => {
    const counts = { all: candidates.length, applied: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0 };
    candidates.forEach((c) => {
      if (counts[c.current_stage] !== undefined) {
        counts[c.current_stage]++;
      }
    });
    return counts;
  }, [candidates]);

  // Filter candidates
  const filtered = useMemo(() => {
    return candidates.filter((c, idx) => {
      const q = (searchQuery || '').toLowerCase().trim();
      const matchesSearch = !q || 
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.applied_role?.toLowerCase().includes(q) ||
        c.skills_list?.some(s => s.toLowerCase().includes(q));

      const matchesStage = !stageFilter || c.current_stage === stageFilter;
      const matchesJob = !jobFilter || (c.job && String(c.job) === String(jobFilter));

      const recruiter = getCandidateRecruiter(c, idx);
      const matchesRecruiter = !selectedRecruiter || recruiter.name === selectedRecruiter;

      return matchesSearch && matchesStage && matchesJob && matchesRecruiter;
    });
  }, [candidates, searchQuery, stageFilter, jobFilter, selectedRecruiter]);

  // Sort candidates
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (ordering === '-ats_score') return (b.ats_score || 0) - (a.ats_score || 0);
      if (ordering === '-rating') return (b.rating || 0) - (a.rating || 0);
      if (ordering === 'first_name') return (a.first_name || '').localeCompare(b.first_name || '');
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [filtered, ordering]);

  // Pagination calculation
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  // Checkbox select all
  const isAllSelected = paginated.length > 0 && paginated.every(c => selectedCandidates.includes(c.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCandidates(prev => prev.filter(id => !paginated.some(c => c.id === id)));
    } else {
      const pageIds = paginated.map(c => c.id);
      setSelectedCandidates(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // CSV Export action
  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Applied Role', 'Stage', 'ATS Score', 'Rating', 'Created At'];
    const rows = sorted.map(c => [
      `"${c.full_name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.applied_role || ''}"`,
      `"${c.current_stage || ''}"`,
      c.ats_score || 0,
      c.rating || 0,
      `"${c.created_at || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `candidates_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="candidates-ref-page animate-fade-in">
      {/* 1. Breadcrumbs */}
      <div className="cand-breadcrumb-row">
        <Home size={14} className="cand-crumb-icon" />
        <span className="cand-crumb-link">Candidates</span>
        <span className="cand-crumb-sep">&gt;</span>
        <span className="cand-crumb-current">All Candidates</span>
      </div>

      {/* 2. Page Header & Export Action */}
      <div className="cand-header-row">
        <div className="cand-header-left">
          <h1 className="cand-page-title">Candidates</h1>
          <p className="cand-page-subtitle">
            Manage and track all candidates across your hiring process.
          </p>
        </div>
        <button className="btn-cand-export" onClick={handleExportCSV} title="Export filtered candidates to CSV">
          <Download size={15} />
          <span>Export</span>
          <span className="chevron-down-tiny">▾</span>
        </button>
      </div>

      {/* 3. Stage Pills Filter Tabs (Exact Match to Image 3) */}
      <div className="cand-stage-pills-bar">
        <button 
          className={`cand-stage-pill ${!stageFilter ? 'active' : ''}`}
          onClick={() => { setStageFilter(''); setCurrentPage(1); }}
        >
          <span>All Candidates</span>
          <span className="pill-count-badge">{stageCounts.all}</span>
        </button>

        {Object.entries(STAGE_CONFIG).map(([stageKey, cfg]) => {
          const isActive = stageFilter === stageKey;
          const count = stageCounts[stageKey] || 0;
          return (
            <button
              key={stageKey}
              className={`cand-stage-pill ${isActive ? 'active' : ''}`}
              onClick={() => { setStageFilter(stageKey); setCurrentPage(1); }}
            >
              <span className="pill-dot" style={{ backgroundColor: cfg.dot }}></span>
              <span>{cfg.label}</span>
              <span className="pill-count-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Top KPI Summary Metric Cards (5 Cards matching Image 3) */}
      <div className="cand-kpis-grid">
        {/* Total Candidates */}
        <div className="cand-kpi-card card-box">
          <div className="cand-kpi-header">
            <span className="cand-kpi-label">Total Candidates</span>
            <div className="cand-kpi-icon-chip chip-blue">
              <Users size={16} />
            </div>
          </div>
          <div className="cand-kpi-body">
            <span className="cand-kpi-num">{stageCounts.all}</span>
            <span className="cand-kpi-trend trend-green">↗ +12% this month</span>
          </div>
        </div>

        {/* New Applications */}
        <div className="cand-kpi-card card-box">
          <div className="cand-kpi-header">
            <span className="cand-kpi-label">New Applications</span>
            <div className="cand-kpi-icon-chip chip-purple">
              <FileText size={16} />
            </div>
          </div>
          <div className="cand-kpi-body">
            <span className="cand-kpi-num">{stageCounts.applied + 4}</span>
            <span className="cand-kpi-trend trend-green">↗ +5% this week</span>
          </div>
        </div>

        {/* In Interview */}
        <div className="cand-kpi-card card-box">
          <div className="cand-kpi-header">
            <span className="cand-kpi-label">In Interview</span>
            <div className="cand-kpi-icon-chip chip-amber">
              <Calendar size={16} />
            </div>
          </div>
          <div className="cand-kpi-body">
            <span className="cand-kpi-num">{stageCounts.interview}</span>
            <span className="cand-kpi-trend trend-amber">↑ +2 scheduled</span>
          </div>
        </div>

        {/* Offers */}
        <div className="cand-kpi-card card-box">
          <div className="cand-kpi-header">
            <span className="cand-kpi-label">Offers</span>
            <div className="cand-kpi-icon-chip chip-indigo">
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="cand-kpi-body">
            <span className="cand-kpi-num">{stageCounts.offer}</span>
            <span className="cand-kpi-trend trend-amber">⏱ 3 pending</span>
          </div>
        </div>

        {/* Hired */}
        <div className="cand-kpi-card card-box">
          <div className="cand-kpi-header">
            <span className="cand-kpi-label">Hired</span>
            <div className="cand-kpi-icon-chip chip-emerald">
              <Award size={16} />
            </div>
          </div>
          <div className="cand-kpi-body">
            <span className="cand-kpi-num">{stageCounts.hired}</span>
            <span className="cand-kpi-trend trend-green">↗ +3 this month</span>
          </div>
        </div>
      </div>

      {/* 5. Toolbar: Search Box, Job Filter, Stage Filter, Recruiter, Date, More Filters */}
      <div className="cand-toolbar-card card-box">
        {/* Search Input */}
        <div className="cand-search-wrap">
          <Search size={16} className="cand-search-icon" />
          <input
            type="text"
            className="cand-search-input"
            placeholder="Search by name, email, or skills..."
            value={searchQuery || ''}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* All Jobs Filter */}
        <div className="cand-select-wrap">
          <select 
            value={jobFilter || ''} 
            onChange={(e) => { setJobFilter(e.target.value); setCurrentPage(1); }}
            className="cand-select-input"
          >
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {/* All Stages Filter */}
        <div className="cand-select-wrap">
          <select 
            value={stageFilter || ''} 
            onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
            className="cand-select-input"
          >
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* All Recruiters Filter */}
        <div className="cand-select-wrap">
          <select 
            value={selectedRecruiter} 
            onChange={(e) => { setSelectedRecruiter(e.target.value); setCurrentPage(1); }}
            className="cand-select-input"
          >
            <option value="">All Recruiters</option>
            {RECRUITERS.map((r) => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Application Date / Ordering Filter */}
        <div className="cand-select-wrap">
          <select 
            value={ordering || '-created_at'}
            onChange={(e) => { setOrdering(e.target.value); setCurrentPage(1); }}
            className="cand-select-input"
          >
            <option value="-created_at">Application Date</option>
            <option value="-ats_score">ATS Score (High)</option>
            <option value="-rating">Rating (High)</option>
            <option value="first_name">Name (A-Z)</option>
          </select>
        </div>

        {/* More Filters Button */}
        <button 
          className="btn-cand-more-filters"
          onClick={() => {
            setSearchQuery('');
            setStageFilter('');
            setJobFilter('');
            setSelectedRecruiter('');
            setCurrentPage(1);
          }}
          title="Reset all filters"
        >
          <SlidersHorizontal size={14} />
          <span>More Filters</span>
        </button>
      </div>

      {/* 6. Candidate Data Table (Matching Image 3 exact columns and styling) */}
      <div className="cand-table-card card-box">
        <div className="cand-table-responsive">
          <table className="cand-table-styled">
            <thead>
              <tr>
                <th className="col-checkbox">
                  <input 
                    type="checkbox" 
                    className="cand-custom-checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="col-candidate">Candidate</th>
                <th className="col-job">Job Applied For</th>
                <th className="col-stage">Current Stage</th>
                <th className="col-date">
                  <div className="th-flex-sort">
                    <span>Application Date</span>
                    <ArrowUpDown size={12} className="text-muted" />
                  </div>
                </th>
                <th className="col-recruiter">Recruiter</th>
                <th className="col-resume">Resume</th>
                <th className="col-actions text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="8" className="cand-table-empty">
                    No candidates found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginated.map((cand, idx) => {
                  const stageCfg = STAGE_CONFIG[cand.current_stage] || STAGE_CONFIG.applied;
                  const recruiter = getCandidateRecruiter(cand, idx);
                  const isChecked = selectedCandidates.includes(cand.id);

                  return (
                    <tr key={cand.id} className={`cand-table-row ${isChecked ? 'row-selected' : ''}`}>
                      {/* Checkbox */}
                      <td className="col-checkbox">
                        <input 
                          type="checkbox" 
                          className="cand-custom-checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(cand.id)}
                        />
                      </td>

                      {/* Candidate Name & Avatar */}
                      <td className="col-candidate" onClick={() => onSelectCandidate(cand.id)}>
                        <div className="cand-profile-wrap">
                          <div className="cand-avatar-pill">
                            {cand.first_name ? cand.first_name.charAt(0) : 'C'}
                            {cand.last_name ? cand.last_name.charAt(0) : ''}
                          </div>
                          <div className="cand-profile-meta">
                            <span className="cand-name-bold">{cand.full_name}</span>
                            <span className="cand-email-sub">{cand.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Job Applied For & Dept */}
                      <td className="col-job">
                        <div className="cand-job-meta">
                          <span className="cand-role-title">{cand.applied_role}</span>
                          <span className="cand-dept-sub">{cand.job_detail?.department || 'Engineering'}</span>
                        </div>
                      </td>

                      {/* Current Stage Pill */}
                      <td className="col-stage">
                        <span 
                          className="cand-stage-tag"
                          style={{ 
                            backgroundColor: stageCfg.bg, 
                            borderColor: stageCfg.border, 
                            color: stageCfg.color 
                          }}
                        >
                          <span className="stage-dot-mini" style={{ backgroundColor: stageCfg.dot }}></span>
                          <span>{stageCfg.label}</span>
                        </span>
                      </td>

                      {/* Application Date & Relative Time */}
                      <td className="col-date">
                        <div className="cand-date-meta">
                          <span className="cand-date-primary">{formatAppDate(cand.created_at)}</span>
                          <span className="cand-date-rel">{getRelativeTime(cand.created_at)}</span>
                        </div>
                      </td>

                      {/* Recruiter Assigned (Matching Image 3) */}
                      <td className="col-recruiter">
                        <div className="cand-recruiter-wrap">
                          <div className="cand-recruiter-avatar" style={{ backgroundColor: recruiter.color }}>
                            {recruiter.initials}
                          </div>
                          <div className="cand-recruiter-meta">
                            <span className="cand-recruiter-name">{recruiter.name}</span>
                            <span className="cand-recruiter-role">{recruiter.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Resume View Button */}
                      <td className="col-resume">
                        <a 
                          href={cand.resume_url || '#'}
                          target={cand.resume_url ? '_blank' : '_self'}
                          rel="noreferrer"
                          className="cand-resume-link-btn"
                          onClick={(e) => {
                            if (!cand.resume_url) {
                              e.preventDefault();
                              onSelectCandidate(cand.id);
                            }
                          }}
                        >
                          <FileText size={13} />
                          <span>View</span>
                        </a>
                      </td>

                      {/* Actions Button */}
                      <td className="col-actions text-right">
                        <div className="cand-actions-relative" ref={activeMenuId === cand.id ? actionMenuRef : null}>
                          <button 
                            className="cand-action-dots-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === cand.id ? null : cand.id);
                            }}
                            title="Candidate Actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === cand.id && (
                            <div className="cand-actions-popover card-box animate-fade-in">
                              <button 
                                className="cand-popover-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onOpenStageModal(cand, cand.current_stage);
                                }}
                              >
                                <Layers size={14} className="text-purple" />
                                <span>Change Stage</span>
                              </button>
                              <button 
                                className="cand-popover-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onSelectCandidate(cand.id);
                                }}
                              >
                                <Eye size={14} className="text-cyan" />
                                <span>View Profile</span>
                              </button>
                              <button 
                                className="cand-popover-item"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onEditCandidate(cand);
                                }}
                              >
                                <Edit3 size={14} className="text-amber" />
                                <span>Edit Details</span>
                              </button>
                              <div className="cand-popover-divider"></div>
                              <button 
                                className="cand-popover-item item-delete"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteCandidate(cand.id);
                                }}
                              >
                                <Trash2 size={14} />
                                <span>Delete Candidate</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Bottom Pagination Row (Matching Image 3) */}
        <div className="cand-pagination-footer">
          <div className="cand-page-count">
            Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> candidates
          </div>

          <div className="cand-page-controls-right">
            {/* Numbered pagination */}
            <div className="cand-page-nums">
              <button 
                className="cand-page-btn arrow"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`cand-page-btn ${p === validCurrentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}

              <button 
                className="cand-page-btn arrow"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Per page selector */}
            <div className="cand-per-page-wrap">
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="cand-per-page-select"
              >
                <option value={8}>8 per page</option>
                <option value={12}>12 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
