import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Users, 
  Code2, 
  BarChart3, 
  PenTool, 
  Server, 
  Database, 
  Search, 
  Plus, 
  FileText, 
  MoreVertical, 
  SlidersHorizontal, 
  ChevronRight, 
  ArrowUpDown,
  Home,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Eye,
  Trash2,
  ArrowRight,
  Award,
  AlertCircle,
  FileCheck2,
  ChevronLeft,
  XCircle,
  Square
} from 'lucide-react';

const STAGES = [
  { 
    id: 'applied', 
    label: 'Applied', 
    subtext: 'Initial application received', 
    color: '#38BDF8', 
    bg: 'rgba(56, 189, 248, 0.12)', 
    border: 'rgba(56, 189, 248, 0.25)',
    icon: FileText
  },
  { 
    id: 'screening', 
    label: 'Screening', 
    subtext: 'Resume/initial screening', 
    color: '#818CF8', 
    bg: 'rgba(129, 140, 248, 0.12)', 
    border: 'rgba(129, 140, 248, 0.25)',
    icon: Users
  },
  { 
    id: 'interview', 
    label: 'Interview', 
    subtext: 'In interview process', 
    color: '#FBBF24', 
    bg: 'rgba(251, 191, 36, 0.12)', 
    border: 'rgba(251, 191, 36, 0.25)',
    icon: Clock
  },
  { 
    id: 'offer', 
    label: 'Offer', 
    subtext: 'Offer extended', 
    color: '#6C63FF', 
    bg: 'rgba(108, 99, 255, 0.12)', 
    border: 'rgba(108, 99, 255, 0.25)',
    icon: Award
  },
  { 
    id: 'hired', 
    label: 'Hired', 
    subtext: 'Successfully onboarded', 
    color: '#34D399', 
    bg: 'rgba(52, 211, 153, 0.12)', 
    border: 'rgba(52, 211, 153, 0.25)',
    icon: CheckCircle2
  },
  { 
    id: 'rejected', 
    label: 'Rejected', 
    subtext: 'Not moving forward', 
    color: '#FB7185', 
    bg: 'rgba(251, 113, 133, 0.12)', 
    border: 'rgba(251, 113, 133, 0.25)',
    icon: XCircle
  },
];

// Helper to pick skill tags based on candidate role
const getSkillsForRole = (roleStr, candSkills) => {
  if (candSkills && candSkills.length > 0) return candSkills.slice(0, 3);
  const r = (roleStr || '').toLowerCase();
  if (r.includes('frontend') || r.includes('front-end')) return ['React', 'TypeScript', 'CSS3'];
  if (r.includes('backend') || r.includes('back-end')) return ['Python', 'Django', 'PostgreSQL'];
  if (r.includes('software') || r.includes('engineer') || r.includes('full-stack')) return ['Python', 'Django', 'React'];
  if (r.includes('product') || r.includes('manager')) return ['Product Strategy', 'Agile', 'Roadmapping'];
  if (r.includes('analyst') || r.includes('data')) return ['SQL', 'Python', 'Tableau'];
  if (r.includes('design') || r.includes('ui') || r.includes('ux')) return ['Figma', 'UI/UX', 'Design Systems'];
  if (r.includes('devops') || r.includes('infrastructure') || r.includes('cloud')) return ['AWS', 'Kubernetes', 'Docker'];
  return ['Communication', 'Problem Solving', 'Git'];
};

// Deterministic avatar background colors matching screenshot
const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#0ea5e9', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#6366f1', // indigo
  '#f43f5e', // rose
  '#14b8a6', // teal
];

const getAvatarBg = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

// Map role string to an appropriate icon
const getRoleIcon = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('software') || t.includes('engineer') || t.includes('frontend')) return Code2;
  if (t.includes('analyst') || t.includes('product')) return BarChart3;
  if (t.includes('design') || t.includes('ui') || t.includes('ux')) return PenTool;
  if (t.includes('backend') || t.includes('infrastructure') || t.includes('devops')) return Server;
  if (t.includes('data') || t.includes('scientist')) return Database;
  return Users;
};

