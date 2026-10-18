import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Award, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  CheckCircle2, 
  ChevronDown,
  Sparkles,
  Filter
} from 'lucide-react';

export default function DashboardView({ 
  analytics, 
  onSelectCandidate, 
  onNavigateToPipeline,
  onNavigateToCandidates,
  onFilterCandidatesByStage
}) {
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeMenuRef = useRef(null);

  // Close calendar dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (timeMenuRef.current && !timeMenuRef.current.contains(event.target)) {
        setShowTimeDropdown(false);
      }
    }
    if (showTimeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimeDropdown]);

  if (!analytics) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <span>Aggregating hiring intelligence metrics...</span>
      </div>
    );
  }

  const {
    total_candidates = 0,
    active_applications = 0,
    open_jobs = 0,
    upcoming_interviews = 0,
    hires = 0,
    stage_counts = {},
    stage_distribution = [],
    conversion_rate = 0,
    needs_attention = {},
    recent_applications = [],
  } = analytics;

  // Real or fallback stages
  const stages = stage_distribution.length > 0 ? stage_distribution : [
    { stage: 'applied', label: 'Applied', count: stage_counts.applied || 0, percentage: 35, color: '#38BDF8' },
    { stage: 'screening', label: 'Screening', count: stage_counts.screening || 0, percentage: 25, color: '#818CF8' },
    { stage: 'interview', label: 'Interview', count: stage_counts.interview || 0, percentage: 20, color: '#FBBF24' },
    { stage: 'offer', label: 'Offer', count: stage_counts.offer || 0, percentage: 10, color: '#6C63FF' },
    { stage: 'hired', label: 'Hired', count: stage_counts.hired || 0, percentage: 10, color: '#34D399' },
  ];

  const rejectedCount = stage_counts.rejected || 0;

  // Safe items for needs attention
  const interviewCount = needs_attention.upcoming_interviews?.count ?? upcoming_interviews;
  const stalledCount = needs_attention.stalled_applications?.count ?? Math.min(3, active_applications);
  const newApplicantsCount = needs_attention.new_applicants?.count ?? (stage_counts.applied || 0);

  return (
    <div className="dashboard-screen-compact">
      {/* 1. Header Bar: Workspace / Overview + Floating Time Filter */}
      <div className="dash-top-header">
        <div className="dash-header-left">
          <div className="dash-title-row">
            <h1 className="dash-main-title">Hiring overview</h1>
            <span className="live-dot-badge">
              <span className="live-dot"></span> Live Pipeline
            </span>

            {/* Time Filter Pill - Safely docked with header title, never overlaps profile dropdown */}
            <div className="time-filter-dropdown-wrap" ref={timeMenuRef}>
              <button 
                className="time-filter-pill"
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                type="button"
                title="Select time period for analytics"
                aria-label="Filter by time period"
              >
                <Calendar size={13} className="text-purple" />
                <span>{timeRange}</span>
                <ChevronDown size={13} className="text-secondary" />
              </button>
              {showTimeDropdown && (
                <div className="time-filter-menu card-box">
                  {['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`time-menu-item ${timeRange === opt ? 'active' : ''}`}
                      onClick={() => {
                        setTimeRange(opt);
                        setShowTimeDropdown(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="dash-main-desc">
            Track progress, identify bottlenecks, and manage applications in real-time.
          </p>
        </div>
      </div>

      {/* 2. 4 Actionable KPI Cards - Distinct Separate Square Containers */}
      <div className="dash-kpi-row">
        {/* Metric 1: Active Applications */}
        <div 
          className="dash-kpi-card card-kpi-purple"
          onClick={() => onNavigateToPipeline && onNavigateToPipeline()}
          title="Click to view full hiring pipeline"
        >
          <div className="kpi-top">
            <span className="kpi-title">Active applications</span>
            <span className="kpi-badge-icon purple"><Users size={15} /></span>
          </div>
          <div className="kpi-number">{active_applications || total_candidates}</div>
          <div className="kpi-subtext">
            <span className="subtext-pill">Current pipeline</span>
            <span className="subtext-detail">{total_candidates} total pool</span>
          </div>
        </div>

        {/* Metric 2: Open Jobs */}
        <div 
          className="dash-kpi-card card-kpi-blue"
          onClick={() => onNavigateToCandidates && onNavigateToCandidates()}
          title="Click to view candidate directory"
        >
          <div className="kpi-top">
            <span className="kpi-title">Open jobs</span>
            <span className="kpi-badge-icon blue"><Briefcase size={15} /></span>
          </div>
          <div className="kpi-number">{open_jobs}</div>
          <div className="kpi-subtext">
            <span className="subtext-pill">Currently recruiting</span>
            <span className="subtext-detail">Active requisitions</span>
          </div>
        </div>

        {/* Metric 3: Upcoming Interviews */}
        <div 
          className="dash-kpi-card card-kpi-amber"
          onClick={() => onFilterCandidatesByStage ? onFilterCandidatesByStage('interview') : onNavigateToPipeline && onNavigateToPipeline()}
          title="Filter candidates in interview stage"
        >
          <div className="kpi-top">
            <span className="kpi-title">Upcoming interviews</span>
            <span className="kpi-badge-icon amber"><Clock size={15} /></span>
          </div>
          <div className="kpi-number">{upcoming_interviews}</div>
          <div className="kpi-subtext">
            <span className="subtext-pill amber">This week</span>
            <span className="subtext-detail">Interviews scheduled</span>
          </div>
        </div>

        {/* Metric 4: Hires */}
        <div 
          className="dash-kpi-card card-kpi-green"
          onClick={() => onFilterCandidatesByStage ? onFilterCandidatesByStage('hired') : onNavigateToPipeline && onNavigateToPipeline()}
          title="Filter hired candidates"
        >
          <div className="kpi-top">
            <span className="kpi-title">Hired</span>
            <span className="kpi-badge-icon green"><Award size={15} /></span>
          </div>
          <div className="kpi-number">{hires}</div>
          <div className="kpi-subtext">
            <span className="subtext-pill green">This month</span>
            <span className="subtext-detail">{conversion_rate}% conversion rate</span>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Pipeline Stage Distribution Panel with Separate Containers */}
      <div className="dash-stage-panel card-box">
        <div className="stage-panel-header">
          <div className="stage-panel-title-wrap">
            <span className="stage-section-title">Applications by stage</span>
            <span className="stage-section-caption">
              Distribution across active stages ({active_applications} active in pipeline)
            </span>
          </div>
          {rejectedCount > 0 && (
            <div className="rejected-summary-tag">
              <span className="rejected-dot"></span>
              <span>{rejectedCount} rejected / archived</span>
            </div>
          )}
        </div>

        {/* Multi-segment Horizontal Progress Bar */}
        <div className="stage-multi-bar">
          {stages.map((st) => {
            const widthPct = Math.max(st.percentage || 0, 4);
            return (
              <div 
                key={st.stage} 
                className="stage-bar-segment"
                style={{ 
                  width: `${widthPct}%`, 
                  backgroundColor: st.color 
                }}
                title={`${st.label}: ${st.count} (${st.percentage}%)`}
              />
            );
          })}
        </div>

        {/* 5 Distinct Stage Container Chips */}
        <div className="stage-chips-row">
          {stages.map((st) => (
            <div 
              key={st.stage} 
              className="stage-chip-item"
              onClick={() => onFilterCandidatesByStage && onFilterCandidatesByStage(st.stage)}
              title={`View ${st.label} candidates`}
            >
              <div className="stage-chip-header">
                <span className="stage-chip-dot" style={{ backgroundColor: st.color }} />
                <span className="stage-chip-name">{st.label}</span>
              </div>
              <div className="stage-chip-numbers">
                <span className="stage-chip-count">{st.count}</span>
                <span className="stage-chip-perc">{st.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Lower Two-Column Section: Needs Attention & Recent Applications */}
      <div className="dash-bottom-grid">
        {/* Left Column: Needs Attention Container */}
        <div className="dash-attention-card card-box">
          <div className="column-card-header">
            <div className="header-text-group">
              <h2 className="column-title">Needs attention</h2>
              <span className="column-subtitle">Action items requiring recruiter decision</span>
            </div>
            <span className="badge-alert-count">
              {interviewCount + stalledCount + newApplicantsCount} items
            </span>
          </div>

          <div className="attention-action-list">
            {/* Action 1: Upcoming interviews */}
            <div 
              className="attention-action-item"
              onClick={() => onFilterCandidatesByStage ? onFilterCandidatesByStage('interview') : onNavigateToPipeline && onNavigateToPipeline()}
            >
              <div className="action-item-icon icon-amber">
                <Clock size={15} />
              </div>
              <div className="action-item-body">
                <div className="action-item-title-row">
                  <span className="action-item-title">Upcoming interviews</span>
                  <span className="action-count-badge amber">{interviewCount} pending</span>
                </div>
                <p className="action-item-desc">Review scheduled interviews and candidate scorecards.</p>
              </div>
              <ArrowRight size={13} className="action-arrow" />
            </div>

            {/* Action 2: Stalled applications */}
            <div 
              className="attention-action-item"
              onClick={() => onNavigateToCandidates && onNavigateToCandidates()}
            >
              <div className="action-item-icon icon-rose">
                <AlertCircle size={15} />
              </div>
              <div className="action-item-body">
                <div className="action-item-title-row">
                  <span className="action-item-title">Stalled applications</span>
                  <span className="action-count-badge rose">{stalledCount} stalled</span>
                </div>
                <p className="action-item-desc">Find applications with no recent stage change in &gt; 3 days.</p>
              </div>
              <ArrowRight size={13} className="action-arrow" />
            </div>

            {/* Action 3: New applicants */}
            <div 
              className="attention-action-item"
              onClick={() => onFilterCandidatesByStage ? onFilterCandidatesByStage('applied') : onNavigateToCandidates && onNavigateToCandidates()}
            >
              <div className="action-item-icon icon-cyan">
                <UserPlus size={15} />
              </div>
              <div className="action-item-body">
                <div className="action-item-title-row">
                  <span className="action-item-title">New applicants</span>
                  <span className="action-count-badge cyan">{newApplicantsCount} new</span>
                </div>
                <p className="action-item-desc">Review newly submitted applications and score resumes.</p>
              </div>
              <ArrowRight size={13} className="action-arrow" />
            </div>
          </div>
        </div>

        {/* Right Column: Recent Applications Container */}
        <div className="dash-recent-card card-box">
          <div className="column-card-header">
            <div className="header-text-group">
              <h2 className="column-title">Recent applications</h2>
              <span className="column-subtitle">Recently submitted candidate profiles</span>
            </div>
            <button 
              className="btn-view-all-link"
              onClick={() => onNavigateToCandidates && onNavigateToCandidates()}
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="recent-candidates-list">
            {recent_applications.length === 0 ? (
              <div className="empty-recent-state">No recent candidates found.</div>
            ) : (
              recent_applications.slice(0, 3).map((cand) => (
                <div 
                  key={cand.id} 
                  className="recent-candidate-row"
                  onClick={() => onSelectCandidate && onSelectCandidate(cand.id)}
                  title="Click to view candidate profile"
                >
                  <div className="cand-avatar-pill">
                    {cand.initials || 'CD'}
                  </div>
                  <div className="cand-main-info">
                    <span className="cand-name">{cand.name}</span>
                    <span className="cand-role">{cand.role}</span>
                  </div>
                  <div className="cand-meta-right">
                    <span className={`stage-tag-badge stage-${cand.stage}`}>
                      {cand.stage}
                    </span>
                    {cand.ats_score && (
                      <span className="ats-score-mini">
                        {cand.ats_score}% match
                      </span>
                    )}
                    <span className="cand-updated-time" title="Last update date for application">
                      Upd: {cand.last_updated || cand.created_at}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
