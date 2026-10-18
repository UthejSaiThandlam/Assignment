import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Users, 
  Briefcase, 
  LayoutDashboard, 
  GitBranch, 
  Settings, 
  ArrowRight,
  Command,
  CornerDownLeft
} from 'lucide-react';

export default function SiteSearchModal({
  isOpen,
  onClose,
  candidates = [],
  jobs = [],
  onSelectCandidate,
  onNavigateTab
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search candidate matches
  const matchedCandidates = q ? candidates.filter(c => 
    c.full_name?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.applied_role?.toLowerCase().includes(q) ||
    c.current_stage?.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  // Search job matches
  const matchedJobs = q ? jobs.filter(j => 
    j.title?.toLowerCase().includes(q) ||
    j.department?.toLowerCase().includes(q) ||
    j.location?.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  // Quick navigation pages
  const pages = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, category: 'Page' },
    { id: 'pipeline', label: 'Hiring Pipeline', icon: GitBranch, category: 'Page' },
    { id: 'candidates', label: 'Candidates Directory', icon: Users, category: 'Page' },
    { id: 'jobs', label: 'Job Openings & Requisitions', icon: Briefcase, category: 'Page' },
    { id: 'settings', label: 'Recruiter Settings & ATS Config', icon: Settings, category: 'Page' },
  ];

  const matchedPages = pages.filter(p => !q || p.label.toLowerCase().includes(q));

  return (
    <div className="site-search-overlay animate-fade-in" onClick={onClose}>
      <div className="site-search-modal card-box" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="search-modal-header">
          <Search size={18} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search candidates, requisitions, or pages (press Esc to close)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button className="search-clear-btn" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          ) : (
            <div className="search-shortcut-badge">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results Container */}
        <div className="search-modal-results">
          {/* Candidates */}
          {matchedCandidates.length > 0 && (
            <div className="search-result-group">
              <span className="result-group-title">CANDIDATES</span>
              {matchedCandidates.map(c => (
                <div 
                  key={c.id} 
                  className="search-result-item"
                  onClick={() => {
                    onSelectCandidate(c.id);
                    onClose();
                  }}
                >
                  <div className="result-item-left">
                    <span className="result-avatar-mini">{c.first_name ? c.first_name.charAt(0) : 'C'}</span>
                    <div>
                      <strong className="result-name">{c.full_name}</strong>
                      <span className="result-subtext">{c.applied_role} • {c.email}</span>
                    </div>
                  </div>
                  <span className={`stage-tag-badge stage-${c.current_stage}`}>
                    {c.current_stage}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Job Openings */}
          {matchedJobs.length > 0 && (
            <div className="search-result-group">
              <span className="result-group-title">JOB OPENINGS</span>
              {matchedJobs.map(j => (
                <div 
                  key={j.id} 
                  className="search-result-item"
                  onClick={() => {
                    onNavigateTab('jobs');
                    onClose();
                  }}
                >
                  <div className="result-item-left">
                    <Briefcase size={16} className="text-purple" />
                    <div>
                      <strong className="result-name">{j.title}</strong>
                      <span className="result-subtext">{j.department} • {j.location}</span>
                    </div>
                  </div>
                  <span className={`status-pill pill-${j.status}`}>{j.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Pages */}
          <div className="search-result-group">
            <span className="result-group-title">NAVIGATION PAGES</span>
            {matchedPages.map(p => {
              const Icon = p.icon;
              return (
                <div 
                  key={p.id} 
                  className="search-result-item"
                  onClick={() => {
                    onNavigateTab(p.id);
                    onClose();
                  }}
                >
                  <div className="result-item-left">
                    <Icon size={16} className="text-cyan" />
                    <span className="result-name">{p.label}</span>
                  </div>
                  <CornerDownLeft size={13} className="text-muted" />
                </div>
              );
            })}
          </div>

          {q && matchedCandidates.length === 0 && matchedJobs.length === 0 && matchedPages.length === 0 && (
            <div className="search-no-results">
              No results found for "<strong>{query}</strong>". Try searching by candidate name, skill, or role.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="search-modal-footer">
          <div className="footer-keys-tip">
            <span>Navigation:</span>
            <span className="key-pill">↑</span>
            <span className="key-pill">↓</span>
            <span>Select:</span>
            <span className="key-pill">↵</span>
          </div>
          <span className="footer-ats-tag">TalentFlow Global Search</span>
        </div>
      </div>
    </div>
  );
}