export default function PipelineKanbanView({ 
  candidates = [], 
  jobs = [],
  onSelectCandidate, 
  onOpenStageModal,
  onOpenAddCandidate
}) {
  // Primary stage selection: 'all' or 'applied', 'screening', 'interview', 'offer', 'hired', 'rejected'
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedRoleTab, setSelectedRoleTab] = useState('all');
  const [searchPipelineQuery, setSearchPipelineQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  // Close card action menu on outside click
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

  // Count candidates per stage
  const stageStats = useMemo(() => {
    const counts = { all: candidates.length, applied: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0 };
    candidates.forEach((c) => {
      if (counts[c.current_stage] !== undefined) {
        counts[c.current_stage]++;
      }
    });
    return counts;
  }, [candidates]);

  // Aggregate available role tabs from candidates
  const roleTabs = useMemo(() => {
    const tabs = [
      { id: 'all', title: 'All Roles', count: candidates.length, icon: Users }
    ];

    const roleCounts = {};
    candidates.forEach(c => {
      const r = c.applied_role || 'Other';
      roleCounts[r] = (roleCounts[r] || 0) + 1;
    });

    const priorityRoles = [
      'Software Engineer',
      'Product Analyst',
      'UI/UX Designer',
      'Backend Developer',
      'Data Scientist'
    ];

    priorityRoles.forEach(r => {
      tabs.push({
        id: r,
        title: r,
        count: roleCounts[r] || 0,
        icon: getRoleIcon(r)
      });
    });

    Object.keys(roleCounts).forEach(r => {
      if (!priorityRoles.includes(r) && r !== 'Other') {
        tabs.push({
          id: r,
          title: r,
          count: roleCounts[r],
          icon: getRoleIcon(r)
        });
      }
    });

    return tabs;
  }, [candidates]);

  // Filter candidates by role, stage, and search query
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      // Role tab match
      const roleStr = (c.applied_role || '').toLowerCase();
      const targetRole = selectedRoleTab.toLowerCase();

      let matchesRole = false;
      if (selectedRoleTab === 'all') {
        matchesRole = true;
      } else if (targetRole === 'software engineer') {
        matchesRole = roleStr.includes('software') || roleStr.includes('engineer') || roleStr.includes('frontend') || roleStr.includes('full stack');
      } else if (targetRole === 'backend developer') {
        matchesRole = roleStr.includes('backend') || (roleStr.includes('developer') && !roleStr.includes('frontend'));
      } else if (targetRole === 'product analyst') {
        matchesRole = roleStr.includes('analyst') || roleStr.includes('product');
      } else if (targetRole === 'ui/ux designer') {
        matchesRole = roleStr.includes('design') || roleStr.includes('ui') || roleStr.includes('ux');
      } else if (targetRole === 'data scientist') {
        matchesRole = roleStr.includes('data') || roleStr.includes('scientist');
      } else {
        matchesRole = roleStr === targetRole;
      }

      // Stage match (only if viewing single stage)
      const matchesStage = selectedStage === 'all' || c.current_stage === selectedStage;

      // Search match
      const q = (searchPipelineQuery || '').toLowerCase().trim();
      const matchesSearch = !q || 
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.applied_role?.toLowerCase().includes(q);

      return matchesRole && matchesStage && matchesSearch;
    });
  }, [candidates, selectedRoleTab, selectedStage, searchPipelineQuery]);

  // Selected stage metadata
  const currentStageMeta = STAGES.find(s => s.id === selectedStage) || {
    id: 'all',
    label: 'All Stages',
    subtext: 'Complete recruitment pipeline across all stages',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.12)',
    border: 'rgba(167, 139, 250, 0.25)',
    icon: Layers
  };

  // Format date helper
  const formatAppDate = (dateStr) => {
    if (!dateStr) return 'Oct 15, 2026';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  return (
    <div className="pipeline-ref-page animate-fade-in">
      {/* 1. Header Breadcrumbs */}
      <div className="pipeline-breadcrumb-row">
        <Home size={14} className="pipeline-crumb-icon" />
        <span className="pipeline-crumb-link">Recruitment</span>
        <span className="pipeline-crumb-sep">&gt;</span>
        <span className="pipeline-crumb-current">Hiring Pipeline</span>
      </div>

      {/* 2. Top Header with Title, Search & Quick Action */}
      <div className="pipeline-top-header-row">
        <div className="pipeline-header-left">
          <h1 className="pipeline-main-title">Hiring Pipeline</h1>
          <p className="pipeline-main-subtitle">
            Click on any stage container below to view its candidate details and manage transitions.
          </p>
        </div>

        <div className="pipeline-header-controls">
          {/* Pipeline Search */}
          <div className="pipeline-search-box">
            <Search size={15} className="pipeline-search-icon" />
            <input
              type="text"
              placeholder="Search candidate name, role, email..."
              value={searchPipelineQuery}
              onChange={(e) => setSearchPipelineQuery(e.target.value)}
              className="pipeline-search-input"
            />
          </div>

          {/* Quick Add Candidate */}
          <button 
            className="btn-primary-purple square-btn"
            onClick={onOpenAddCandidate}
            title="Add candidate to pipeline"
          >
            <Plus size={15} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* 3. Role Filter Row */}
      <div className="pipeline-roles-filter-bar">
        <span className="filter-label">Filter Role:</span>
        <div className="pipeline-roles-pills">
          {roleTabs.map(tab => (
            <button
              key={tab.id}
              className={`role-pill-btn ${selectedRoleTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedRoleTab(tab.id)}
            >
              <span>{tab.title}</span>
              <span className="role-pill-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. SQUARE STAGE CONTAINERS (Applied, Screening, Interview, Offer, Hired, Rejected) */}
      <div className="pipeline-stage-squares-section">
        <div className="stage-squares-grid">
          {/* All Stages Square */}
          <div 
            className={`stage-square-card ${selectedStage === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStage('all')}
            style={{ '--stage-accent': '#A78BFA' }}
          >
            <div className="square-card-header">
              <div className="square-icon-wrap" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
                <Layers size={18} />
              </div>
              <span className="square-count-chip" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
                {stageStats.all}
              </span>
            </div>
            <div className="square-card-body">
              <h3 className="square-stage-name">All Stages</h3>
              <p className="square-stage-desc">Full candidate pool</p>
            </div>
            <div className="square-card-footer">
              {selectedStage === 'all' ? (
                <span className="active-badge-indicator" style={{ color: '#A78BFA' }}>● Active View</span>
              ) : (
                <span className="tap-hint">Tap to view</span>
              )}
            </div>
          </div>

          {/* Individual Stages Squares: Applied, Screening, Interview, Offer, Hired, Rejected */}
          {STAGES.map((st) => {
            const Icon = st.icon;
            const count = stageStats[st.id] || 0;
            const isActive = selectedStage === st.id;

            return (
              <div 
                key={st.id}
                className={`stage-square-card ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedStage(st.id)}
                style={{ '--stage-accent': st.color }}
              >
                <div className="square-card-header">
                  <div className="square-icon-wrap" style={{ background: st.bg, color: st.color }}>
                    <Icon size={18} />
                  </div>
                  <span className="square-count-chip" style={{ background: st.bg, color: st.color }}>
                    {count}
                  </span>
                </div>

                <div className="square-card-body">
                  <h3 className="square-stage-name">{st.label}</h3>
                  <p className="square-stage-desc">{st.subtext}</p>
                </div>

                <div className="square-card-footer">
                  {isActive ? (
                    <span className="active-badge-indicator" style={{ color: st.color }}>
                      ● Active View
                    </span>
                  ) : (
                    <span className="tap-hint">Tap to view</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. DATA SECTION: Stage candidate details and transitions */}
      <div className="pipeline-stage-data-container card-box animate-fade-in">
          {/* Data Section Header */}
          <div className="stage-data-banner" style={{ borderLeftColor: currentStageMeta.color }}>
            <div className="banner-left">
              <div className="banner-title-row">
                <span className="stage-status-dot" style={{ backgroundColor: currentStageMeta.color }}></span>
                <h2 className="banner-stage-heading">{currentStageMeta.label} Pipeline Data</h2>
                <span className="banner-candidate-badge" style={{ background: currentStageMeta.bg, color: currentStageMeta.color }}>
                  {filteredCandidates.length} Candidates
                </span>
              </div>
              <p className="banner-stage-subtitle">
                {currentStageMeta.subtext} {selectedRoleTab !== 'all' ? `• Filtered for ${selectedRoleTab}` : ''}
              </p>
            </div>

            <div className="banner-right">
              <button 
                className="btn-add-cand-stage"
                onClick={onOpenAddCandidate}
              >
                <Plus size={14} />
                <span>Add to {currentStageMeta.label}</span>
              </button>
            </div>
          </div>

          {/* Candidate Cards Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="pipeline-empty-state card-box">
              <div className="empty-state-icon" style={{ color: currentStageMeta.color }}>
                <Users size={32} />
              </div>
              <h3 className="empty-state-title">No candidates found in {currentStageMeta.label}</h3>
              <p className="empty-state-desc">
                {searchPipelineQuery 
                  ? `No applicants matched "${searchPipelineQuery}". Try adjusting your search query.`
                  : `Currently there are no candidates assigned to the ${currentStageMeta.label} stage with the selected filters.`}
              </p>
              <button 
                className="btn-primary-purple square-btn"
                onClick={onOpenAddCandidate}
              >
                <Plus size={15} />
                <span>Add Candidate to {currentStageMeta.label}</span>
              </button>
            </div>
          ) : (
            <div className="stage-candidates-grid">
              {filteredCandidates.map((cand) => {
                const skills = getSkillsForRole(cand.applied_role, cand.skills_list);
                const stConfig = STAGES.find(s => s.id === cand.current_stage) || currentStageMeta;

                return (
                  <div 
                    key={cand.id} 
                    className="pipeline-rich-card card-box"
                    onClick={() => onSelectCandidate(cand.id)}
                  >
                    {/* Card Top: Avatar, Name, Role, Stage Dot */}
                    <div className="cand-rich-top">
                      <div 
                        className="cand-rich-avatar"
                        style={{ backgroundColor: getAvatarBg(cand.full_name) }}
                      >
                        {cand.first_name ? cand.first_name.charAt(0) : 'C'}
                        {cand.last_name ? cand.last_name.charAt(0) : ''}
                      </div>

                      <div className="cand-rich-details">
                        <div className="cand-rich-name-row">
                          <h4 className="cand-rich-name">{cand.full_name}</h4>
                          <span 
                            className="cand-stage-pill"
                            style={{ backgroundColor: stConfig.bg, color: stConfig.color, borderColor: stConfig.border }}
                          >
                            <span className="dot-mini" style={{ backgroundColor: stConfig.color }}></span>
                            {stConfig.label}
                          </span>
                        </div>
                        <span className="cand-rich-role">{cand.applied_role}</span>
                      </div>
                    </div>

                    {/* Metadata: Date, ATS Match Score */}
                    <div className="cand-rich-meta-row">
                      <div className="cand-date-info">
                        <Clock size={12} className="meta-icon" />
                        <span>{formatAppDate(cand.created_at)}</span>
                        <span className="meta-sep">•</span>
                        <span className="meta-rel">{getRelativeTime(cand.created_at)}</span>
                      </div>

                      <div className="cand-ats-score-chip">
                        <Sparkles size={11} className="text-amber" />
                        <span>{cand.ats_score || 88}% ATS Match</span>
                      </div>
                    </div>

                    {/* Skill Badges */}
                    <div className="cand-rich-skills-row">
                      {skills.slice(0, 3).map((skill, sIdx) => (
                        <span key={sIdx} className="cand-skill-badge">
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="cand-skill-more">+{skills.length - 3}</span>
                      )}
                    </div>

                    {/* Contact info: Email */}
                    <div className="cand-rich-contact-row">
                      <span className="cand-email-text">{cand.email}</span>
                      {cand.phone && <span className="cand-phone-text">{cand.phone}</span>}
                    </div>

                    {/* Card Footer: View Resume, Move Stage, View Profile */}
                    <div className="cand-rich-footer" onClick={(e) => e.stopPropagation()}>
                      <a 
                        href={cand.resume_url || '#'}
                        target={cand.resume_url ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="cand-footer-resume-link"
                        onClick={(e) => {
                          if (!cand.resume_url) {
                            e.preventDefault();
                            onSelectCandidate(cand.id);
                          }
                        }}
                      >
                        <FileText size={13} />
                        <span>View Resume</span>
                      </a>

                      <div className="cand-footer-actions">
                        <button 
                          className="btn-action-move-stage"
                          onClick={() => onOpenStageModal(cand, cand.current_stage)}
                          title="Move candidate to different stage"
                        >
                          <Layers size={13} />
                          <span>Move Stage</span>
                        </button>

                        <button 
                          className="btn-action-view-details"
                          onClick={() => onSelectCandidate(cand.id)}
                          title="View full candidate profile & audit notes"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
}
